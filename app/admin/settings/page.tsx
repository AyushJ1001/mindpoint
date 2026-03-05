import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const settingsRows = [
  {
    key: "NEXT_PUBLIC_CONVEX_URL",
    configured: !!process.env.NEXT_PUBLIC_CONVEX_URL,
    note: "Convex endpoint for admin queries/mutations",
  },
  {
    key: "CLERK_SECRET_KEY",
    configured: !!process.env.CLERK_SECRET_KEY,
    note: "Required for authenticated admin sessions",
  },
  {
    key: "UPLOADTHING_SECRET",
    configured: !!process.env.UPLOADTHING_SECRET,
    note: "Required for secure admin media/file uploads",
  },
  {
    key: "GOOGLE_SHEETS_SPREADSHEET_ID",
    configured: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    note: "Enrollment sync side effects for manual admin enrollments",
  },
];

export default function AdminSettingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Read-only operational configuration checks for admin runtime."
      />

      <Card>
        <CardHeader>
          <CardTitle>Environment Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {settingsRows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div>
                  <p className="font-medium text-slate-900">{row.key}</p>
                  <p className="text-xs text-slate-600">{row.note}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    row.configured
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {row.configured ? "Configured" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
