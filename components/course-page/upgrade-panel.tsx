"use client";

import { useConvexAuth, useQuery } from "convex/react";

import { AddToCartButton } from "@/components/course-page/add-to-cart-button";
import { api } from "@/lib/backend/api";
import type { ProgrammeUpgrade } from "@/lib/course-content/types";

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * The self-paced → live upgrade route, shown only to signed-in learners who
 * already own the self-paced course. Everyone else sees nothing: the upgrade is
 * not a third option for new visitors.
 *
 * The matching upgrade coupon also requires the self-paced purchase server-side,
 * so the discount cannot be used without it.
 */
export function UpgradePanel({
  upgrade,
  fromCourseId,
}: {
  upgrade: ProgrammeUpgrade;
  fromCourseId?: string;
}) {
  const { isAuthenticated } = useConvexAuth();
  const enrollments = useQuery(
    api.myFunctions.getUserEnrollments,
    isAuthenticated ? { limit: 200 } : "skip",
  );

  const ownsSelfPaced =
    isAuthenticated &&
    Boolean(fromCourseId) &&
    Array.isArray(enrollments) &&
    enrollments.some(
      (enrollment) => String(enrollment.courseId) === fromCourseId,
    );

  if (!ownsSelfPaced) return null;

  const { target, difference, couponCode } = upgrade;

  return (
    <section id="upgrade" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <header className="mb-10 sm:mb-14">
          <p className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
            {upgrade.eyebrow ?? "Already started self-paced?"}
          </p>
          <h2 className="font-display text-foreground mt-4 max-w-[24ch] text-3xl leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            {upgrade.title}
          </h2>
        </header>

        <div className="border-primary/25 bg-primary/[0.04] flex flex-col gap-6 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-xl">
            <p className="text-foreground/80 text-sm leading-relaxed">
              {upgrade.body}
            </p>
            {typeof difference === "number" ? (
              <p className="font-display text-foreground mt-4 text-2xl">
                Pay only {inr(difference)} more
              </p>
            ) : null}
            {couponCode ? (
              <p className="text-muted-foreground mt-2 text-xs">
                Your self-paced fee is credited automatically with code{" "}
                <span className="text-foreground font-medium">
                  {couponCode}
                </span>{" "}
                — applied for you when you upgrade.
              </p>
            ) : null}
          </div>

          <div className="sm:w-72">
            {target && typeof difference === "number" && couponCode ? (
              <AddToCartButton
                target={target}
                couponCode={couponCode}
                label={`${upgrade.ctaLabel} · ${inr(difference)}`}
                className="bg-primary text-primary-foreground inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium hover:opacity-90"
              />
            ) : null}
            <p className="text-muted-foreground mt-3 text-center text-xs">
              No need to buy the live course at full price.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
