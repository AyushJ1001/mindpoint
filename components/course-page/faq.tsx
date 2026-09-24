import { Section } from "@/components/course-page/section";
import type { FaqItem } from "@/lib/course-content/types";

export function FAQ({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <Section
      id="faq"
      eyebrow="Questions"
      title="Fair questions."
      width="narrow"
    >
      <dl className="divide-foreground/10 divide-y">
        {items.map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="font-display text-foreground flex cursor-pointer list-none items-start justify-between gap-6 text-lg leading-snug">
              {item.question}
              <span
                aria-hidden="true"
                className="text-foreground/40 group-open:rotate-45 mt-1 text-xl transition-transform"
              >
                +
              </span>
            </summary>
            <p className="text-muted-foreground mt-3 max-w-[68ch] text-sm leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </dl>
    </Section>
  );
}
