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

import { parseFaqMarkdown } from "@/components/course/faq";

interface TherapyFAQSectionProps {
  title?: string;
  description?: string;
}

export default function TherapyFAQSection({
  title = "Therapy & Counselling FAQs",
  description = "Get answers to common questions about our therapy and counselling services",
}: TherapyFAQSectionProps) {
  const [faqMarkdown, setFaqMarkdown] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/faq/therapy.md", { cache: "force-cache" });
        if (!res.ok) throw new Error("Failed to load faq/therapy.md");
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
    <section className="from-muted/20 to-background bg-gradient-to-br py-16 dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 dark:text-white">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{title}</h2>
            <p className="text-muted-foreground text-lg">{description}</p>
          </div>

          <Card className="border-muted border-2 shadow-xl">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
