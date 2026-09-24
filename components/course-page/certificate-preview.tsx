import { ContentPlaceholder } from "@/components/course-page/placeholder";
import { Section } from "@/components/course-page/section";
import type { CourseContent } from "@/lib/course-content/types";

export function CertificatePreview({ course }: { course: CourseContent }) {
  const tiers = [
    {
      label: "Foundations",
      text: course.certificateFoundation,
    },
    {
      label: "Complete Training",
      text: course.certificateComplete,
    },
  ].filter((tier) => tier.text);

  return (
    <Section
      id="certificate"
      eyebrow="How you earn it"
      title="A certificate you earn, not collect."
      lead="Completion is assessed. The wording is honest about what the certificate is, and what it is not."
      width="narrow"
    >
      {tiers.length > 0 ? (
        <div className="grid gap-6">
          <div className="border-foreground/10 bg-card relative aspect-[1.6/1] overflow-hidden rounded-2xl border p-8">
            <div className="border-foreground/15 flex h-full flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <p className="text-foreground/45 text-[0.62rem] font-semibold tracking-[0.24em] uppercase">
                The Mind Point
              </p>
              <p className="font-display text-foreground mt-3 text-2xl">
                Certificate of completion
              </p>
              <p className="text-muted-foreground mt-2 max-w-[34ch] text-sm">
                {course.shortTitle}
              </p>
            </div>
            <span className="text-foreground/40 absolute right-4 bottom-3 text-[0.6rem] font-semibold tracking-[0.2em] uppercase">
              Preview
            </span>
          </div>

          <ul className="space-y-3">
            {tiers.map((tier) => (
              <li
                key={tier.label}
                className="border-foreground/10 grid gap-2 border-t pt-4 sm:grid-cols-[10rem_1fr] sm:gap-8"
              >
                <span className="text-foreground/45 text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
                  {tier.label}
                </span>
                <span className="text-foreground/85 text-sm leading-relaxed">
                  {tier.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ContentPlaceholder label="Certificate details for this programme have not been supplied yet. Add the completion wording for each tier." />
      )}
    </Section>
  );
}
