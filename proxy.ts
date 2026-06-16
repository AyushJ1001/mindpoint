import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isClerkServerConfigured } from "@/lib/config/server";
import { NextResponse, NextRequest, type NextFetchEvent } from "next/server";
import { isAdminDevBypassEnabled } from "@/lib/admin-dev-bypass";

const isProtectedRoute = createRouteMatcher(["/server"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Only use Clerk auth handling if keys are available.
const proxyHandler = isClerkServerConfigured()
  ? clerkMiddleware(async (auth, req) => {
      // Handle redirects for legacy routes
      if (req.nextUrl.pathname === "/terms") {
        return NextResponse.redirect(new URL("/toc", req.url));
      }

      if (isProtectedRoute(req)) await auth.protect();
      if (isAdminRoute(req) && !isAdminDevBypassEnabled()) {
        await auth.protect();
      }
    })
  : (req: NextRequest) => {
      // Fallback proxy behavior when Clerk keys are not available.
      if (req.nextUrl.pathname === "/terms") {
        return NextResponse.redirect(new URL("/toc", req.url));
      }
      if (
        req.nextUrl.pathname.startsWith("/admin") &&
        !isAdminDevBypassEnabled()
      ) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    };

export function proxy(req: NextRequest, event: NextFetchEvent) {
  return proxyHandler(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|sitemap|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
