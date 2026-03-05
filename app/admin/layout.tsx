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
  const canAccessAdmin = await hasAdminAccess(
    userId,
    sessionEmail,
    convexToken,
  );

  if (!canAccessAdmin) {
    forbidden();
  }

  return (
    <AdminSidebar>
      <AdminConvexGate>{children}</AdminConvexGate>
    </AdminSidebar>
  );
}
