import { Section } from "@/components/course-page/section";
import { cn } from "@/lib/utils";
import type {
  ProgrammeOption,
  ProgrammeOptions,
} from "@/lib/course-content/types";

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function OptionCard({ option }: { option: ProgrammeOption }) {
  const { cta } = option;
  const isEnroll = cta.state === "enroll" && Boolean(cta.href);
  const isWaitlist = cta.state === "waitlist";
  const hasFacts = Boolean(option.price || option.schedule || option.availability);

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border p-6 sm:p-8",
        isEnroll
          ? "border-primary/30 bg-primary/[0.04]"
          : "border-foreground/10 water-glass",
      )}
    >
      <h3 className="font-display text-foreground text-2xl leading-snug">
        {option.name}
      </h3>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        <span className="text-foreground/70 font-medium">Best for: </span>
        {option.bestFor}
      </p>

      {hasFacts ? (
        <div className="border-foreground/10 mt-5 space-y-1 border-t pt-5 text-sm">
          {option.price ? (
            <p className="font-display text-foreground text-3xl">
              {formatPrice(option.price.amount, option.price.currency)}
            </p>
          ) : null}
          {option.price?.note ? (
            <p className="text-muted-foreground text-xs">{option.price.note}</p>
          ) : null}
          {option.schedule ? (
            <p className="text-foreground/80">{option.schedule}</p>
          ) : null}
          {option.availability ? (
            <p className="text-foreground/80">{option.availability}</p>
          ) : null}
        </div>
      ) : null}

      <ul className="mt-6 space-y-3">
        {option.includes.map((item) => (
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

      <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
        <span className="text-foreground/70 font-medium">Outcome: </span>
        {option.outcome}
      </p>

      {option.upgradeNote ? (
        <p className="text-primary mt-3 text-sm leading-relaxed">
          {option.upgradeNote}
        </p>
      ) : null}

      <div className="mt-auto pt-8">
        {isEnroll ? (
          <a
            href={cta.href}
            className="bg-primary text-primary-foreground inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            {cta.label}
          </a>
        ) : isWaitlist ? (
          <a
            href={cta.href ?? "/join"}
            className="border-primary/30 text-primary hover:bg-primary/5 inline-flex w-full items-center justify-center rounded-full border px-6 py-3 text-sm font-medium"
          >
            Join the waitlist
          </a>
        ) : (
          <div>
            <span
              className="border-foreground/15 text-foreground/50 inline-flex w-full items-center justify-center rounded-full border border-dashed px-6 py-3 text-sm font-medium"
              aria-disabled="true"
            >
              Not currently available
            </span>
            <a
              href="/join"
              className="text-primary hover:underline mt-3 block text-center text-sm"
            >
              Register your interest →
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

export function OptionCards({ options }: { options: ProgrammeOptions }) {
  return (
    <Section
      id="options"
      eyebrow={options.eyebrow ?? "Course options"}
      title={options.title ?? "Choose your route"}
      tone="mist"
    >
      <div
        className={cn(
          "grid gap-6",
          options.items.length > 1 ? "lg:grid-cols-2" : "",
        )}
      >
        {options.items.map((option) => (
          <OptionCard key={option.key} option={option} />
        ))}
      </div>
      <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
        Price, dates, availability, access period and certificate requirements
        are shown from the current enrolment option and cohort details, and at
        checkout. If a detail is not yet configured, its label is not shown here.
      </p>
    </Section>
  );
}
