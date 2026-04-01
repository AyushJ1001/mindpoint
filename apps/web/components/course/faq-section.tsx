"use client";

import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollReveal } from "@/components/ScrollReveal";

import { parseFaqMarkdown } from "@/components/course/faq";

interface FAQSectionProps {
  title?: string;
  description?: string;
}

export default function FAQSection({
  title = "Questions, answered with care",
  description = "A few practical things people usually want to know before they commit.",
}: FAQSectionProps) {
  const [faqMarkdown, setFaqMarkdown] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/faq/course.md", { cache: "force-cache" });
        if (!res.ok) throw new Error("Failed to load faq/course.md");
        const text = await res.text();
        if (!cancelled) setFaqMarkdown(text);
      } catch (err) {
        console.error("Error loading FAQ:", err);
        if (!cancelled) setFaqMarkdown(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="course-section-md pt-8 sm:pt-10">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                Helpful details
              </span>
              <h2 className="font-display text-foreground mt-3 mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h2>
              <p className="text-muted-foreground text-lg">{description}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="course-shell-soft rounded-[1.8rem] p-8">
              {faqMarkdown == null ? (
                <div className="py-8 text-center">
                  <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                  <p className="text-muted-foreground">Loading FAQs...</p>
                </div>
              ) : (
                (() => {
                  const items = parseFaqMarkdown(faqMarkdown);
                  if (items.length === 0) {
                    return (
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {faqMarkdown}
                        </ReactMarkdown>
                      </div>
                    );
                  }
                  return (
                    <Accordion type="single" collapsible className="w-full">
                      {items.map((item, idx) => (
                        <AccordionItem key={idx} value={`faq-${idx + 1}`}>
                          <AccordionTrigger className="hover:text-primary text-left text-lg font-semibold">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="prose dark:prose-invert max-w-none pt-2">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {item.a}
                              </ReactMarkdown>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  );
                })()
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
