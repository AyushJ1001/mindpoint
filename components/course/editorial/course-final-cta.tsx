"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import type { PublicCourse } from "@/lib/backend";

interface Props {
  course: PublicCourse;
  isOutOfStock?: boolean;
  onReserve: () => void;
}

export default function CourseFinalCta({
  course,
  isOutOfStock,
  onReserve,
}: Props) {
  const firstName = course.name.split(" ").slice(0, 3).join(" ");

  return (
    <section className="calm-section">
      <div className="calm-container text-center">
        <ScrollReveal>
          <p className="calm-section-number justify-center">Ready when you are</p>
          <h2 className="calm-section-title mx-auto mt-5 max-w-[24ch] text-balance">
            Stop reading about {firstName}.{" "}
            <em className="text-terracotta italic">Do</em> it.
          </h2>
          <p className="calm-section-lead mx-auto mt-5 max-w-[52ch]">
            Start at your own pace, or join the next live cohort. Same faculty,
            same standard, your pace.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-full px-7"
              disabled={isOutOfStock}
              onClick={onReserve}
            >
              {isOutOfStock ? "Join the waitlist" : "Choose how you train"}
            </Button>
            <a
              href="https://wa.me/919137008686?text=Hi%2C%20I%20have%20a%20question%20about%20a%20course."
              target="_blank"
              rel="noreferrer"
              className="border-primary/30 text-primary hover:bg-primary/5 inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-medium transition-colors"
            >
              Questions? Talk to us on WhatsApp
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
