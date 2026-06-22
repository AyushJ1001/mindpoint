import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { hasAdminAccess } from "@/lib/admin-access";
import { resolveAuthEmail } from "@/lib/clerk-email";
import { isClerkServerConfigured } from "@/lib/clerk-env";
import { uploadRatelimit } from "@/lib/rate-limit";

const f = createUploadthing();

async function adminMiddleware() {
  if (!isClerkServerConfigured()) {
    throw new UploadThingError("Unauthorized");
  }

  const { userId, sessionClaims, getToken } = await auth();
  const sessionEmail = await resolveAuthEmail(sessionClaims);
  const convexToken = await getToken({ template: "convex" });

  if (!(await hasAdminAccess(userId, sessionEmail, convexToken))) {
    throw new UploadThingError("Unauthorized");
  }

  const uploaderId = userId ?? sessionEmail;
  if (!uploaderId) {
    throw new UploadThingError("Unauthorized");
  }

  return { userId: uploaderId };
}

// Buyers upload a payment screenshot during checkout, so this route only
// requires an authenticated Clerk user (not admin access).
async function authenticatedUserMiddleware() {
  if (!isClerkServerConfigured()) {
    throw new UploadThingError("Unauthorized");
  }

  const { userId, sessionClaims } = await auth();
  const sessionEmail = await resolveAuthEmail(sessionClaims);
  const uploaderId = userId ?? sessionEmail;
  if (!uploaderId) {
    throw new UploadThingError("Unauthorized");
  }

  // Cap per-user upload spam on this non-admin route. No-ops when Redis is
  // unconfigured; never blocks a legitimate buyer within the limit.
  const { success } = await uploadRatelimit.limit(uploaderId);
  if (!success) {
    throw new UploadThingError("Too many uploads. Please wait and try again.");
  }

  return { userId: uploaderId };
}

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(adminMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
      };
    }),

  courseImageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 6,
    },
  })
    .middleware(adminMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
      };
    }),

  worksheetPdfUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(adminMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
      };
    }),

  paymentScreenshotUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(authenticatedUserMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
