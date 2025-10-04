import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/server"]);

// Only use Clerk middleware if keys are available
const middleware =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
    ? clerkMiddleware(async (auth, req) => {
        // Handle redirects for legacy routes
        if (req.nextUrl.pathname === "/terms") {
          return NextResponse.redirect(new URL("/toc", req.url));
        }

        if (isProtectedRoute(req)) await auth.protect();
      })
    : (req: NextRequest) => {
        // Fallback middleware when Clerk keys are not available
        if (req.nextUrl.pathname === "/terms") {
          return NextResponse.redirect(new URL("/toc", req.url));
        }
        return NextResponse.next();
      };

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|sitemap|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
