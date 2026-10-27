import { Section } from "@/components/course-page/section";

const ITEMS: { title: string; body: string }[] = [
  {
    title: "Case-based learning",
    body: "Work through fictional and role-played cases rather than memorising definitions.",
  },
  {
    title: "Guided discussions",
    body: "Talk through your reasoning with faculty and peers in a small, structured group.",
  },
  {
    title: "Demonstrations",
    body: "Watch faculty model a thought process before you are asked to do it yourself.",
  },
  {
    title: "Role-plays",
    body: "Practise a stance or a conversation in a safe setting and receive feedback.",
  },
  {
    title: "Reflective exercises",
    body: "Return to what you noticed, what surprised you, and what you would do differently.",
  },
  {
    title: "Case formulation",
    body: "Build a collaborative explanation of a specific difficulty and revise it as new information arrives.",
  },
  {
    title: "Experiential activities",
    body: "Learn by doing, within clear ethical and personal boundaries.",
  },
  {
    title: "Practical assignments",
    body: "Apply each week's ideas to a structured task between sessions.",
  },
];

const DISCLAIMER =
  "All practical material is faculty-curated and designed for educational purposes. It is not a substitute for therapy, and no personal disclosure is required.";

export function PracticalExperienceSection() {
  return (
    <Section
      id="practical-experience"
      eyebrow="Practical learning"
      title="A Glimpse Into Your Practical Learning Experience"
      lead="The taught weeks build understanding. The practical weeks turn it into something you can do — and justify doing."
      tone="mist"
    >
      <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {ITEMS.map((item, index) => (
          <li key={item.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="water-accent font-display mt-0.5 text-sm tabular-nums"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-display text-foreground text-lg leading-snug">
                {item.title}
              </h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-muted-foreground border-foreground/10 mt-10 border-t pt-6 text-sm leading-relaxed">
        {DISCLAIMER}
      </p>
    </Section>
  );
}
