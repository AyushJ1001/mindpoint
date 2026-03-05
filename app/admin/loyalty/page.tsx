"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { downloadCsv, toCsv } from "@/lib/csv";

export default function AdminLoyaltyPage() {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");
  const [couponType, setCouponType] = useState("certificate");
  const [couponPointsCost, setCouponPointsCost] = useState(0);
  const [isBackfilling, setIsBackfilling] = useState(false);

  const rows = useQuery(api.adminLoyalty.listLoyaltyAccounts, {
    search: search || undefined,
    limit: 500,
  });

  const adjustPoints = useMutation(api.adminLoyalty.adjustPoints);
  const createManualCoupon = useMutation(api.adminLoyalty.createManualCoupon);
  const backfillLoyaltySearchFields = useMutation(
    api.adminLoyalty.backfillLoyaltySearchFields,
  );

  const exportRows = useMemo(
    () =>
      (rows || []).map((row) => ({
        clerkUserId: row.clerkUserId,
        balance: row.balance,
        totalEarned: row.totalEarned,
        totalRedeemed: row.totalRedeemed,
        userName: row.profile?.userName,
        userEmail: row.profile?.userEmail,
      })),
    [rows],
  );

  const handleAdjustPoints = async () => {
    if (!selectedUserId || !reason) {
      toast.error("User and reason are required");
      return;
    }

    try {
      await adjustPoints({
        clerkUserId: selectedUserId,
        delta,
        reason,
      });
      toast.success("Points adjusted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to adjust points",
      );
    }
  };

  const handleCreateCoupon = async () => {
    if (!selectedUserId || !reason) {
      toast.error("User and reason are required");
      return;
    }

    try {
      await createManualCoupon({
        clerkUserId: selectedUserId,
        courseType: couponType,
        pointsCost: couponPointsCost,
        reason,
      });
      toast.success("Manual coupon created");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create coupon",
      );
    }
  };

  const handleBackfillSearchData = async () => {
    setIsBackfilling(true);
    try {
      const result = await backfillLoyaltySearchFields({ limit: 100 });
      toast.success(
        `Backfill complete: updated ${result.updated} of ${result.scanned} loyalty accounts`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to backfill search data",
      );
    } finally {
      setIsBackfilling(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Loyalty & Referrals"
        description="Inspect points/coupons/referrals and perform controlled admin adjustments."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleBackfillSearchData}
              disabled={isBackfilling}
            >
              {isBackfilling ? "Backfilling..." : "Backfill Search Data"}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  `admin-loyalty-${new Date().toISOString().slice(0, 10)}.csv`,
                  toCsv(exportRows),
                )
              }
            >
              Export CSV
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Admin Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Clerk User ID"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          />
          <Input
            placeholder="Reason (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Points delta (+/-)"
            value={delta}
            onChange={(e) => setDelta(Number(e.target.value || 0))}
          />
          <div className="flex gap-2 md:col-span-3">
            <Button onClick={handleAdjustPoints}>Adjust Points</Button>
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={couponType}
              onChange={(e) => setCouponType(e.target.value)}
            >
              <option value="certificate">certificate</option>
              <option value="diploma">diploma</option>
              <option value="internship_120">internship_120</option>
              <option value="internship_240">internship_240</option>
              <option value="worksheet">worksheet</option>
              <option value="masterclass">masterclass</option>
              <option value="pre-recorded">pre-recorded</option>
            </select>
            <Input
              type="number"
              placeholder="Coupon points cost"
              value={couponPointsCost}
              onChange={(e) => setCouponPointsCost(Number(e.target.value || 0))}
            />
            <Button variant="outline" onClick={handleCreateCoupon}>
              Create Coupon
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-md">
        <Input
          placeholder="Search loyalty accounts"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-600 uppercase">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Balance</th>
              <th className="px-3 py-2">Earned</th>
              <th className="px-3 py-2">Redeemed</th>
            </tr>
          </thead>
          <tbody>
            {!rows ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={4}>
                  Loading loyalty accounts...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-600" colSpan={4}>
                  No loyalty accounts found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id} className="border-t">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">
                      {row.profile?.userName || row.clerkUserId}
                    </p>
                    <p className="text-xs text-slate-600">
                      {row.profile?.userEmail || "-"}
                    </p>
                  </td>
                  <td className="px-3 py-2">{row.balance}</td>
                  <td className="px-3 py-2">{row.totalEarned}</td>
                  <td className="px-3 py-2">{row.totalRedeemed}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
