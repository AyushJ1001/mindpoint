"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminUserDetailPage() {
  const params = useParams<{ userKey: string }>();
  const userKey = useMemo(() => decodeURIComponent(params.userKey), [params.userKey]);

  const detail = useQuery(api.adminUsers.getUserDetail, { userKey });
  const updateUser = useMutation(api.adminUsers.updateUserAppData);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!detail || initialized) return;
    setDisplayName(
      detail.kind === "guest"
        ? detail.guestUser?.name ?? ""
        : detail.enrollments[0]?.userName ?? "",
    );
    setPhone(
      detail.kind === "guest"
        ? detail.guestUser?.phone ?? ""
        : detail.enrollments[0]?.userPhone ?? "",
    );
    setWhatsappNumber(detail.userProfile?.whatsappNumber ?? "");
    setInitialized(true);
  }, [detail, initialized]);

  const handleSave = async () => {
    try {
      await updateUser({
        userKey,
        displayName,
        phone,
        whatsappNumber,
      });
      toast.success("User app data updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    }
  };

  if (detail === undefined) {
    return <p className="text-sm text-slate-600">Loading user...</p>;
  }

  if (!detail) {
    return <p className="text-sm text-slate-600">User not found.</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`User: ${detail.id}`}
        description="Edit app-managed profile fields and inspect operational history."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile & App Data</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            placeholder="WhatsApp Number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
          />
          <div className="md:col-span-3">
            <Button onClick={handleSave}>Save App Data</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loyalty Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {detail.kind === "clerk" ? (
            <div className="grid gap-2 md:grid-cols-3">
              <p><strong>Balance:</strong> {detail.mindPoints?.balance ?? 0}</p>
              <p><strong>Total Earned:</strong> {detail.mindPoints?.totalEarned ?? 0}</p>
              <p><strong>Total Redeemed:</strong> {detail.mindPoints?.totalRedeemed ?? 0}</p>
              <p><strong>Coupons:</strong> {detail.coupons.length}</p>
              <p><strong>Referrals:</strong> {detail.referralRewards.length}</p>
            </div>
          ) : (
            <p>Guest users do not have loyalty accounts.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {detail.enrollments.length === 0 ? (
              <p className="text-sm text-slate-600">No enrollments found.</p>
            ) : (
              detail.enrollments.map((row) => (
                <div key={row._id} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{row.courseName || row.courseId}</p>
                    <Badge variant="outline">{row.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">{row.enrollmentNumber}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
