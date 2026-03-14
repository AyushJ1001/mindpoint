"use client";

import { EnrollmentsTab } from "@/components/account/enrollments-tab";
import { MindPointsTab } from "@/components/account/mind-points-tab";
import { ReferralsTab } from "@/components/account/referrals-tab";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AccountContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = (tabParam === "points"
    ? "points"
    : tabParam === "referrals"
      ? "referrals"
      : "enrollments") as "enrollments" | "points" | "referrals";

  return (
    <div>
      {activeTab === "enrollments" && <EnrollmentsTab />}
      {activeTab === "points" && <MindPointsTab />}
      {activeTab === "referrals" && <ReferralsTab />}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountContent />
    </Suspense>
  );
}
