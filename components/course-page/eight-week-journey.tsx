import { cn } from "@/lib/utils";

export const LEARNING_WEEKS = 6;
export const PRACTICAL_WEEKS = 2;

/**
 * The January 2027 course shape: six weeks of structured learning, then two
 * weeks of practical training. One strip per week, so the split reads at a
 * glance on a card as well as on a full page.
 */
export function EightWeekJourney({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const weeks = Array.from(
    { length: LEARNING_WEEKS + PRACTICAL_WEEKS },
    (_, index) => index + 1,
  );

  return (
    <figure className={cn("w-full", className)}>
      <figcaption className="sr-only">
        Eight weeks: weeks 1 to {LEARNING_WEEKS} are structured learning, weeks{" "}
        {LEARNING_WEEKS + 1} and {LEARNING_WEEKS + PRACTICAL_WEEKS} are
        practical training.
      </figcaption>
      <ol aria-hidden="true" className="grid grid-cols-8 gap-1">
        {weeks.map((week) => {
          const practical = week > LEARNING_WEEKS;
          return (
            <li
              key={week}
              className={cn(
                "flex items-end justify-start rounded-md",
                compact ? "h-2" : "h-10 px-2 pb-1.5",
                practical ? "bg-amber" : "bg-primary",
              )}
            >
              {compact ? null : (
                <span
                  className={cn(
                    "text-[0.62rem] font-semibold tabular-nums",
                    practical ? "text-ink" : "text-primary-foreground/90",
                  )}
                >
                  {week}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {compact ? (
        <div
          aria-hidden="true"
          className="mt-1.5 flex justify-between gap-2 text-[0.68rem] whitespace-nowrap"
        >
          <p className="text-foreground/80">
            <span className="font-semibold">{LEARNING_WEEKS} weeks</span>{" "}
            learning
          </p>
          <p className="text-clay">
            <span className="font-semibold">{PRACTICAL_WEEKS} weeks</span>{" "}
            practical
          </p>
        </div>
      ) : (
        <div aria-hidden="true" className="mt-3 grid grid-cols-8 gap-1 text-sm">
          <p className="text-foreground/80 col-span-6">
            <span className="font-semibold">Weeks 1–{LEARNING_WEEKS}</span>{" "}
            structured learning
          </p>
          <p className="text-clay col-span-2">
            <span className="font-semibold">
              Weeks {LEARNING_WEEKS + 1}–{LEARNING_WEEKS + PRACTICAL_WEEKS}
            </span>{" "}
            practical
          </p>
        </div>
      )}
    </figure>
  );
}
