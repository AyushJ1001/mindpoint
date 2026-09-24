import { ContentPlaceholder } from "@/components/course-page/placeholder";
import type { CourseModule } from "@/lib/course-content/types";

/**
 * Native <details> accordion — accessible and JS-free.
 */
export function CurriculumAccordion({
  items,
  emptyLabel,
}: {
  items: CourseModule[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <ContentPlaceholder label={emptyLabel} />;
  }

  return (
    <ol className="divide-foreground/10 divide-y">
      {items.map((item, index) => (
        <li key={item.title}>
          <details className="group py-4">
            <summary className="flex cursor-pointer list-none items-start gap-4">
              <span
                aria-hidden="true"
                className="water-accent font-display mt-0.5 text-sm tabular-nums"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="font-display text-foreground block text-lg leading-snug">
                  {item.title}
                </span>
                {item.summary ? (
                  <span className="text-muted-foreground mt-1 block text-sm leading-relaxed">
                    {item.summary}
                  </span>
                ) : null}
              </span>
              <span
                aria-hidden="true"
                className="text-foreground/40 group-open:rotate-45 mt-1 text-lg transition-transform"
              >
                +
              </span>
            </summary>
            {item.lessons && item.lessons.length > 0 ? (
              <ul className="mt-4 space-y-2 pl-8">
                {item.lessons.map((lesson) => (
                  <li
                    key={lesson}
                    className="text-foreground/70 flex gap-3 text-sm leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-foreground/30 mt-[0.6rem] h-px w-3 flex-none"
                    />
                    <span>{lesson}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </details>
        </li>
      ))}
    </ol>
  );
}
