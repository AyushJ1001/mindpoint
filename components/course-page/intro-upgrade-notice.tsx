"use client";

import { useConvexAuth, useQuery } from "convex/react";

import { AddToCartButton } from "@/components/course-page/add-to-cart-button";
import { api } from "@/lib/backend/api";
import type { ProgrammeCartTarget } from "@/lib/course-content/types";

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Shown to a signed-in learner who owns a self-paced intro with an unused
 * upgrade credit. The server decides eligibility; checkout re-checks it.
 */
export function IntroUpgradeNotice({
  target,
}: {
  target?: ProgrammeCartTarget;
}) {
  const { isAuthenticated } = useConvexAuth();
  const credit = useQuery(
    api.introUpgrades.getMyIntroUpgradeCredit,
    isAuthenticated ? {} : "skip",
  );

  if (!target || !credit) return null;
  const pay = Math.max(0, target.price - credit.credit);

  return (
    <section id="upgrade" className="scroll-mt-24 pb-12 sm:pb-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <div className="border-primary/25 bg-primary/[0.04] flex flex-col gap-6 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-xl">
            <p className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
              Your intro course counts
            </p>
            <p className="text-foreground/80 mt-3 text-sm leading-relaxed">
              You own {credit.introName}. Its {inr(credit.credit)} fee is
              credited once against any certificate course, including this one.
            </p>
            <p className="font-display text-foreground mt-4 text-2xl">
              Pay {inr(pay)} instead of {inr(target.price)}
            </p>
          </div>
          <div className="sm:w-72">
            <AddToCartButton
              target={target}
              couponCode={credit.couponCode}
              label={`Upgrade · ${inr(pay)}`}
              className="bg-primary text-primary-foreground inline-flex w-full items-center justify-center rounded-md px-6 py-3 text-sm font-medium hover:opacity-90"
            />
            <p className="text-muted-foreground mt-3 text-center text-xs">
              Credit applied at checkout with code {credit.couponCode}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
