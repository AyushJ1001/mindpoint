"use client";

import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Download,
  FileQuestion,
  Flag,
  ListTree,
  LockKeyhole,
  Menu,
  MessageCircle,
  PlayCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const modules = [
  {
    title: "Foundations of active listening",
    progress: "3 of 3 complete",
    activities: [
      {
        title: "Why listening changes the room",
        type: "Reading",
        state: "done",
      },
      { title: "Listening without fixing", type: "Media", state: "done" },
      { title: "Check your understanding", type: "Quiz", state: "done" },
    ],
  },
  {
    title: "Practice and reflection",
    progress: "1 of 4 complete",
    activities: [
      {
        title: "The pause before a response",
        type: "Reading",
        state: "current",
      },
      { title: "Observe a practice dialogue", type: "Media", state: "ready" },
      {
        title: "Write a listening reflection",
        type: "Assignment",
        state: "ready",
      },
      { title: "Module reflection", type: "Feedback", state: "locked" },
    ],
  },
  {
    title: "Applied conversation skills",
    progress: "Starts after Module 2",
    activities: [
      { title: "Responding to emotion", type: "Reading", state: "locked" },
      { title: "Final practice review", type: "Assignment", state: "locked" },
    ],
  },
];

const variantNames = {
  A: "Study desk",
  B: "Learning trail",
  C: "Focus canvas",
} as const;

type VariantKey = keyof typeof variantNames;

function CourseMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl">
        <BookOpen className="size-4" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-lg leading-none font-semibold">
          Mind Point
        </p>
        <p className="text-muted-foreground mt-1 text-xs">Student workspace</p>
      </div>
    </div>
  );
}

function ProgressBar({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "min-w-40" : "w-full"}>
      <div className="mb-2 flex items-center justify-between gap-4 text-xs">
        <span className="font-medium">Course progress</span>
        <span className="text-muted-foreground tabular-nums">44%</span>
      </div>
      <div
        className="bg-lavender-100 h-2 overflow-hidden rounded-full"
        aria-label="Course progress: 44 percent"
        role="progressbar"
        aria-valuenow={44}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="bg-primary h-full w-[44%] rounded-full" />
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  if (type === "Media")
    return <PlayCircle className="size-4" aria-hidden="true" />;
  if (type === "Quiz")
    return <FileQuestion className="size-4" aria-hidden="true" />;
  if (type === "Assignment" || type === "Feedback")
    return <ClipboardCheck className="size-4" aria-hidden="true" />;
  return <BookOpen className="size-4" aria-hidden="true" />;
}

function ActivityState({ state }: { state: string }) {
  if (state === "done")
    return <Check className="size-4 text-emerald-700" aria-label="Completed" />;
  if (state === "locked")
    return (
      <LockKeyhole
        className="text-muted-foreground size-3.5"
        aria-label="Locked"
      />
    );
  return (
    <span
      className={`size-2.5 rounded-full ${state === "current" ? "bg-primary" : "border-primary border"}`}
      aria-label={state === "current" ? "In progress" : "Available"}
    />
  );
}

function CourseOutline({ onSelect }: { onSelect?: () => void }) {
  return (
    <nav aria-label="Course outline" className="space-y-5">
      {modules.map((module, moduleIndex) => (
        <section key={module.title} aria-labelledby={`module-${moduleIndex}`}>
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
                Module {moduleIndex + 1}
              </p>
              <h2
                id={`module-${moduleIndex}`}
                className="mt-1 font-sans text-sm leading-snug font-semibold"
              >
                {module.title}
              </h2>
            </div>
            <ChevronDown
              className="text-muted-foreground mt-1 size-4 shrink-0"
              aria-hidden="true"
            />
          </div>
          <p className="text-muted-foreground mb-2 text-xs">
            {module.progress}
          </p>
          <ol className="space-y-1">
            {module.activities.map((activity) => (
              <li key={activity.title}>
                <button
                  type="button"
                  onClick={onSelect}
                  disabled={activity.state === "locked"}
                  className={`focus-visible:outline-primary flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${activity.state === "current" ? "bg-lavender-100 text-lavender-900 font-semibold" : "hover:bg-muted disabled:opacity-60"}`}
                >
                  <ActivityState state={activity.state} />
                  <span className="min-w-0 flex-1 truncate">
                    {activity.title}
                  </span>
                  <ActivityIcon type={activity.type} />
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </nav>
  );
}

function ReadingContent({
  completed,
  onComplete,
}: {
  completed: boolean;
  onComplete: () => void;
}) {
  return (
    <article className="mx-auto w-full max-w-[760px]">
      <div className="text-muted-foreground mb-8 flex flex-wrap items-center gap-2 text-xs">
        <span className="bg-lavender-100 text-lavender-900 rounded-full px-3 py-1 font-medium">
          Reading
        </span>
        <span>Required</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <Clock3 className="size-3.5" /> 8 min
        </span>
      </div>
      <h1 className="font-display text-foreground max-w-[16ch] text-4xl leading-[1.05] font-semibold tracking-[-0.025em] md:text-5xl">
        The pause before a response
      </h1>
      <p className="text-muted-foreground mt-5 max-w-[65ch] text-lg leading-8">
        A short pause can turn an automatic reply into an attentive response.
        This activity asks you to notice what becomes possible in that space.
      </p>

      <div className="text-foreground/90 mt-10 max-w-[68ch] space-y-7 text-[15px] leading-7">
        <p>
          When someone finishes speaking, the urge to answer arrives quickly. We
          may reassure, solve, compare, or ask another question before we have
          understood what the person meant.
        </p>
        <section>
          <h2 className="font-display mb-3 text-2xl font-semibold">
            Try one full breath
          </h2>
          <p>
            Let one natural breath pass before you respond. Keep your attention
            on the speaker rather than preparing the perfect sentence. The pause
            gives you time to notice their words, tone, and what remains
            uncertain.
          </p>
        </section>
        <blockquote className="bg-lavender-50 font-display text-lavender-900 rounded-2xl px-6 py-5 text-xl leading-8">
          “A useful response begins with an accurate understanding.”
        </blockquote>
        <section>
          <h2 className="font-display mb-3 text-2xl font-semibold">
            A practice prompt
          </h2>
          <p>
            Think of a recent conversation where you moved too quickly toward
            advice. What might you have learned by asking, “Would you like me to
            listen, help you think, or offer a suggestion?”
          </p>
        </section>
      </div>

      <section
        className="mt-10 border-y py-5"
        aria-labelledby="resources-heading"
      >
        <h2 id="resources-heading" className="font-sans text-sm font-semibold">
          Supporting resources
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Practice reflection sheet</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Accessible PDF · 148 KB · Download permitted
            </p>
          </div>
          <button
            type="button"
            className="hover:bg-muted focus-visible:outline-primary inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Download className="size-4" /> Download
          </button>
        </div>
      </section>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="hover:bg-muted inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
        >
          <ArrowLeft className="size-4" /> Previous
        </button>
        <button
          type="button"
          onClick={onComplete}
          className={`focus-visible:outline-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${completed ? "bg-emerald-100 text-emerald-900" : "bg-primary text-primary-foreground hover:bg-lavender-700"}`}
        >
          <Check className="size-4" />{" "}
          {completed ? "Reading completed" : "Mark reading complete"}
        </button>
        <button
          type="button"
          className="hover:bg-muted inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
        >
          Next <ArrowRight className="size-4" />
        </button>
      </div>
    </article>
  );
}

function SupportRail() {
  return (
    <aside className="space-y-6" aria-label="Course support and completion">
      <ProgressBar />
      <section className="border-t pt-5">
        <div className="flex items-center gap-2">
          <Award className="text-primary size-4" />
          <h2 className="font-sans text-sm font-semibold">
            Certificate status
          </h2>
        </div>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Complete 5 remaining requirements. Final Faculty approval is then
          required.
        </p>
        <button
          type="button"
          className="text-primary mt-3 text-sm font-semibold underline underline-offset-4"
        >
          View completion checklist
        </button>
      </section>
      <section className="border-t pt-5">
        <h2 className="font-sans text-sm font-semibold">Need help here?</h2>
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            className="hover:bg-muted flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm"
          >
            <MessageCircle className="text-primary size-4" /> Ask Faculty
            privately
          </button>
          <button
            type="button"
            className="hover:bg-muted flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm"
          >
            <CircleHelp className="text-primary size-4" /> Open activity
            discussion
          </button>
        </div>
        <p className="text-muted-foreground mt-3 text-xs leading-5">
          Faculty usually replies within 2 business days.
        </p>
      </section>
      <section className="border-t pt-5">
        <h2 className="font-sans text-sm font-semibold">Accessibility</h2>
        <button
          type="button"
          className="text-primary mt-3 flex items-center gap-2 text-sm underline underline-offset-4"
        >
          <Accessibility className="size-4" /> Reading options
        </button>
        <button
          type="button"
          className="text-muted-foreground mt-3 flex items-center gap-2 text-sm underline underline-offset-4"
        >
          <Flag className="size-4" /> Report a barrier or resource issue
        </button>
      </section>
    </aside>
  );
}

function TopBar({ onOutline }: { onOutline?: () => void }) {
  return (
    <header className="bg-background/95 flex min-h-16 items-center justify-between gap-4 border-b px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-4">
        {onOutline ? (
          <button
            type="button"
            onClick={onOutline}
            className="grid size-10 place-items-center rounded-xl border lg:hidden"
            aria-label="Open course outline"
          >
            <Menu className="size-5" />
          </button>
        ) : null}
        <CourseMark />
        <div className="bg-border hidden h-8 w-px md:block" />
        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-semibold">
            Applied counselling skills
          </p>
          <p className="text-muted-foreground text-xs">Module 2 of 3</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <ProgressBar compact />
        </div>
        <button
          type="button"
          className="hover:bg-muted relative grid size-10 place-items-center rounded-xl border"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="bg-terracotta absolute top-2 right-2 size-1.5 rounded-full" />
        </button>
        <button
          type="button"
          className="bg-lavender-100 text-lavender-900 grid size-10 place-items-center rounded-xl text-sm font-semibold"
          aria-label="Student profile"
        >
          AJ
        </button>
      </div>
    </header>
  );
}

function VariantA({
  completed,
  onComplete,
}: {
  completed: boolean;
  onComplete: () => void;
}) {
  const [outlineOpen, setOutlineOpen] = useState(false);
  return (
    <div className="bg-background text-foreground min-h-screen">
      <TopBar onOutline={() => setOutlineOpen(true)} />
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[264px_minmax(0,1fr)_288px]">
        <aside className="bg-sidebar hidden border-r px-4 py-6 lg:block">
          <CourseOutline />
        </aside>
        <main id="main-content" className="px-5 py-9 md:px-10 md:py-12">
          <ReadingContent completed={completed} onComplete={onComplete} />
        </main>
        <div className="bg-card hidden border-l px-5 py-7 lg:block">
          <SupportRail />
        </div>
      </div>
      {outlineOpen ? (
        <div
          className="bg-foreground/25 fixed inset-0 z-40 lg:hidden"
          onClick={() => setOutlineOpen(false)}
        >
          <aside
            className="bg-background h-full w-[min(88vw,340px)] overflow-y-auto p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">
                Course outline
              </h2>
              <button
                type="button"
                onClick={() => setOutlineOpen(false)}
                className="grid size-10 place-items-center rounded-xl border"
                aria-label="Close course outline"
              >
                <X className="size-5" />
              </button>
            </div>
            <CourseOutline onSelect={() => setOutlineOpen(false)} />
          </aside>
        </div>
      ) : null}
      <div className="bg-card border-t px-5 py-5 lg:hidden">
        <SupportRail />
      </div>
    </div>
  );
}

function VariantB({
  completed,
  onComplete,
}: {
  completed: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <TopBar />
      <main id="main-content" className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="mb-8 grid gap-5 border-b pb-7 md:grid-cols-[1fr_280px] md:items-end">
          <div>
            <p className="text-primary text-sm font-semibold">
              Module 2 · Practice and reflection
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold">
              Your learning trail
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Continue the current activity, then follow the released path.
            </p>
          </div>
          <ProgressBar />
        </div>
        <div className="grid gap-9 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav
            aria-label="Current module"
            className="relative space-y-1 lg:border-r lg:pr-6"
          >
            {modules[1].activities.map((activity, index) => (
              <button
                key={activity.title}
                type="button"
                disabled={activity.state === "locked"}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left ${activity.state === "current" ? "bg-lavender-100" : "hover:bg-muted disabled:opacity-50"}`}
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-xs">
                  {index + 1}
                </span>
                <span>
                  <strong className="block text-sm">{activity.title}</strong>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {activity.type}
                  </span>
                </span>
              </button>
            ))}
          </nav>
          <div>
            <ReadingContent completed={completed} onComplete={onComplete} />
            <div className="mt-10 grid gap-5 border-t pt-7 md:grid-cols-3">
              <button type="button" className="text-left">
                <MessageCircle className="text-primary size-5" />
                <strong className="mt-2 block text-sm">Ask Faculty</strong>
                <span className="text-muted-foreground mt-1 block text-xs">
                  Start a private question
                </span>
              </button>
              <button type="button" className="text-left">
                <ListTree className="text-primary size-5" />
                <strong className="mt-2 block text-sm">
                  Course discussion
                </strong>
                <span className="text-muted-foreground mt-1 block text-xs">
                  Read the activity thread
                </span>
              </button>
              <button type="button" className="text-left">
                <Award className="text-primary size-5" />
                <strong className="mt-2 block text-sm">Completion</strong>
                <span className="text-muted-foreground mt-1 block text-xs">
                  5 requirements remain
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function VariantC({
  completed,
  onComplete,
}: {
  completed: boolean;
  onComplete: () => void;
}) {
  const [mapOpen, setMapOpen] = useState(false);
  return (
    <div className="text-foreground min-h-screen bg-[#ede9f4]">
      <header className="bg-lavender-900 flex items-center justify-between px-5 py-4 text-white">
        <CourseMark />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMapOpen(!mapOpen)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-3 py-2 text-sm"
          >
            <ListTree className="size-4" /> Course map
          </button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl border border-white/25"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </button>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 xl:grid-cols-[minmax(0,1fr)_300px]"
      >
        <section className="min-w-0 rounded-2xl bg-white px-5 py-8 shadow-[0_18px_50px_-35px_rgba(37,24,57,0.6)] md:px-12 md:py-12">
          <ReadingContent completed={completed} onComplete={onComplete} />
        </section>
        <aside className="bg-lavender-900 space-y-5 rounded-2xl p-6 text-white xl:sticky xl:top-6 xl:h-fit">
          <p className="text-lavender-200 text-xs font-semibold tracking-[0.12em] uppercase">
            Today
          </p>
          <h2 className="font-display text-2xl font-semibold">
            One activity at a time.
          </h2>
          <p className="text-lavender-100 text-sm leading-6">
            Finish this Reading, then the practice dialogue becomes your next
            available activity.
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-[44%] bg-white" />
          </div>
          <p className="text-sm">44% of required activities complete</p>
          <div className="border-t border-white/20 pt-5">
            <button
              type="button"
              className="text-lavender-900 flex w-full items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold"
            >
              <MessageCircle className="size-4" /> Ask Faculty privately
            </button>
            <button
              type="button"
              className="text-lavender-100 mt-3 flex items-center gap-2 text-sm"
            >
              <Accessibility className="size-4" /> Accessibility options
            </button>
          </div>
        </aside>
      </main>
      {mapOpen ? (
        <div className="bg-background fixed inset-y-0 right-0 z-40 w-[min(92vw,380px)] overflow-y-auto border-l p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Course map</h2>
            <button
              type="button"
              onClick={() => setMapOpen(false)}
              className="grid size-10 place-items-center rounded-xl border"
              aria-label="Close course map"
            >
              <X className="size-5" />
            </button>
          </div>
          <CourseOutline onSelect={() => setMapOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}

function PrototypeSwitcher({ current }: { current: VariantKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const keys = Object.keys(variantNames) as VariantKey[];
  const cycle = (direction: number) => {
    const currentIndex = keys.indexOf(current);
    const next = keys[(currentIndex + direction + keys.length) % keys.length];
    router.replace(`${pathname}?variant=${next}`);
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA"].includes(target.tagName) ||
        target.isContentEditable
      )
        return;
      if (event.key === "ArrowLeft") cycle(-1);
      if (event.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
  return (
    <div className="bg-foreground text-background fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-2 py-2 shadow-[0_12px_35px_-12px_rgba(0,0,0,0.55)]">
      <button
        type="button"
        onClick={() => cycle(-1)}
        className="hover:bg-background/15 grid size-9 place-items-center rounded-full"
        aria-label="Previous prototype variant"
      >
        <ArrowLeft className="size-4" />
      </button>
      <span className="min-w-36 text-center text-xs font-semibold">
        {current} · {variantNames[current]}
      </span>
      <button
        type="button"
        onClick={() => cycle(1)}
        className="hover:bg-background/15 grid size-9 place-items-center rounded-full"
        aria-label="Next prototype variant"
      >
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

export default function StudentWorkspacePrototype() {
  const searchParams = useSearchParams();
  const selected = searchParams.get("variant");
  const variant: VariantKey =
    selected === "B" || selected === "C" ? selected : "A";
  const [completed, setCompleted] = useState(false);
  return (
    <div className="bg-background selection:bg-lavender-200 selection:text-lavender-900 fixed inset-0 z-[100] overflow-y-auto">
      {variant === "A" ? (
        <VariantA
          completed={completed}
          onComplete={() => setCompleted(!completed)}
        />
      ) : null}
      {variant === "B" ? (
        <VariantB
          completed={completed}
          onComplete={() => setCompleted(!completed)}
        />
      ) : null}
      {variant === "C" ? (
        <VariantC
          completed={completed}
          onComplete={() => setCompleted(!completed)}
        />
      ) : null}
      <PrototypeSwitcher current={variant} />
    </div>
  );
}
