import { ContentPlaceholder } from "@/components/course-page/placeholder";
import { Section } from "@/components/course-page/section";
import { cn } from "@/lib/utils";
import type { CourseContent, PricingTier } from "@/lib/course-content/types";

function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function TierCard({
  tier,
  href,
}: {
  tier: PricingTier;
  href: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border p-6 sm:p-8",
        tier.primary
          ? "border-primary/30 bg-primary/[0.04]"
          : "border-foreground/10 bg-card",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-foreground text-2xl">{tier.name}</h3>
        {tier.primary ? (
          <span className="text-primary/70 text-[0.62rem] font-semibold tracking-[0.2em] uppercase">
            Primary path
          </span>
        ) : null}
      </div>

      {tier.description ? (
        <p className="text-muted-foreground mt-2 text-sm">{tier.description}</p>
      ) : null}

      <div className="mt-6">
        {tier.price !== undefined ? (
          <p className="font-display text-foreground text-4xl">
            {formatRupees(tier.price)}
          </p>
        ) : (
          <ContentPlaceholder label="Pricing for this tier has not been confirmed yet." />
        )}
        {tier.priceNote ? (
          <p className="text-muted-foreground mt-2 text-xs">{tier.priceNote}</p>
        ) : null}
      </div>

      {tier.includes.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {tier.includes.map((item) => (
            <li
              key={item}
              className="text-foreground/80 flex gap-3 text-sm leading-relaxed"
            >
              <span
                aria-hidden="true"
                className="bg-primary mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto pt-8">
        <a
          href={href}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors",
            tier.primary
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "border-primary/30 text-primary hover:bg-primary/5 border",
          )}
        >
          {tier.primary ? "Choose Complete Training" : "Choose Foundations"}
        </a>
        {tier.upgradeNote ? (
          <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
            {tier.upgradeNote}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function PricingCards({ course }: { course: CourseContent }) {
  const href = "/contact";

  if (course.applicationBased) {
    return (
      <Section
        id="options"
        eyebrow="Programme options"
        title="Offered by application."
        lead="This programme is cohort-based and supervised, so places are offered by application rather than sold off a shelf."
        width="narrow"
      >
        <div className="border-primary/25 bg-primary/[0.04] rounded-2xl border p-6 sm:p-8">
          <h3 className="font-display text-foreground text-2xl">
            {course.title}
          </h3>
          <p className="text-muted-foreground mt-3 max-w-[56ch] text-sm leading-relaxed">
            {course.description}
          </p>
          <div className="mt-6">
            <ContentPlaceholder label="Application requirements, fees and cohort dates for this internship have not been supplied yet." />
          </div>
          <a
            href={href}
            className="bg-primary text-primary-foreground mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Start your application
          </a>
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="options"
      eyebrow="Programme options"
      title="Pick how far you want to go."
      lead="Start with the foundations, or take the full training with the live cohort. You can upgrade later by paying only the difference."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <TierCard tier={course.pricing.foundation} href={href} />
        <TierCard tier={course.pricing.complete} href={href} />
      </div>
    </Section>
  );
}
