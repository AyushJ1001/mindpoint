"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

interface SupervisedFAQSectionProps {
  title?: string;
  description?: string;
}

export default function SupervisedFAQSection({
  title = "Questions about supervision, answered clearly",
  description = "A few practical things people usually want to know before they begin.",
}: SupervisedFAQSectionProps) {
  const [faqMarkdown, setFaqMarkdown] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/faq/supervised.md", { cache: "force-cache" });
        if (!res.ok) throw new Error("Failed to load faq/supervised.md");
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
            <div className="mb-10 text-center">
              <span className="text-primary/80 text-xs font-semibold tracking-[0.32em] uppercase">
                Helpful details
              </span>
              <h2 className="calm-section-title mx-auto mt-3 mb-3 max-w-xl">
                {title}
              </h2>
              <p className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
                {description}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <Card className="course-shell-soft border-border/70 shadow-none">
              <CardContent className="p-8">
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
                        <div className="prose prose-sm dark:prose-invert max-w-none sm:prose-base">
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
                            <AccordionTrigger className="hover:text-primary text-left text-[0.95rem] font-semibold leading-snug sm:text-base">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="prose prose-sm dark:prose-invert max-w-none pt-2 sm:prose-base">
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
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
