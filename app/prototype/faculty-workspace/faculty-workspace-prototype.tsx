"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileWarning,
  Filter,
  GraduationCap,
  Inbox,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const workItems = [
  {
    id: 1,
    kind: "Private question",
    title: "Can you clarify reflective listening?",
    student: "Nisha Rao",
    course: "Applied counselling skills",
    age: "2h",
    state: "Overdue",
    priority: "urgent",
  },
  {
    id: 2,
    kind: "Assignment",
    title: "Listening reflection, submission 2",
    student: "Arjun Mehta",
    course: "Applied counselling skills",
    age: "5h",
    state: "Unclaimed",
    priority: "normal",
  },
  {
    id: 3,
    kind: "Completion approval",
    title: "Final completion checklist",
    student: "Meera Shah",
    course: "Foundations of counselling",
    age: "1d",
    state: "Awaiting review",
    priority: "normal",
  },
  {
    id: 4,
    kind: "Activity thread",
    title: "Difference between empathy and agreement",
    student: "Kabir Singh",
    course: "Applied counselling skills",
    age: "1d",
    state: "Claimed by you",
    priority: "normal",
  },
  {
    id: 5,
    kind: "Resource issue",
    title: "Practice dialogue video unavailable",
    student: "14 affected Students",
    course: "Applied counselling skills",
    age: "18m",
    state: "Needs routing",
    priority: "urgent",
  },
];

const variantNames = {
  A: "Review desk",
  B: "Student dossier",
  C: "Course cockpit",
} as const;
type VariantKey = keyof typeof variantNames;

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl">
        <GraduationCap className="size-4" />
      </div>
      <div>
        <p className="font-display text-lg leading-none font-semibold">
          Mind Point
        </p>
        <p className="text-muted-foreground mt-1 text-xs">Faculty workspace</p>
      </div>
    </div>
  );
}

function KindIcon({ kind }: { kind: string }) {
  if (kind === "Assignment") return <ClipboardCheck className="size-4" />;
  if (kind === "Completion approval") return <Award className="size-4" />;
  if (kind === "Resource issue") return <FileWarning className="size-4" />;
  return <MessageCircle className="size-4" />;
}

function SideNav() {
  const items = [
    ["Work queue", Inbox, true],
    ["My Courses", BookOpen, false],
    ["Students", Users, false],
    ["Announcements", Send, false],
    ["Resource checks", ShieldCheck, false],
  ] as const;
  return (
    <aside className="bg-sidebar flex h-full flex-col p-4">
      <Brand />
      <nav className="mt-8 space-y-1" aria-label="Faculty navigation">
        {items.map(([label, Icon, active]) => (
          <button
            key={label}
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active ? "bg-lavender-100 text-lavender-900" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto border-t pt-4">
        <p className="text-xs font-semibold">Dr. Rhea Joshi</p>
        <p className="text-muted-foreground mt-1 text-xs">
          3 active Faculty assignments
        </p>
      </div>
    </aside>
  );
}

function Header({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="bg-background flex min-h-16 items-center justify-between gap-4 border-b px-4 md:px-6">
      <div className="flex items-center gap-3">
        {onMenu ? (
          <button
            type="button"
            onClick={onMenu}
            className="grid size-10 place-items-center rounded-xl border lg:hidden"
            aria-label="Open Faculty navigation"
          >
            <Menu className="size-5" />
          </button>
        ) : null}
        <div>
          <h1 className="font-display text-xl font-semibold">
            Faculty work queue
          </h1>
          <p className="text-muted-foreground text-xs">
            Thursday, 11 September · Asia/Kolkata
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative grid size-10 place-items-center rounded-xl border"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="bg-terracotta absolute top-2 right-2 size-1.5 rounded-full" />
        </button>
        <button
          type="button"
          className="bg-lavender-100 text-lavender-900 grid size-10 place-items-center rounded-xl text-xs font-bold"
        >
          RJ
        </button>
      </div>
    </header>
  );
}

function QueueRows({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="divide-y border-y">
      {workItems.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`focus-visible:outline-primary grid w-full gap-3 px-4 py-4 text-left transition-colors focus-visible:outline-2 md:grid-cols-[32px_minmax(180px,1fr)_150px_56px_120px] md:items-center ${selected === item.id ? "bg-lavender-50" : "hover:bg-muted/70"}`}
        >
          <span
            className={`grid size-8 place-items-center rounded-xl ${item.priority === "urgent" ? "bg-terracotta-light text-terracotta" : "bg-lavender-100 text-primary"}`}
          >
            <KindIcon kind={item.kind} />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-sm">{item.title}</strong>
            <span className="text-muted-foreground mt-1 block text-xs">
              {item.kind} · {item.student}
            </span>
          </span>
          <span className="text-muted-foreground hidden truncate text-xs md:block">
            {item.course}
          </span>
          <span className="text-muted-foreground hidden text-xs tabular-nums md:block">
            {item.age}
          </span>
          <span
            className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${item.state === "Overdue" ? "bg-terracotta-light text-terracotta" : "bg-secondary text-secondary-foreground"}`}
          >
            {item.state}
          </span>
        </button>
      ))}
    </div>
  );
}

function QuestionDetail({
  claimed,
  onClaim,
}: {
  claimed: boolean;
  onClaim: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="bg-terracotta-light text-terracotta rounded-full px-2.5 py-1 text-xs font-semibold">
            Overdue by 24 min
          </span>
          <button
            type="button"
            className="hover:bg-muted grid size-9 place-items-center rounded-xl"
            aria-label="More actions"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
        <h2 className="font-display mt-4 text-2xl leading-tight font-semibold">
          Can you clarify reflective listening?
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Private question from Nisha Rao · Activity: The pause before a
          response
        </p>
      </div>
      <div className="border-y py-5">
        <p className="text-sm leading-6">
          I understand that I should reflect what I heard, but I am worried that
          repeating someone’s words will sound artificial. How can I respond
          naturally?
        </p>
        <p className="text-muted-foreground mt-3 text-xs">
          Asked today at 11:18 AM · Only Nisha, assigned Faculty, and authorized
          Administrators can see this.
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Related learning context</h3>
        <button
          type="button"
          className="bg-muted mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left"
        >
          <BookOpen className="text-primary size-4" />
          <span>
            <strong className="block text-sm">
              The pause before a response
            </strong>
            <span className="text-muted-foreground mt-1 block text-xs">
              Reading · Student completed today
            </span>
          </span>
        </button>
      </div>
      {claimed ? (
        <div>
          <label htmlFor="reply" className="text-sm font-semibold">
            Your answer
          </label>
          <textarea
            id="reply"
            rows={6}
            className="bg-background focus-visible:outline-primary mt-2 w-full resize-none rounded-xl border p-3 text-sm focus-visible:outline-2"
            defaultValue="Reflect the meaning rather than repeating each word. You might begin with, ‘It sounds like you felt overlooked when that happened.’"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              Send answer
            </button>
            <button
              type="button"
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
            >
              Save draft
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onClaim}
          className="bg-primary text-primary-foreground w-full rounded-xl px-4 py-3 text-sm font-semibold"
        >
          Claim and answer
        </button>
      )}
      <p className="text-muted-foreground text-xs leading-5">
        Claiming prevents duplicate Faculty work. The claim returns to the queue
        if your Faculty assignment ends.
      </p>
    </div>
  );
}

function VariantA() {
  const [selected, setSelected] = useState(1);
  const [claimed, setClaimed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const select = (id: number) => {
    setSelected(id);
    setDetailOpen(true);
    setClaimed(id === 4);
  };
  return (
    <div className="bg-background text-foreground min-h-screen lg:grid lg:grid-cols-[224px_minmax(0,1fr)]">
      <div className="hidden border-r lg:block">
        <SideNav />
      </div>
      <div className="min-w-0">
        <Header onMenu={() => setNavOpen(true)} />
        <main
          id="main-content"
          className="grid min-h-[calc(100vh-4rem)] xl:grid-cols-[minmax(0,1fr)_380px]"
        >
          <section className="min-w-0 px-4 py-6 md:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-sm">
                  8 items need your action
                </p>
                <h2 className="font-display mt-1 text-3xl font-semibold">
                  Start with what is overdue.
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium"
              >
                <Filter className="size-4" /> Filter queue
              </button>
            </div>
            <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
              <button className="bg-foreground text-background rounded-full px-3 py-1.5 text-xs font-semibold">
                All 8
              </button>
              <button className="rounded-full border px-3 py-1.5 text-xs">
                Questions 3
              </button>
              <button className="rounded-full border px-3 py-1.5 text-xs">
                Grading 3
              </button>
              <button className="rounded-full border px-3 py-1.5 text-xs">
                Completion 1
              </button>
              <button className="rounded-full border px-3 py-1.5 text-xs">
                Resources 1
              </button>
            </div>
            <div className="text-muted-foreground mt-5 hidden grid-cols-[32px_minmax(180px,1fr)_150px_56px_120px] gap-3 px-4 text-[11px] font-semibold tracking-[0.1em] uppercase md:grid">
              <span />
              <span>Work</span>
              <span>Course</span>
              <span>Age</span>
              <span>State</span>
            </div>
            <QueueRows selected={selected} onSelect={select} />
          </section>
          <aside
            className={`bg-card border-l px-6 py-7 ${detailOpen ? "fixed inset-0 z-40 overflow-y-auto xl:static xl:block" : "hidden xl:block"}`}
          >
            <button
              type="button"
              onClick={() => setDetailOpen(false)}
              className="mb-5 grid size-10 place-items-center rounded-xl border xl:hidden"
              aria-label="Back to queue"
            >
              <ArrowLeft className="size-4" />
            </button>
            {selected === 5 ? (
              <ResourceDetail />
            ) : (
              <QuestionDetail
                claimed={claimed}
                onClaim={() => setClaimed(true)}
              />
            )}
          </aside>
        </main>
      </div>
      {navOpen ? (
        <div
          className="bg-foreground/25 fixed inset-0 z-50 lg:hidden"
          onClick={() => setNavOpen(false)}
        >
          <div
            className="h-full w-72"
            onClick={(event) => event.stopPropagation()}
          >
            <SideNav />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResourceDetail() {
  return (
    <div className="space-y-6">
      <div>
        <span className="bg-terracotta-light text-terracotta rounded-full px-2.5 py-1 text-xs font-semibold">
          14 Students affected
        </span>
        <h2 className="font-display mt-4 text-2xl font-semibold">
          Practice dialogue video unavailable
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Required Media · Curriculum version 3 · Batch September 2026
        </p>
      </div>
      <div className="border-y py-5">
        <h3 className="text-sm font-semibold">What Faculty can do</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Propose an equivalent approved replacement, add a lawful fallback, or
          route the issue to an Administrator. Prior Completion evidence remains
          unchanged.
        </p>
      </div>
      <button
        type="button"
        className="bg-primary text-primary-foreground w-full rounded-xl px-4 py-3 text-sm font-semibold"
      >
        Propose replacement
      </button>
      <button
        type="button"
        className="w-full rounded-xl border px-4 py-3 text-sm font-semibold"
      >
        Route to Administrator
      </button>
    </div>
  );
}

function VariantB() {
  const [student, setStudent] = useState("Nisha Rao");
  const students = ["Nisha Rao", "Arjun Mehta", "Meera Shah", "Kabir Singh"];
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-7 md:px-7">
        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)_320px]">
          <aside>
            <label className="relative block">
              <Search className="text-muted-foreground absolute top-3 left-3 size-4" />
              <input
                className="bg-card w-full rounded-xl border py-2.5 pr-3 pl-9 text-sm"
                placeholder="Find a Student"
              />
            </label>
            <nav className="mt-4 space-y-1" aria-label="Students">
              {students.map((name, index) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setStudent(name)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${student === name ? "bg-lavender-100" : "hover:bg-muted"}`}
                >
                  <span className="bg-secondary grid size-8 place-items-center rounded-full text-xs font-semibold">
                    {name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <span>
                    <strong className="block text-sm">{name}</strong>
                    <span className="text-muted-foreground text-xs">
                      {index + 1} open item{index ? "s" : ""}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </aside>
          <section>
            <div className="border-b pb-5">
              <h1 className="font-display text-3xl font-semibold">{student}</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Applied counselling skills · September 2026 batch
              </p>
            </div>
            <div className="before:bg-border relative mt-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px">
              <Timeline
                icon={MessageCircle}
                title="Private question needs an answer"
                detail="Can you clarify reflective listening?"
                time="2 hours ago"
                urgent
              />
              <Timeline
                icon={Check}
                title="Reading completed"
                detail="The pause before a response"
                time="Today at 10:52 AM"
              />
              <Timeline
                icon={ClipboardCheck}
                title="Quiz passed"
                detail="Listening foundations · 84%"
                time="Yesterday"
              />
            </div>
          </section>
          <aside className="border-l pl-6">
            <h2 className="font-display text-xl font-semibold">
              Next Faculty action
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Answer Nisha’s private question before reviewing later activity.
            </p>
            <button
              type="button"
              className="bg-primary text-primary-foreground mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold"
            >
              Open question
            </button>
            <div className="mt-7 border-t pt-5">
              <p className="text-sm font-semibold">Completion</p>
              <p className="text-muted-foreground mt-2 text-sm">
                4 of 9 required activities complete
              </p>
              <div className="bg-lavender-100 mt-3 h-2 rounded-full">
                <div className="bg-primary h-full w-[44%] rounded-full" />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Timeline({
  icon: Icon,
  title,
  detail,
  time,
  urgent = false,
}: {
  icon: typeof Check;
  title: string;
  detail: string;
  time: string;
  urgent?: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      <span
        className={`z-10 grid size-8 shrink-0 place-items-center rounded-full ${urgent ? "bg-terracotta-light text-terracotta" : "bg-lavender-100 text-primary"}`}
      >
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{detail}</p>
        <p className="text-muted-foreground mt-2 text-xs">{time}</p>
      </div>
    </div>
  );
}

function VariantC() {
  const panels = [
    {
      title: "Questions",
      value: "3",
      detail: "1 overdue",
      icon: MessageCircle,
    },
    {
      title: "Grading",
      value: "3",
      detail: "Oldest 5 hours",
      icon: ClipboardCheck,
    },
    {
      title: "Completion",
      value: "1",
      detail: "Ready for approval",
      icon: Award,
    },
    {
      title: "Resource issues",
      value: "1",
      detail: "14 Students affected",
      icon: AlertTriangle,
    },
  ];
  return (
    <div className="text-foreground min-h-screen bg-[#eeeaf5]">
      <header className="bg-lavender-900 flex items-center justify-between px-5 py-4 text-white">
        <Brand />
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-white/25"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>
      </header>
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-7 md:px-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Applied counselling skills
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              September 2026 batch · 42 active Students
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-medium"
          >
            Change Course <ChevronDown className="size-4" />
          </button>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {panels.map(({ title, value, detail, icon: Icon }) => (
            <button
              key={title}
              type="button"
              className="rounded-2xl bg-white p-5 text-left shadow-[0_14px_35px_-28px_rgba(40,27,64,0.7)]"
            >
              <Icon className="text-primary size-5" />
              <span className="font-display mt-5 block text-3xl font-semibold">
                {value}
              </span>
              <strong className="mt-1 block text-sm">{title}</strong>
              <span className="text-muted-foreground mt-2 block text-xs">
                {detail}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">
                Priority work
              </h2>
              <button
                type="button"
                className="text-primary text-sm font-semibold"
              >
                View full queue
              </button>
            </div>
            <div className="mt-4">
              <QueueRows selected={1} onSelect={() => undefined} />
            </div>
          </section>
          <aside className="bg-lavender-900 rounded-2xl p-6 text-white">
            <h2 className="font-display text-2xl font-semibold">
              Batch health
            </h2>
            <div className="mt-5 space-y-5">
              <Health label="Required progress" value="61% median" />
              <Health label="Unanswered questions" value="3" />
              <Health label="Awaiting Faculty review" value="4 Students" />
            </div>
            <button
              type="button"
              className="text-lavender-900 mt-7 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold"
            >
              Open Student list
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Health({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/20 pb-4">
      <p className="text-lavender-200 text-xs">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function PrototypeSwitcher({ current }: { current: VariantKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const keys = Object.keys(variantNames) as VariantKey[];
  const cycle = (direction: number) => {
    const index = keys.indexOf(current);
    router.replace(
      `${pathname}?variant=${keys[(index + direction + keys.length) % keys.length]}`,
    );
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA"].includes(target.tagName) ||
        target.isContentEditable
      )
        return;
      if (event.key === "ArrowLeft") cycle(-1);
      if (event.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <div className="bg-foreground text-background fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full p-2 shadow-[0_12px_35px_-12px_rgba(0,0,0,0.55)]">
      <button
        type="button"
        onClick={() => cycle(-1)}
        className="hover:bg-background/15 grid size-9 place-items-center rounded-full"
        aria-label="Previous prototype variant"
      >
        <ArrowLeft className="size-4" />
      </button>
      <span className="min-w-40 text-center text-xs font-semibold">
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

export default function FacultyWorkspacePrototype() {
  const selected = useSearchParams().get("variant");
  const variant: VariantKey =
    selected === "B" || selected === "C" ? selected : "A";
  return (
    <div className="bg-background selection:bg-lavender-200 selection:text-lavender-900 fixed inset-0 z-[100] overflow-y-auto">
      {variant === "A" ? <VariantA /> : null}
      {variant === "B" ? <VariantB /> : null}
      {variant === "C" ? <VariantC /> : null}
      <PrototypeSwitcher current={variant} />
    </div>
  );
}
