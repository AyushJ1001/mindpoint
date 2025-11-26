"use client";

import { EnrollmentsTab } from "@/components/account/enrollments-tab";
import { MindPointsTab } from "@/components/account/mind-points-tab";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AccountContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = (tabParam === "points" ? "points" : "enrollments") as
    | "enrollments"
    | "points";

  return (
    <div>
      {activeTab === "enrollments" && <EnrollmentsTab />}
      {activeTab === "points" && <MindPointsTab />}
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
