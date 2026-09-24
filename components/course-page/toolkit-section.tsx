import { ContentPlaceholder } from "@/components/course-page/placeholder";
import { Section } from "@/components/course-page/section";
import type { ToolkitItem } from "@/lib/course-content/types";

export function ToolkitSection({ items }: { items: ToolkitItem[] }) {
  return (
    <Section
      id="toolkit"
      eyebrow="What you take with you"
      title="Tools you keep, not notes you lose."
      lead="Downloadable, reusable resources that stay useful long after the programme ends."
      width="narrow"
    >
      {items.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.title}
              className="border-foreground/10 bg-card rounded-xl border p-5"
            >
              {item.kind ? (
                <p className="text-foreground/45 text-[0.62rem] font-semibold tracking-[0.2em] uppercase">
                  {item.kind}
                </p>
              ) : null}
              <h3 className="font-display text-foreground mt-2 text-lg">
                {item.title}
              </h3>
              {item.description ? (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <ContentPlaceholder label="The toolkit for this programme has not been supplied yet. Add the worksheets, templates and references students receive." />
      )}
    </Section>
  );
}
