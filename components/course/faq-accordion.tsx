"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export interface FaqAccordionItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqAccordionItem[];
  defaultOpenIndex?: number | null;
}

export default function FaqAccordion({
  items,
  defaultOpenIndex = 0,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  if (items.length === 0) return null;

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question} className="border-foreground/10 border-b py-5">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-start justify-between gap-6 text-left"
              aria-expanded={isOpen}
            >
              <h3 className="text-foreground flex-1 text-[0.95rem] leading-snug font-semibold sm:text-base">
                {item.question}
              </h3>
              <span
                aria-hidden="true"
                className="border-foreground/15 text-foreground/55 mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border"
              >
                {isOpen ? (
                  <Minus className="h-3 w-3" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </span>
            </button>
            {isOpen && (
              <p className="text-foreground/70 mt-3 max-w-[58ch] text-sm leading-relaxed sm:text-[0.9375rem]">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
