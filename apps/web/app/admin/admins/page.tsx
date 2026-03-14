"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@mindpoint/backend/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminManagersPage() {
  const [search, setSearch] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminNote, setNewAdminNote] = useState("");
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [removeTargetKey, setRemoveTargetKey] = useState<string | null>(null);
  const [removeReason, setRemoveReason] = useState("Access no longer required");

  const data = useQuery(api.adminManagers.listAdmins, {
    search: search || undefined,
    limit: 500,
  });
  const addAdmin = useMutation(api.adminManagers.addAdminByEmail);
  const removeAdmin = useMutation(api.adminManagers.removeAdmin);

  const rows = useMemo(() => data?.admins ?? [], [data]);
  const viewerAdminId = data?.viewerAdminId;
  const viewerAdminEmail = data?.viewerAdminEmail;

  const handleAddAdmin = async () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Email is required");
      return;
    }

    setLoadingEmail(email);
    try {
      await addAdmin({
        email,
        name: newAdminName.trim() || undefined,
        note: newAdminNote.trim() || undefined,
      });
      toast.success("Admin access granted");
      setNewAdminEmail("");
      setNewAdminName("");
      setNewAdminNote("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add admin",
      );
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!removeTargetKey) return;
    setLoadingEmail(removeTargetKey);
    try {
      await removeAdmin({
        email: removeTargetKey,
        reason: removeReason.trim() || undefined,
      });
      toast.success("Admin access removed");
      setRemoveTargetKey(null);
      setRemoveReason("Access no longer required");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove admin",
      );
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Admin Manager"
        description="Grant and revoke admin access via connected email."
      />

      <div className="mb-6 rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Grant Admin Access
        </h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            type="email"
            placeholder="Connected Email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
          />
          <Input
            placeholder="Admin Name"
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
          />
          <Input
            placeholder="Note (optional)"
            value={newAdminNote}
            onChange={(e) => setNewAdminNote(e.target.value)}
          />
          <Button
            onClick={handleAddAdmin}
            disabled={
              !newAdminEmail.trim() ||
              loadingEmail === newAdminEmail.trim().toLowerCase()
            }
          >
            {loadingEmail === newAdminEmail.trim().toLowerCase()
              ? "Saving..."
              : "Add Admin"}
          </Button>
        </div>
      </div>

      <div className="mb-4 max-w-md">
        <Input
          placeholder="Search by name, email, note"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
            <tr>
              <th className="px-3 py-2">Admin</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!data ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={5}>
                  Loading admins...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={5}>
                  No admins found.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const rowEmail = row.adminEmail?.toLowerCase();
                const rowRemovalKey = rowEmail ?? row.clerkUserId ?? row.key;
                const isSelf =
                  (viewerAdminEmail && rowEmail
                    ? viewerAdminEmail === rowEmail
                    : false) ||
                  (!!row.clerkUserId && viewerAdminId === row.clerkUserId);
                const canRemove = row.isDatabaseAdmin && !isSelf;
                const isBusy = loadingEmail === rowRemovalKey;

                return (
                  <tr key={row.key} className="border-t">
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {row.adminName}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {row.adminEmail || "-"}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={row.hasAccess ? "default" : "outline"}>
                        {row.hasAccess ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {row.note || "-"}
                    </td>
                    <td className="px-3 py-2">
                      {canRemove ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => setRemoveTargetKey(rowRemovalKey)}
                        >
                          {isBusy ? "Removing..." : "Remove"}
                        </Button>
                      ) : isSelf ? (
                        <p className="text-xs text-slate-500">
                          Current session admin
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          No active DB access
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!removeTargetKey}
        onOpenChange={(open) => {
          if (!open) {
            setRemoveTargetKey(null);
            setRemoveReason("Access no longer required");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Admin Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Provide a reason for removing admin access from{" "}
              <strong>{removeTargetKey}</strong>.
            </p>
            <Input
              placeholder="Reason"
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRemoveTargetKey(null);
                setRemoveReason("Access no longer required");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={
                !removeTargetKey ||
                loadingEmail === removeTargetKey ||
                !removeReason.trim()
              }
              onClick={handleRemoveAdmin}
            >
              {removeTargetKey && loadingEmail === removeTargetKey
                ? "Removing..."
                : "Confirm Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
