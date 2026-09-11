import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Check,
  Compass,
  FolderHeart,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  LogIn,
} from "lucide-react";

export const metadata: Metadata = {
  title: "TMP Learning Portal | Learn with clarity",
  description:
    "See how the TMP Learning Portal connects your enrolled programs, learning resources, schedule, and progress in one focused learner space.",
  alternates: { canonical: "/learning-portal" },
};

const steps = [
  {
    number: "01",
    title: "Choose your program",
    text: "Compare formats, schedules, and fees, then select the TMP program that fits where you want to go.",
  },
  {
    number: "02",
    title: "Complete your enrollment",
    text: "Enroll through the website and use your TMP account as the starting point for your learner journey.",
  },
  {
    number: "03",
    title: "Enter your learning space",
    text: "Open My Learning to find your enrolled program and the information connected to it in one place.",
  },
  {
    number: "04",
    title: "Keep moving forward",
    text: "Return whenever you need to continue learning, revisit what matters, or check what comes next.",
  },
];

const priorities = [
  {
    icon: Compass,
    title: "Know what comes next",
    text: "Move through your learning journey with a clearer sense of where you are and what deserves your attention next.",
  },
  {
    icon: BookMarked,
    title: "Keep learning within reach",
    text: "Bring enrolled programs and the resources connected to them into a space designed for returning, reflecting, and practising.",
  },
  {
    icon: LineChart,
    title: "See your journey take shape",
    text: "Keep your program details and progress visible without turning learning into a noisy, complicated dashboard.",
  },
  {
    icon: FolderHeart,
    title: "Stay connected to TMP",
    text: "Your learning space sits within the same thoughtful ecosystem as TMP programs, guidance, and learner support.",
  },
];

const portalHighlights = [
  "Your enrolled programs in one view",
  "Schedules and course details kept close",
  "A clear route back into your learning",
];

const learningMoments = [
  {
    title: "Before you enroll",
    text: "Understand the program, format, schedule, and investment before you decide.",
  },
  {
    title: "While you are learning",
    text: "Return to one familiar space for the program information that keeps you moving.",
  },
  {
    title: "As your journey grows",
    text: "See your TMP enrollments together and stay connected to what you have chosen to learn.",
  },
];

export default function LearningPortalPage() {
  return (
    <div className="learning-portal-page bg-[#fbfaf6] text-[#173f3d]">
      <section className="relative overflow-hidden bg-[#0b3f3e] px-6 py-16 text-[#faf8f3] sm:px-10 sm:py-28 lg:px-[7vw] lg:py-32">
        <div
          className="pointer-events-none absolute -top-32 -right-24 h-[32rem] w-[32rem] rounded-full border border-[#9fd0cf]/15"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.24em] text-[#9fd0cf] uppercase">
              The TMP Learning Portal
            </p>
            <h1 className="font-display mt-6 max-w-5xl text-6xl leading-[0.9] font-medium tracking-[-0.045em] sm:text-7xl lg:text-[5.75rem]">
              Your learning should feel
              <span className="block text-[#b9dedd] italic">
                easy to return to.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#d2e1de] sm:text-xl sm:leading-9">
              From enrollment to ongoing learning, the TMP Learning Portal gives
              your psychology journey one clear home — so you spend less time
              searching and more time learning.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#faf8f3] px-7 text-xs font-bold tracking-[0.08em] text-[#0f4d4d] uppercase hover:bg-white"
              >
                Find your program
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/account"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-xs font-bold tracking-[0.08em] text-white uppercase hover:bg-white/10"
              >
                Open My Learning
              </Link>
            </div>
            <div className="mt-8 space-y-3">
              {portalHighlights.map((highlight) => (
                <p
                  key={highlight}
                  className="flex items-center gap-3 text-sm text-[#e8f1ef] sm:text-base"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9fd0cf]/15">
                    <Check
                      className="h-3.5 w-3.5 text-[#b9dedd]"
                      aria-hidden="true"
                    />
                  </span>
                  {highlight}
                </p>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="rounded-[1.75rem] border border-white/15 bg-[#f8f5ee] p-7 text-[#173f3d] shadow-[0_35px_90px_-30px_rgba(0,0,0,0.55)] sm:p-9">
              <p className="text-[0.6rem] font-bold tracking-[0.18em] text-[#0f4d4d] uppercase">
                Your route into My Learning
              </p>
              <h2 className="font-display mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
                One connected journey,
                <span className="block text-[#0f4d4d] italic">
                  from choice to course.
                </span>
              </h2>
              <ol className="mt-8 space-y-3">
                {[
                  {
                    icon: GraduationCap,
                    label: "Choose a TMP program",
                    detail: "Compare the format, schedule, and fee.",
                  },
                  {
                    icon: LogIn,
                    label: "Enroll with your TMP account",
                    detail: "Complete the website enrollment flow.",
                  },
                  {
                    icon: LayoutDashboard,
                    label: "Return through My Learning",
                    detail: "Find your enrolled programs in your account.",
                  },
                ].map(({ icon: Icon, label, detail }, index) => (
                  <li
                    key={label}
                    className="grid grid-cols-[auto_1fr] gap-x-4 rounded-[1rem] bg-[#e7f1ee] p-4"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f4d4d] text-white">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold text-[#173f3d]">
                        <span className="mr-2 text-xs text-[#0f4d4d]">
                          0{index + 1}
                        </span>
                        {label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#526a66]">
                        {detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <p className="mt-4 text-center text-[0.58rem] tracking-[0.16em] text-[#9fd0cf] uppercase">
              Choose · Enroll · Return through My Learning
            </p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="px-6 py-20 sm:px-10 sm:py-28 lg:px-[7vw]"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div>
              <p className="text-[0.68rem] font-bold tracking-[0.24em] text-[#0f4d4d] uppercase">
                How it works
              </p>
              <h2 className="font-display mt-5 text-5xl leading-[0.94] font-medium tracking-[-0.04em] sm:text-6xl">
                From choosing to
                <span className="block text-[#0f4d4d] italic">continuing.</span>
              </h2>
            </div>
            <p className="max-w-2xl text-xl leading-9 text-[#5e706d] lg:pt-10">
              The portal connects the moments that usually feel scattered. Your
              program choice, enrollment, learner space, and next step become
              one continuous TMP experience.
            </p>
          </div>

          <ol className="mt-16 grid border-t border-[#0f4d4d]/15 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={step.number}
                className={`border-[#0f4d4d]/15 py-9 md:p-8 ${
                  index % 2 === 0 ? "md:border-r" : ""
                } ${index < 2 ? "border-b xl:border-b-0" : ""} ${
                  index === 1 ? "xl:border-r" : ""
                }`}
              >
                <span className="font-display text-4xl text-[#0f4d4d] italic">
                  {step.number}
                </span>
                <h3 className="font-display mt-7 text-3xl font-semibold">
                  {step.title}
                </h3>
                <p className="mt-4 leading-7 text-[#5e706d]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f0ede4] px-6 py-20 sm:px-10 sm:py-28 lg:px-[7vw]">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-bold tracking-[0.24em] text-[#0f4d4d] uppercase">
              Why learners need it
            </p>
            <h2 className="font-display mt-5 text-5xl leading-[0.94] font-medium tracking-[-0.04em] sm:text-6xl">
              More direction.
              <span className="block text-[#0f4d4d] italic">
                Less friction.
              </span>
            </h2>
            <p className="mt-7 text-xl leading-9 text-[#5e706d]">
              Learning should not disappear inside emails, links, and forgotten
              tabs. The portal keeps your TMP journey easier to find,
              understand, and continue.
            </p>
          </div>

          <div className="mt-16 grid border-t border-[#0f4d4d]/15 sm:grid-cols-2">
            {priorities.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className={`border-[#0f4d4d]/15 py-9 sm:p-10 ${
                  index % 2 === 0 ? "sm:border-r" : ""
                } ${index < 2 ? "border-b" : ""}`}
              >
                <Icon className="h-6 w-6 text-[#0f4d4d]" aria-hidden="true" />
                <h3 className="font-display mt-7 text-3xl font-semibold">
                  {title}
                </h3>
                <p className="mt-4 max-w-md leading-7 text-[#5e706d]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 sm:py-28 lg:px-[7vw]">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-24">
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.24em] text-[#0f4d4d] uppercase">
              Built for real learning
            </p>
            <h2 className="font-display mt-5 text-5xl leading-[0.94] font-medium tracking-[-0.04em] sm:text-6xl">
              Not just access.
              <span className="block text-[#0f4d4d] italic">
                A sense of continuity.
              </span>
            </h2>
          </div>
          <div className="border-t border-[#0f4d4d]/15">
            {learningMoments.map(({ title, text }) => (
              <div
                key={title}
                className="grid gap-3 border-b border-[#0f4d4d]/15 py-7 sm:grid-cols-[0.65fr_1.35fr] sm:gap-8"
              >
                <h3 className="font-display text-2xl font-semibold">{title}</h3>
                <p className="leading-7 text-[#5e706d]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e7f1ee] px-6 py-20 text-[#173f3d] sm:px-10 sm:py-24 lg:px-[7vw]">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.2em] text-[#0f4d4d] uppercase">
              Your next step starts here
            </p>
            <h2 className="font-display mt-5 max-w-4xl text-5xl leading-[0.94] font-medium tracking-[-0.04em] sm:text-6xl">
              Choose the program that moves
              <span className="block italic">you forward.</span>
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/courses"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#0f4d4d] px-7 text-xs font-bold tracking-[0.08em] text-white uppercase hover:bg-[#173f3d]"
            >
              Explore TMP programs
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/account"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#0f4d4d]/25 px-7 text-xs font-bold tracking-[0.08em] text-[#0f4d4d] uppercase hover:bg-white/45"
            >
              I am already a learner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
