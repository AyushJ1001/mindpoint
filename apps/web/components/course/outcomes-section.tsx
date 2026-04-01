import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { defaultOutcomes } from "@/lib/course-content-data";
import type { PublicCourse } from "@mindpoint/backend";

interface OutcomesSectionProps {
  course: PublicCourse;
}

export default function OutcomesSection({ course }: OutcomesSectionProps) {
  // Use custom outcomes, or fall back to learningOutcomes titles, or type defaults
  const outcomes = course.outcomes?.length
    ? course.outcomes
    : course.learningOutcomes?.length
      ? course.learningOutcomes.map((lo) => lo.title)
      : defaultOutcomes[course.type || "certificate"] || [];
  const keyOutcomes = outcomes.slice(0, 5);

  if (keyOutcomes.length === 0) return null;

  return (
    <section className="section-padding bg-primary/[0.03]">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <h2 className="font-display text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            What you will gain
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            A few clear shifts this program is designed to create:
          </p>
          <ul className="mt-8 space-y-4">
            {keyOutcomes.map((outcome, i) => (
              <li key={i} className="flex items-start gap-3">
                <ArrowRight className="text-primary mt-1 h-5 w-5 shrink-0" />
                <span className="text-foreground text-base leading-relaxed">
                  {outcome}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground mt-8 italic">
            This is not just learning — it&apos;s practical change.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
