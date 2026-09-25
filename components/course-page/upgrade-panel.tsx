import { AddToCartButton } from "@/components/course-page/add-to-cart-button";
import { Section } from "@/components/course-page/section";
import type { ProgrammeUpgrade } from "@/lib/course-content/types";

function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * The self-paced → live upgrade route, shown directly beneath the option cards.
 * The learner's self-paced fee is credited through an upgrade coupon, so they
 * pay only the difference.
 */
export function UpgradePanel({ upgrade }: { upgrade: ProgrammeUpgrade }) {
  const { target, difference, couponCode } = upgrade;

  return (
    <Section
      id="upgrade"
      eyebrow={upgrade.eyebrow ?? "Already started self-paced?"}
      title={upgrade.title}
      tone="wash"
    >
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
              <span className="text-foreground font-medium">{couponCode}</span>{" "}
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
          ) : (
            <a
              href="/join"
              className="border-primary/30 text-primary hover:bg-primary/5 inline-flex w-full items-center justify-center rounded-full border px-6 py-3 text-sm font-medium"
            >
              {upgrade.ctaLabel}
            </a>
          )}
          <p className="text-muted-foreground mt-3 text-center text-xs">
            No need to buy the live course at full price.
          </p>
        </div>
      </div>
    </Section>
  );
}
