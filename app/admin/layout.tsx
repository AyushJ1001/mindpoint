import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminConvexGate } from "@/components/admin/AdminConvexGate";
import { isAdminUserId } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  if (!isAdminUserId(userId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-lg rounded-xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Forbidden</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your account does not have permission to access the admin panel.
          </p>
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
