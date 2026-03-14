import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const settingsRows = [
    {
      key: "NEXT_PUBLIC_CONVEX_URL",
      label: "Convex Admin Backend",
      configured: !!process.env.NEXT_PUBLIC_CONVEX_URL,
      note: "Admin queries and mutations can reach the Convex backend.",
    },
    {
      key: "GOOGLE_SHEETS_SPREADSHEET_ID",
      label: "Enrollment Sync",
      configured: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      note: "Manual enrollment side effects can sync to the configured sheet.",
    },
  ];

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
          <p className="mb-3 text-xs text-slate-600">
            Sensitive server-secret checks are intentionally omitted from this
            page.
          </p>
          <div className="space-y-2 text-sm">
            {settingsRows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div>
                  <p className="font-medium text-slate-900">{row.label}</p>
                  <p className="font-mono text-[11px] text-slate-500">
                    {row.key}
                  </p>
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
