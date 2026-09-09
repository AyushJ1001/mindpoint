"use client";

import { EnrollmentsTab } from "@/components/account/enrollments-tab";
import { MindPointsTab } from "@/components/account/mind-points-tab";
import { ReferralsTab } from "@/components/account/referrals-tab";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Gift, Users } from "lucide-react";
import { Suspense } from "react";

const TABS = [
  {
    id: "enrollments",
    label: "My Learning",
    href: "/account",
    icon: BookOpen,
  },
  {
    id: "points",
    label: "Mind Points",
    href: "/account?tab=points",
    icon: Gift,
  },
  {
    id: "referrals",
    label: "Referrals",
    href: "/account?tab=referrals",
    icon: Users,
  },
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
    <div className="min-h-screen bg-[#faf8f3]">
      <section className="brand-hero relative overflow-hidden border-b border-primary/5 py-12 sm:py-16">
        <div className="container relative z-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4">
                <span className="brand-gold-rule" aria-hidden="true" />
                <span className="brand-kicker">Your TMP space</span>
              </div>
              <h1 className="font-display text-foreground mt-5 text-4xl leading-tight font-medium sm:text-5xl">
                Your learning, progress, and community —
                <span className="text-primary italic"> all in one place.</span>
              </h1>
              <p className="text-muted-foreground mt-4 max-w-xl text-base leading-7 sm:text-lg">
                Return to your enrollments, keep track of your Mind Points, and see the ways your TMP journey continues to grow.
              </p>
            </div>

            <div className="brand-panel hidden shrink-0 rounded-[1.8rem] p-5 sm:block">
              <Image
                src="/tmp-botanical-logo.svg"
                alt="The Mind Point"
                width={100}
                height={100}
                className="h-20 w-20 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 sm:py-10 lg:py-12">
        <nav
          className="mb-8 flex flex-wrap gap-2 rounded-[1.4rem] border border-primary/10 bg-[#fffdf9]/85 p-2 shadow-[0_18px_50px_-40px_rgba(15,77,77,0.6)]"
          aria-label="Account sections"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_14px_28px_-18px_rgba(15,77,77,0.8)]"
                    : "text-muted-foreground hover:bg-[#deebe8] hover:text-[#173f3d]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="tmp-account-content mx-auto max-w-5xl">
          {activeTab === "enrollments" && <EnrollmentsTab />}
          {activeTab === "points" && <MindPointsTab />}
          {activeTab === "referrals" && <ReferralsTab />}
        </div>
      </div>

      <style jsx global>{`
        .tmp-account-content [data-slot="card"] {
          border: 1px solid rgba(15, 77, 77, 0.12) !important;
          border-radius: 1.6rem !important;
          background: rgba(255, 253, 249, 0.94) !important;
          box-shadow: 0 24px 58px -44px rgba(15, 77, 77, 0.58) !important;
        }

        .tmp-account-content [data-slot="card-title"],
        .tmp-account-content h2,
        .tmp-account-content h3 {
          font-family: var(--font-display), var(--font-sans), serif;
          color: #173f3d;
          font-weight: 500;
        }

        .tmp-account-content [data-slot="badge"] {
          border-radius: 999px !important;
        }

        .tmp-account-content [class*="bg-emerald-500"] {
          background: #6f9187 !important;
        }

        .tmp-account-content [class*="bg-blue-"],
        .tmp-account-content [class*="bg-purple-"] {
          background-color: #deebe8 !important;
          color: #173f3d !important;
        }

        .tmp-account-content [data-slot="button"] {
          border-radius: 999px !important;
        }
      `}</style>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
          Loading your TMP space...
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
