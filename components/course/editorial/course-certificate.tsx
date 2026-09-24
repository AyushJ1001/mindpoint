"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import type { PublicCourse } from "@/lib/backend";

interface Props {
  course: PublicCourse;
}

export default function CourseCertificate({ course }: Props) {
  const awarded =
    course.type === "certificate"
      ? "certificate"
      : course.type === "diploma"
        ? "diploma"
        : null;

  if (!awarded) return null;

  return (
    <section className="calm-section-tight">
      <div className="calm-container">
        <ScrollReveal>
          <p className="calm-section-number">How you earn it</p>
          <h2 className="calm-section-title mt-5">
            A {awarded} you <em className="text-terracotta italic">earn</em>, not
            collect.
          </h2>

          <div className="border-foreground/10 bg-card mt-10 rounded-2xl border p-6 sm:p-8">
            <ul className="space-y-4">
              {[
                "Finish every module at your own pace.",
                "Practise the work, not just the theory.",
                "Pass a graded assessment you have to complete.",
                "Get a verifiable certificate, checkable on the public verifier.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[1rem] leading-[1.6]">
                  <span
                    aria-hidden="true"
                    className="bg-terracotta mt-[0.6rem] h-1.5 w-1.5 flex-none rounded-full"
                  />
                  <span className="text-foreground/85">{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground border-foreground/10 mt-6 border-t pt-5 text-xs leading-relaxed">
              This is a certificate of completion from The Mind Point. It is not
              a degree, a licence, or registration with a statutory council, and
              it does not by itself qualify you to practise independently where
              local law requires registration.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
