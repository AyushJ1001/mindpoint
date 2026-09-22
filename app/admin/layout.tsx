import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminConvexGate } from "@/components/admin/AdminConvexGate";
import { AdminRetryButton } from "@/components/admin/AdminRetryButton";
import { hasAdminAccess } from "@/lib/admin-access";
import { isAdminDevBypassEnabled } from "@/lib/admin-dev-bypass";
import { resolveAuthEmail } from "@/lib/clerk-email";
import { isClerkServerConfigured } from "@/lib/clerk-env";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminDevBypassEnabled = isAdminDevBypassEnabled();

  if (adminDevBypassEnabled) {
    return (
      <AdminSidebar>
        <AdminConvexGate bypassAdminAuth>{children}</AdminConvexGate>
      </AdminSidebar>
    );
  }

  if (!isClerkServerConfigured()) {
    redirect("/");
  }

  const { userId, sessionClaims, getToken } = await auth();
  const sessionEmail = await resolveAuthEmail(sessionClaims);

  if (!userId && !sessionEmail) {
    redirect("/");
  }

  const convexToken = await getToken({ template: "convex" });
  let canAccessAdmin = false;
  try {
    canAccessAdmin = await hasAdminAccess(userId, sessionEmail, convexToken);
  } catch (error) {
    console.error("Admin access check failed:", error);
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-6">
        <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Admin access is temporarily unavailable
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            The admin access check could not be completed. Please refresh and
            try again in a moment.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <AdminRetryButton />
            <Link
              href="/"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!canAccessAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-6">
        <div className="rounded-3xl border border-[#c7ddd7] bg-[#fffaf0] p-8 text-center shadow-[0_20px_55px_rgba(0,62,65,0.11)]">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#0c6f73] uppercase">
            Administrator access
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold text-[#003f43]">
            Your sign-in worked.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#58706d]">
            This account is not registered as a The Mind Point administrator.
            Sign in with the administrator account or ask an existing
            administrator to add this email.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[#0c6f73] px-5 py-2.5 text-sm font-semibold text-[#fffaf0] transition hover:bg-[#07575b]"
          >
            Back to The Mind Point
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminSidebar>
      <AdminConvexGate>{children}</AdminConvexGate>
    </AdminSidebar>
  );
}
