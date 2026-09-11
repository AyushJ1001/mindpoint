import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Compass,
  FolderHeart,
  LineChart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "TMP Learning Portal | The Mind Point",
  description:
    "Discover The Mind Point's dedicated learning experience for psychology learners, with clearer journeys, useful resources, and progress in one place.",
  alternates: { canonical: "/learning-portal" },
};

const priorities = [
  {
    icon: Compass,
    title: "A clearer learning journey",
    text: "See where you are, understand what comes next, and keep each part of your psychology learning connected.",
  },
  {
    icon: BookMarked,
    title: "Learning that stays useful",
    text: "Return to course material and supporting resources when you need to study, reflect, or practise.",
  },
  {
    icon: LineChart,
    title: "Progress you can see",
    text: "Follow your learning in a calm interface that keeps attention on the work rather than dashboard noise.",
  },
  {
    icon: FolderHeart,
    title: "One thoughtful TMP space",
    text: "Learn in a dedicated home connected to the guidance and care behind every TMP program.",
  },
];

export default function LearningPortalPage() {
  return (
    <div className="learning-portal-page">
      <section className="relative overflow-hidden bg-[#0b3f3e] px-6 py-20 text-[#faf8f3] sm:px-10 sm:py-28 lg:px-[7vw] lg:py-36">
        <div
          className="pointer-events-none absolute -top-32 -right-24 h-[32rem] w-[32rem] rounded-full border border-[#9fd0cf]/15"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl">
          <h1 className="font-display max-w-5xl text-6xl leading-[0.92] font-medium tracking-[-0.04em] sm:text-7xl lg:text-8xl">
            Learning, with a
            <span className="block text-[#b9dedd] italic">
              place of its own.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#d2e1de] sm:text-xl sm:leading-9">
            The TMP Learning Portal gives every learner a dedicated home for
            course content, useful resources, and visible progress — organised
            to make serious psychology education easier to follow and return to.
          </p>
          <p className="mt-6 text-[0.68rem] font-bold tracking-[0.22em] text-[#9fd0cf] uppercase">
            Your courses · Your resources · Your progress
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#faf8f3] px-7 text-xs font-bold tracking-[0.08em] text-[#0f4d4d] uppercase hover:bg-white"
            >
              Explore programs
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/account"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-xs font-bold tracking-[0.08em] text-white uppercase hover:bg-white/10"
            >
              Open learner dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-[7vw]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div>
              <h2 className="font-display text-5xl leading-[0.94] font-medium tracking-[-0.04em] sm:text-6xl">
                More direction.
                <span className="text-primary block italic">
                  Less friction.
                </span>
              </h2>
              <p className="brand-kicker mt-6">Built around how people learn</p>
            </div>
            <p className="text-muted-foreground max-w-2xl text-xl leading-9 lg:pt-12">
              This is more than a place to store lessons. The portal supports
              the full experience of learning: knowing where to begin, staying
              connected to the material, and carrying it into practice.
            </p>
          </div>

          <div className="border-primary/15 mt-16 grid border-t sm:grid-cols-2">
            {priorities.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className={`border-primary/15 py-9 sm:p-10 ${
                  index % 2 === 0 ? "sm:border-r" : ""
                } ${index < 2 ? "border-b" : ""}`}
              >
                <Icon className="text-primary h-6 w-6" aria-hidden="true" />
                <h3 className="font-display mt-7 text-3xl font-semibold">
                  {title}
                </h3>
                <p className="text-muted-foreground mt-4 max-w-md leading-7">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e7f1ee] px-6 py-20 text-[#173f3d] sm:px-10 sm:py-24 lg:px-[7vw]">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="font-display max-w-4xl text-5xl leading-[0.94] font-medium tracking-[-0.04em] sm:text-6xl">
              Choose the program that moves
              <span className="block italic">you forward.</span>
            </h2>
            <p className="mt-6 text-[0.68rem] font-bold tracking-[0.2em] text-[#0f4d4d] uppercase">
              Learn · apply · revisit · grow
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#0f4d4d] px-7 text-xs font-bold tracking-[0.08em] text-white uppercase hover:bg-[#173f3d]"
          >
            Find your program
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
