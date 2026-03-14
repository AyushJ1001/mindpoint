"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadCsv, toCsv } from "@/lib/csv";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const users = useQuery(api.adminUsers.listUsers, {
    search: search || undefined,
    limit: 500,
  });

  const rows = useMemo(() => users ?? [], [users]);

  const exportRows = useMemo(
    () =>
      rows.map((row) => ({
        userKey: row.userKey,
        userId: row.userId,
        kind: row.kind,
        displayName: row.displayName,
        email: row.email,
        phone: row.phone,
        enrollmentCount: row.enrollmentCount,
        activeEnrollmentCount: row.activeEnrollmentCount,
        mindPointsBalance: row.mindPointsBalance,
      })),
    [rows],
  );

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Hybrid directory covering registered and guest users with operational metrics."
        actions={
          <Button
            variant="outline"
            onClick={() =>
              downloadCsv(
                `admin-users-${new Date().toISOString().slice(0, 10)}.csv`,
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
          placeholder="Search by name, id, email, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Enrollments</th>
              <th className="px-3 py-2">Points</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!users ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={5}>
                  Loading users...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={5}>
                  No users found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.userKey} className="border-t">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">
                      {row.displayName || row.userId}
                    </p>
                    <p className="text-xs text-slate-600">
                      {row.email || row.userId}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{row.kind}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    {row.activeEnrollmentCount}/{row.enrollmentCount}
                  </td>
                  <td className="px-3 py-2">{row.mindPointsBalance ?? 0}</td>
                  <td className="px-3 py-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/admin/users/${encodeURIComponent(row.userKey)}`}
                      >
                        View
                      </Link>
                    </Button>
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
