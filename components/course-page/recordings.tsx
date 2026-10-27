import { Section } from "@/components/course-page/section";

/**
 * Lifetime recordings benefit for eligible new enrolments. The wording is
 * deliberately honest: "lifetime" is bounded by how long the platform runs,
 * with a 90-day download notice if it ever closes.
 */
export function RecordingsSection() {
  return (
    <Section
      id="recordings"
      eyebrow="Lifetime access"
      title="Learn Live. Revisit Anytime."
      lead="Enrolments from 27 October 2026 receive lifetime access to the recordings of the live classes, so you can revisit any session at your own pace."
      width="narrow"
    >
      <p className="text-foreground/85 max-w-[62ch] text-[1.02rem] leading-relaxed">
        &ldquo;Lifetime&rdquo; means for as long as The Mind Point&rsquo;s
        platform operates. If the platform were ever to close, we would give
        you 90 days&rsquo; notice to download your recordings before access
        ends.
      </p>
    </Section>
  );
}
