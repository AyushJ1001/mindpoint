import { auth } from "@clerk/nextjs/server";
import { forbidden, redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminConvexGate } from "@/components/admin/AdminConvexGate";
import { hasAdminAccess } from "@/lib/admin-access";
import { resolveAuthEmail } from "@/lib/clerk-email";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        </div>
      </div>
    );
  }

  if (!canAccessAdmin) {
    forbidden();
  }

  return (
    <AdminSidebar>
      <AdminConvexGate>{children}</AdminConvexGate>
    </AdminSidebar>
  );
}
