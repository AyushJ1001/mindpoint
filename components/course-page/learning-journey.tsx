import Image from "next/image";

import { Section } from "@/components/course-page/section";
import { learningModel } from "@/lib/course-content";

function Stage({
  label,
  description,
  index,
}: {
  label: string;
  description: string;
  index: number;
}) {
  return (
    <li className="relative flex gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <span className="water-glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[#1d4e4a] tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span aria-hidden="true" className="water-rule mt-2 w-px flex-1" />
      </div>
      <div className="pb-8">
        <h3 className="font-display text-foreground text-lg">{label}</h3>
        <p className="text-muted-foreground mt-1 max-w-[42ch] text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </li>
  );
}

export function LearningJourney() {
  const foundations = learningModel.filter(
    (stage) => stage.part === "foundations",
  );
  const applied = learningModel.filter((stage) => stage.part === "applied");

  return (
    <Section
      id="journey"
      eyebrow="The TMP learning journey"
      title="One model, from first idea to real practice."
      lead="Every programme follows the same arc. Part I happens in your own space, above the surface. Part II happens with faculty, below it."
      tone="mist"
    >
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="water-eyebrow text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
            Part I — Foundations · above the surface
          </p>
          <ol className="mt-6">
            {foundations.map((stage, index) => (
              <Stage
                key={stage.key}
                label={stage.label}
                description={stage.description}
                index={index}
              />
            ))}
          </ol>

          <div className="relative my-2">
            <span aria-hidden="true" className="water-rule block" />
            <span className="water-caption absolute -top-6 left-0 text-base">
              the surface
            </span>
          </div>

          <p className="water-eyebrow mt-8 text-[0.66rem] font-semibold tracking-[0.22em] uppercase">
            Part II — Applied Training · below the surface
          </p>
          <ol className="mt-6">
            {applied.map((stage, index) => (
              <Stage
                key={stage.key}
                label={stage.label}
                description={stage.description}
                index={foundations.length + index}
              />
            ))}
          </ol>
        </div>

        <figure className="lg:pt-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
            <Image
              src="/coastal/wave.jpg"
              alt="A wave breaking near the shore, spray catching the light."
              fill
              sizes="(min-width: 1024px) 32vw, 90vw"
              className="object-cover"
            />
          </div>
        </figure>
      </div>
    </Section>
  );
}
