"use client";

import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollReveal } from "@/components/ScrollReveal";
import { parseFaqMarkdown, type FaqItem } from "@/components/course/faq";

interface FAQSectionProps {
  title?: string;
}

// A calm, editorial FAQ. Default view shows only the question + short answer.
// Clicking the row reveals the longer markdown body only when the short and
// long answers actually differ.
export default function FAQSection({
  title = "Questions",
}: FAQSectionProps) {
  const [items, setItems] = useState<FaqItem[] | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/faq/course.md", { cache: "force-cache" });
        if (!res.ok) throw new Error("Failed to load faq/course.md");
        const text = await res.text();
        if (!cancelled) setItems(parseFaqMarkdown(text));
      } catch (err) {
        console.error("Error loading FAQ:", err);
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <div>
            <p className="calm-section-number">{title}</p>
            <h2 className="calm-section-title mt-5">
              In case you&rsquo;re wondering.
            </h2>
          </div>

          <div className="mt-10">
            {items.map((item, i) => {
              const hasLongForm =
                item.a.trim().length > 0 &&
                item.a.trim() !== item.shortAnswer.trim();
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className="border-b border-foreground/10 py-5"
                >
                  <button
                    type="button"
                    onClick={() =>
                      hasLongForm ? setOpenIndex(isOpen ? null : i) : undefined
                    }
                    className={`flex w-full items-start justify-between gap-6 text-left ${
                      hasLongForm ? "cursor-pointer" : "cursor-default"
                    }`}
                    aria-expanded={hasLongForm ? isOpen : undefined}
                  >
                    <div className="flex-1">
                      <h3 className="text-[0.95rem] font-semibold leading-snug text-foreground sm:text-base">
                        {item.q}
                      </h3>
                      <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-foreground/70 sm:text-[0.9375rem]">
                        {item.shortAnswer}
                      </p>
                    </div>
                    {hasLongForm && (
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-foreground/15 text-foreground/55 transition-colors group-hover:text-foreground"
                      >
                        {isOpen ? (
                          <Minus className="h-3 w-3" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </button>
                  {hasLongForm && isOpen && (
                    <div className="mt-4 max-w-[58ch] text-sm leading-relaxed text-foreground/75 sm:text-[0.9375rem] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_li]:text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.a}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
