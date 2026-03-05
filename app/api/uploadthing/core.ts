import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { hasAdminAccess } from "@/lib/admin-access";
import { resolveAuthEmail } from "@/lib/clerk-email";

const f = createUploadthing();

async function adminMiddleware() {
  const { userId, sessionClaims, getToken } = await auth();
  const sessionEmail = await resolveAuthEmail(sessionClaims);
  const convexToken = await getToken({ template: "convex" });

  if (!(await hasAdminAccess(userId, sessionEmail, convexToken))) {
    throw new UploadThingError("Unauthorized");
  }

  return { userId };
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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
