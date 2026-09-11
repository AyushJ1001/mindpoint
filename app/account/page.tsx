"use client";

import { EnrollmentsTab } from "@/components/account/enrollments-tab";
import { MindPointsTab } from "@/components/account/mind-points-tab";
import { ReferralsTab } from "@/components/account/referrals-tab";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Gift, Users } from "lucide-react";
import { Suspense } from "react";

const TABS = [
  { id: "enrollments", label: "My Learning", href: "/account", icon: BookOpen },
  { id: "points", label: "Mind Points", href: "/account?tab=points", icon: Gift },
  { id: "referrals", label: "Referrals", href: "/account?tab=referrals", icon: Users },
] as const;

function AccountContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = (tabParam === "points"
    ? "points"
    : tabParam === "referrals"
      ? "referrals"
      : "enrollments") as "enrollments" | "points" | "referrals";

  return (
    <div className="ss-page tmp-account-page min-h-screen">
      <section className="ss-hero">
        <div className="ss-wrap">
          <p className="ss-kicker">your TMP space</p>
          <h1 className="ss-heading-xl">Your learning, all in one place.</h1>
          <p className="ss-lead mt-6 max-w-3xl">
            Return to your registrations, see your learning history, keep track of
            Mind Points, and manage the parts of your TMP journey that belong to you.
          </p>
        </div>
      </section>

      <section className="ss-section-tight">
        <div className="ss-wrap">
          <nav
            className="grid border-y border-[#163f3d]/25 sm:grid-cols-3"
            aria-label="Account sections"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center justify-between gap-3 border-b border-[#163f3d]/18 px-0 py-5 text-sm transition-colors sm:border-r sm:border-b-0 sm:px-5 sm:last:border-r-0 ${
                    active
                      ? "bg-[#0f4d4d] text-[#faf8f3]"
                      : "text-[#425956] hover:bg-[#8ec1c3]/10"
                  }`}
                >
                  <span className="font-semibold">{tab.label}</span>
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>

          <div className="tmp-account-content mx-auto mt-10 max-w-6xl">
            {activeTab === "enrollments" && <EnrollmentsTab />}
            {activeTab === "points" && <MindPointsTab />}
            {activeTab === "referrals" && <ReferralsTab />}
          </div>
        </div>
      </section>

      <style jsx global>{`
        .tmp-account-content [data-slot="card"] {
          border: 0 !important;
          border-top: 1px solid rgba(22, 63, 61, 0.2) !important;
          border-bottom: 1px solid rgba(22, 63, 61, 0.2) !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .tmp-account-content [data-slot="card-title"],
        .tmp-account-content h2,
        .tmp-account-content h3 {
          font-family: var(--font-syne), Georgia, serif !important;
          color: #163f3d;
          font-weight: 500 !important;
        }
        .tmp-account-content [data-slot="badge"],
        .tmp-account-content [data-slot="button"] {
          border-radius: 2px !important;
          box-shadow: none !important;
        }
        .tmp-account-content [class*="bg-emerald-500"] {
          background: #6f9187 !important;
        }
        .tmp-account-content [class*="bg-blue-"],
        .tmp-account-content [class*="bg-purple-"] {
          background-color: #deebe8 !important;
          color: #173f3d !important;
        }
      `}</style>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-[#65736f]">
          Loading your TMP space...
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
