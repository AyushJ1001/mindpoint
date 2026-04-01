import { CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { defaultPainPoints } from "@/lib/course-content-data";
import type { PublicCourse } from "@mindpoint/backend";

interface PainPointsSectionProps {
  course: PublicCourse;
}

export default function PainPointsSection({ course }: PainPointsSectionProps) {
  const points = course.painPoints?.length
    ? course.painPoints
    : defaultPainPoints[course.type || "certificate"] || [];

  if (points.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <h2 className="font-display text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            This is for you if...
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            You don&apos;t need another theory-heavy course. You need something
            that actually works.
          </p>
          <ul className="mt-8 space-y-4">
            {points.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="text-primary mt-1 h-5 w-5 shrink-0" />
                <span className="text-foreground text-base leading-relaxed">
                  {point}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-primary mt-8 font-medium">
            If this feels familiar, you&apos;re in the right place.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
