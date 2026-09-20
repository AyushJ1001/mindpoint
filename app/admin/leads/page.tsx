"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/backend/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminTimeZone } from "@/components/admin/AdminTimeZoneProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminLeadsPage() {
  const { formatTimestamp } = useAdminTimeZone();
  const [search, setSearch] = useState("");
  const [consentOnly, setConsentOnly] = useState(false);

  const data = useQuery(api.adminLeads.listLeads, {
    search: search.trim() || undefined,
    consentOnly: consentOnly || undefined,
    limit: 200,
  });

  const leads = data?.leads ?? [];

  const exportCsv = () => {
    const header = [
      "email",
      "name",
      "phone",
      "city",
      "educationStatus",
      "interest",
      "source",
      "marketingConsent",
      "consentAt",
      "createdAt",
    ];
    const escape = (value: unknown) => {
      const text = value === undefined || value === null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };
    const lines = [
      header.join(","),
      ...leads.map((lead) =>
        [
          lead.email,
          lead.name,
          lead.phone,
          lead.city,
          lead.educationStatus,
          lead.interest,
          lead.source,
          lead.marketingConsent ? "yes" : "no",
          lead.consentAt ? new Date(lead.consentAt).toISOString() : "",
          new Date(lead.createdAt).toISOString(),
        ]
          .map(escape)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mindpoint-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminPageHeader
        title="Leads"
        description="Emails captured from the free masterclass, resource and join forms, with their marketing consent."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={exportCsv}
            disabled={leads.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, name, phone, city or message"
              className="pl-9"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={consentOnly}
              onChange={(e) => setConsentOnly(e.target.checked)}
              className="accent-slate-900"
            />
            Marketing consent only
          </label>
        </CardContent>
      </Card>

      {data === undefined ? (
        <p className="text-sm text-slate-500">Loading leads…</p>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No leads yet. They will appear here as visitors submit the
            storefront forms.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Phone</th>
                  <th className="py-3 pr-4 font-medium">Source</th>
                  <th className="py-3 pr-4 font-medium">Consent</th>
                  <th className="py-3 font-medium">Captured</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {lead.email}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {lead.name ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {lead.phone ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary">{lead.source}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      {lead.marketingConsent ? (
                        <Badge className="bg-emerald-600 text-white">
                          Consent
                        </Badge>
                      ) : (
                        <Badge variant="outline">No consent</Badge>
                      )}
                    </td>
                    <td className="py-3 text-slate-600">
                      {formatTimestamp(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.hasMore && (
              <p className="mt-4 text-xs text-slate-500">
                Showing the latest {leads.length}. Refine your search to narrow
                the list.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
