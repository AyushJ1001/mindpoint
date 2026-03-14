"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { downloadCsv, toCsv } from "@/lib/csv";

export default function AdminAuditLogPage() {
  const [search, setSearch] = useState("");

  const logs = useQuery(api.adminAudit.listAuditLogs, {
    search: search || undefined,
    limit: 500,
  });

  const exportRows = useMemo(
    () =>
      (logs || []).map((row) => ({
        id: row._id,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        actorAdminId: row.actorAdminId,
        actorEmail: row.actorEmail,
        createdAt: new Date(row.createdAt).toISOString(),
      })),
    [logs],
  );

  return (
    <div>
      <AdminPageHeader
        title="Audit Log"
        description="Immutable operational timeline of all admin mutations."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              downloadCsv(
                `admin-audit-${new Date().toISOString().slice(0, 10)}.csv`,
                toCsv(exportRows),
              )
            }
          >
            Export CSV
          </Button>
        }
      />

      <div className="mb-4 max-w-md">
        <Input
          placeholder="Search actions, entity, actor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
            <tr>
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Entity</th>
              <th className="px-3 py-2">Actor</th>
            </tr>
          </thead>
          <tbody>
            {!logs ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={4}>
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={4}>
                  No audit events found.
                </td>
              </tr>
            ) : (
              logs.map((row) => (
                <tr key={row._id} className="border-t">
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {row.action}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {row.entityType} • {row.entityId}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {row.actorEmail || row.actorAdminId}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
