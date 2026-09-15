"use client";

import { useMemo, useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  MessageSquareText,
  PanelLeft,
  PenLine,
  Play,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Role = "student" | "faculty" | "administrator";
type ActivityStatus = "complete" | "current" | "available" | "locked";

type Activity = {
  id: string;
  title: string;
  type: "Reading" | "Media" | "Quiz" | "Assignment" | "Feedback";
  duration: string;
  status: ActivityStatus;
};

const activities: Activity[] = [
  {
    id: "foundations",
    title: "Foundations of therapeutic listening",
    type: "Reading",
    duration: "18 min",
    status: "complete",
  },
  {
    id: "observation",
    title: "Observe a first-session conversation",
    type: "Media",
    duration: "24 min",
    status: "complete",
  },
  {
    id: "reflection",
    title: "Reflection: noticing without fixing",
    type: "Assignment",
    duration: "35 min",
    status: "current",
  },
  {
    id: "check",
    title: "Knowledge check",
    type: "Quiz",
    duration: "10 min",
    status: "available",
  },
  {
    id: "feedback",
    title: "Module feedback",
    type: "Feedback",
    duration: "4 min",
    status: "locked",
  },
];

const queueSeed = [
  {
    id: "submission",
    title: "Reflection submission",
    student: "Riya Mehta",
    course: "Counselling Skills Certificate",
    age: "42 min",
    kind: "Assignment",
    detail:
      "Riya connected active listening to a difficult peer-support conversation and asked for guidance on when reflection becomes advice.",
  },
  {
    id: "question",
    title: "Private question about boundaries",
    student: "Kabir Sharma",
    course: "Counselling Skills Certificate",
    age: "3 hr",
    kind: "Question",
    detail:
      "Can I use the observation worksheet with a family member, or should practice stay within the classroom scenario?",
  },
  {
    id: "completion",
    title: "Completion approval",
    student: "Ananya Rao",
    course: "Counselling Skills Certificate",
    age: "Yesterday",
    kind: "Completion",
    detail:
      "All required activities and assessments are complete. The final Faculty approval is ready for review.",
  },
];

const roleMeta: Record<
  Role,
  {
    label: string;
    mobileLabel: string;
    description: string;
    icon: typeof GraduationCap;
  }
> = {
  student: {
    label: "Student",
    mobileLabel: "Student",
    description: "Learn and complete",
    icon: GraduationCap,
  },
  faculty: {
    label: "Faculty",
    mobileLabel: "Faculty",
    description: "Review and support",
    icon: ClipboardCheck,
  },
  administrator: {
    label: "Administrator",
    mobileLabel: "Admin",
    description: "Author and publish",
    icon: LayoutDashboard,
  },
};

function StatusMark({ status }: { status: ActivityStatus }) {
  if (status === "complete") {
    return (
      <CheckCircle2
        className="h-4 w-4 text-emerald-700"
        aria-label="Complete"
      />
    );
  }
  if (status === "locked") {
    return (
      <LockKeyhole className="h-4 w-4 text-stone-400" aria-label="Locked" />
    );
  }
  return (
    <span
      className={`h-2.5 w-2.5 rounded-full ${
        status === "current" ? "bg-[#72558f]" : "border border-stone-400"
      }`}
      aria-label={status === "current" ? "Current" : "Available"}
    />
  );
}

function RoleRail({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <aside className="border-b border-[var(--lms-rule)] bg-[var(--lms-panel)] lg:border-r lg:border-b-0">
      <div className="hidden border-b border-[var(--lms-rule)] px-5 py-5 lg:block">
        <p className="font-display text-xl font-semibold tracking-[-0.02em]">
          Mind Point LMS
        </p>
        <p className="mt-1 text-xs text-[var(--lms-muted)]">
          Interactive product preview
        </p>
      </div>
      <nav
        className="grid grid-cols-3 gap-2 p-3 lg:block lg:space-y-1"
        aria-label="Preview role"
      >
        {(Object.keys(roleMeta) as Role[]).map((item) => {
          const meta = roleMeta[item];
          const Icon = meta.icon;
          const active = item === role;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={`lms-focus flex min-w-0 flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-colors lg:w-full lg:flex-row lg:gap-3 lg:px-3 lg:text-left ${
                active
                  ? "bg-white text-[var(--lms-ink)] shadow-[0_8px_24px_rgba(49,37,63,0.08)]"
                  : "text-[var(--lms-muted)] hover:bg-white/65 hover:text-[var(--lms-ink)]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  <span className="lg:hidden">{meta.mobileLabel}</span>
                  <span className="hidden lg:inline">{meta.label}</span>
                </span>
                <span className="mt-0.5 hidden text-xs opacity-75 lg:block">
                  {meta.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
      <div className="hidden border-t border-[var(--lms-rule)] p-5 text-xs leading-5 text-[var(--lms-muted)] lg:block">
        <span className="font-semibold text-[var(--lms-ink)]">
          Synthetic preview
        </span>
        <br />
        No real Student records are shown or changed.
      </div>
    </aside>
  );
}

function StudentWorkspace() {
  const [selectedId, setSelectedId] = useState("reflection");
  const [completed, setCompleted] = useState(
    () => new Set(["foundations", "observation"]),
  );
  const [question, setQuestion] = useState("");
  const [questionSent, setQuestionSent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const selected =
    activities.find((activity) => activity.id === selectedId) ?? activities[2];
  const completedCount = completed.size;
  const progress = Math.round((completedCount / activities.length) * 100);
  const selectedIndex = activities.findIndex(
    (activity) => activity.id === selected.id,
  );

  const toggleComplete = () => {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(selected.id)) next.delete(selected.id);
      else next.add(selected.id);
      return next;
    });
  };

  return (
    <div className="grid min-h-[760px] lg:grid-cols-[250px_minmax(0,1fr)_290px]">
      <aside className="hidden border-b border-[var(--lms-rule)] lg:block lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between border-b border-[var(--lms-rule)] px-5 py-4">
          <div>
            <p className="text-sm font-semibold">Module 1</p>
            <p className="mt-1 text-xs text-[var(--lms-muted)]">
              Listening before responding
            </p>
          </div>
          <PanelLeft className="h-4 w-4 text-[var(--lms-muted)]" />
        </div>
        <nav aria-label="Course activities">
          {activities.map((activity, index) => {
            const active = activity.id === selected.id;
            const status = completed.has(activity.id)
              ? "complete"
              : activity.status;
            return (
              <button
                key={activity.id}
                type="button"
                onClick={() =>
                  activity.status !== "locked" && setSelectedId(activity.id)
                }
                disabled={activity.status === "locked"}
                className={`lms-focus grid w-full grid-cols-[1.5rem_1fr_auto] gap-3 border-b border-[var(--lms-rule)] px-5 py-4 text-left transition-colors ${
                  active ? "bg-[var(--lms-accent-soft)]" : "hover:bg-stone-50"
                } disabled:cursor-not-allowed disabled:opacity-55`}
              >
                <span className="font-mono text-xs text-[var(--lms-muted)]">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm leading-5 font-semibold">
                    {activity.title}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--lms-muted)]">
                    {activity.type} · {activity.duration}
                  </span>
                </span>
                <span className="pt-1">
                  <StatusMark status={status} />
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <article className="min-w-0 px-6 py-8 md:px-10 md:py-10 xl:px-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-7 border-b border-[var(--lms-rule)] pb-6 lg:hidden">
            <label
              htmlFor="mobile-activity"
              className="text-xs font-semibold text-[var(--lms-muted)]"
            >
              Module 1 · Current activity
            </label>
            <select
              id="mobile-activity"
              value={selected.id}
              onChange={(event) => setSelectedId(event.target.value)}
              className="lms-focus mt-2 h-11 w-full rounded-lg border border-[var(--lms-rule)] bg-white px-3 text-sm font-semibold"
            >
              {activities.map((activity, index) => (
                <option
                  key={activity.id}
                  value={activity.id}
                  disabled={activity.status === "locked"}
                >
                  {index + 1}. {activity.title}
                  {activity.status === "locked" ? " · Locked" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--lms-muted)]">
            <span>{selected.type}</span>
            <span aria-hidden="true">·</span>
            <span>{selected.duration}</span>
            <span className="ml-auto rounded-full bg-[var(--lms-accent-soft)] px-3 py-1 font-semibold text-[var(--lms-accent-strong)]">
              Current activity
            </span>
          </div>
          <h1 className="font-display mt-5 max-w-2xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] md:text-5xl">
            {selected.title}
          </h1>
          <p className="mt-6 max-w-[68ch] text-base leading-8 text-[var(--lms-muted)]">
            Read the scenario, identify the moment the listener moved from
            curiosity to advice, and write a response that keeps the
            speaker&apos;s meaning at the centre.
          </p>

          <section
            className="mt-9 border-y border-[var(--lms-rule)] py-7"
            aria-labelledby="scenario-heading"
          >
            <h2 id="scenario-heading" className="text-base font-semibold">
              Practice scenario
            </h2>
            <blockquote className="font-display mt-4 max-w-[66ch] text-2xl leading-9 text-[#40364c]">
              “I know what I should do. I just need someone to stay with the
              uncertainty for a minute.”
            </blockquote>
            <p className="mt-5 max-w-[68ch] text-sm leading-7 text-[var(--lms-muted)]">
              Notice what changes when the response begins with an observation
              rather than a solution. Your submission is private to assigned
              Faculty.
            </p>
          </section>

          <div className="mt-8">
            <label
              htmlFor="student-reflection"
              className="text-sm font-semibold"
            >
              Your reflection
            </label>
            <Textarea
              id="student-reflection"
              className="mt-3 min-h-40 bg-white"
              defaultValue="I would reflect the tension I heard and ask which part feels hardest to hold right now."
              onChange={() => setSubmitted(false)}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--lms-muted)]">
              <span role="status">
                {submitted
                  ? "Submitted to Faculty in this preview"
                  : "Draft saved for this preview"}
              </span>
              <Button size="sm" onClick={() => setSubmitted(true)}>
                <Send /> {submitted ? "Submitted" : "Submit for review"}
              </Button>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--lms-rule)] pt-6">
            <Button
              variant="outline"
              disabled={selectedIndex === 0}
              onClick={() =>
                setSelectedId(activities[selectedIndex - 1]?.id ?? selected.id)
              }
            >
              <ArrowLeft /> Previous
            </Button>
            <Button
              variant={completed.has(selected.id) ? "outline" : "default"}
              onClick={toggleComplete}
            >
              <Check />{" "}
              {completed.has(selected.id) ? "Completed" : "Mark complete"}
            </Button>
            <Button
              variant="outline"
              disabled={selectedIndex === activities.length - 1}
              onClick={() =>
                setSelectedId(activities[selectedIndex + 1]?.id ?? selected.id)
              }
            >
              Next <ArrowRight />
            </Button>
          </div>
        </div>
      </article>

      <aside className="border-t border-[var(--lms-rule)] bg-[#f8f4ef] p-6 lg:border-t-0 lg:border-l">
        <p className="text-sm font-semibold">Course progress</p>
        <div className="mt-4 flex items-end justify-between">
          <span className="font-display text-3xl font-semibold">
            {progress}%
          </span>
          <span className="text-xs text-[var(--lms-muted)]">
            {completedCount} of {activities.length}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[var(--lms-accent)] transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-8 border-y border-[var(--lms-rule)] py-6">
          <div className="flex gap-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 text-[var(--lms-accent)]" />
            <div>
              <p className="text-sm font-semibold">Certificate path</p>
              <p className="mt-1 text-xs leading-5 text-[var(--lms-muted)]">
                Complete all five activities and receive Faculty approval.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <label
            htmlFor="student-question"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <CircleHelp className="h-4 w-4" /> Ask Faculty privately
          </label>
          <Textarea
            id="student-question"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setQuestionSent(false);
            }}
            className="mt-3 min-h-24 bg-white"
            placeholder="What do you need help with?"
          />
          <Button
            className="mt-3 w-full"
            variant="outline"
            disabled={!question.trim()}
            onClick={() => {
              setQuestion("");
              setQuestionSent(true);
            }}
          >
            <MessageSquareText /> Send question
          </Button>
          {questionSent ? (
            <p className="mt-2 text-xs text-emerald-800" role="status">
              Question sent privately in this preview.
            </p>
          ) : null}
        </div>

        <a
          href="#accessibility"
          className="lms-focus mt-7 flex items-center gap-2 rounded-lg text-sm font-semibold text-[var(--lms-accent-strong)] underline decoration-[var(--lms-accent)]/35 underline-offset-4"
        >
          <Accessibility className="h-4 w-4" /> Request an accessible
          alternative
        </a>
      </aside>
    </div>
  );
}

function FacultyWorkspace() {
  const [selectedId, setSelectedId] = useState(queueSeed[0].id);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [resolved, setResolved] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [escalated, setEscalated] = useState<string[]>([]);
  const visibleQueue =
    filter === "mine"
      ? queueSeed.filter((item) => claimed.includes(item.id))
      : queueSeed;
  const selected =
    queueSeed.find((item) => item.id === selectedId) ?? queueSeed[0];

  return (
    <div className="grid min-h-[760px] lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--lms-rule)] px-6 py-6 md:px-9">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-[-0.03em]">
              Review desk
            </h1>
            <p className="mt-2 text-sm text-[var(--lms-muted)]">
              Counselling Skills Certificate · September batch
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === "all" ? "outline" : "ghost"}
              onClick={() => setFilter("all")}
            >
              All work
            </Button>
            <Button
              size="sm"
              variant={filter === "mine" ? "outline" : "ghost"}
              onClick={() => setFilter("mine")}
            >
              Assigned to me
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_auto] border-b border-[var(--lms-rule)] bg-[#f8f4ef] px-6 py-3 text-xs font-semibold text-[var(--lms-muted)] md:grid-cols-[1fr_9rem_6rem] md:px-9">
          <span>Priority queue</span>
          <span className="hidden md:block">Student</span>
          <span>Waiting</span>
        </div>
        <div>
          {visibleQueue.map((item) => {
            const active = item.id === selected.id;
            const isResolved = resolved.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`lms-focus grid w-full grid-cols-[1fr_auto] gap-4 border-b border-[var(--lms-rule)] px-6 py-5 text-left transition-colors md:grid-cols-[1fr_9rem_6rem] md:px-9 ${active ? "bg-[var(--lms-accent-soft)]" : "hover:bg-stone-50"}`}
              >
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {item.kind === "Question" ? (
                      <FileQuestion className="h-4 w-4" />
                    ) : (
                      <PenLine className="h-4 w-4" />
                    )}
                    {item.title}
                  </span>
                  <span className="mt-1.5 block text-xs text-[var(--lms-muted)]">
                    {isResolved
                      ? "Resolved in this preview"
                      : claimed.includes(item.id)
                        ? "Claimed by you"
                        : item.course}
                  </span>
                </span>
                <span className="hidden text-sm md:block">{item.student}</span>
                <span className="font-mono text-xs text-[var(--lms-muted)]">
                  {isResolved ? "Done" : item.age}
                </span>
              </button>
            );
          })}
          {visibleQueue.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-[var(--lms-muted)] md:px-9">
              Claim a review from All work to see it here.
            </p>
          ) : null}
        </div>
      </section>

      <aside className="border-t border-[var(--lms-rule)] bg-[#f8f4ef] p-6 lg:border-t-0 lg:border-l lg:p-8">
        <p className="text-xs font-semibold text-[var(--lms-accent-strong)]">
          {selected.kind}
        </p>
        <h2 className="font-display mt-3 text-2xl leading-tight font-semibold">
          {selected.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--lms-muted)]">
          {selected.student}
        </p>
        <div className="mt-6 border-y border-[var(--lms-rule)] py-6">
          <p className="text-sm leading-7">{selected.detail}</p>
        </div>
        <label
          htmlFor="faculty-response"
          className="mt-6 block text-sm font-semibold"
        >
          Student-visible response
        </label>
        <Textarea
          id="faculty-response"
          className="mt-3 min-h-32 bg-white"
          defaultValue="You kept the response open and grounded in what the speaker said. Before offering a next step, try one more reflection that names the uncertainty."
        />
        <div className="mt-4 grid gap-2">
          {!claimed.includes(selected.id) ? (
            <Button
              onClick={() => setClaimed((items) => [...items, selected.id])}
            >
              <Users /> Claim review
            </Button>
          ) : (
            <Button
              onClick={() => setResolved((items) => [...items, selected.id])}
              disabled={resolved.includes(selected.id)}
            >
              <CheckCircle2 />{" "}
              {resolved.includes(selected.id)
                ? "Review resolved"
                : "Return with feedback"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() =>
              setEscalated((items) =>
                items.includes(selected.id) ? items : [...items, selected.id],
              )
            }
            disabled={escalated.includes(selected.id)}
          >
            <ShieldCheck />
            {escalated.includes(selected.id)
              ? "Concern escalated"
              : "Escalate a concern"}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function AdministratorWorkspace() {
  const [selectedId, setSelectedId] = useState("reflection");
  const [title, setTitle] = useState("Reflection: noticing without fixing");
  const [selectedBlocker, setSelectedBlocker] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("Draft saved just now");
  const [activityAdded, setActivityAdded] = useState(false);
  const blockers = [
    {
      id: "rights",
      label: "Rights record missing",
      activity: "Observation video",
      activityId: "observation",
      guidance: "Attach the media rights owner and permitted usage period.",
    },
    {
      id: "alternative",
      label: "Transcript needs review",
      activity: "Observation video",
      activityId: "observation",
      guidance:
        "Review the transcript against the final media and sign it off.",
    },
    {
      id: "evidence",
      label: "Completion evidence incomplete",
      activity: "Module feedback",
      activityId: "feedback",
      guidance: "Choose the evidence that proves this activity is complete.",
    },
  ];
  const activeBlocker = blockers.find(
    (blocker) => blocker.id === selectedBlocker,
  );

  return (
    <div className="grid min-h-[760px] lg:grid-cols-[250px_minmax(0,1fr)_310px]">
      <aside className="border-b border-[var(--lms-rule)] lg:border-r lg:border-b-0">
        <div className="border-b border-[var(--lms-rule)] px-5 py-4">
          <p className="text-sm font-semibold">Draft Curriculum v2</p>
          <p className="mt-1 text-xs text-[var(--lms-muted)]">
            Not active for Students
          </p>
        </div>
        <div className="px-5 py-4 text-xs font-semibold text-[var(--lms-muted)]">
          Module 1 · 5 activities
        </div>
        {activities.map((activity, index) => (
          <button
            key={activity.id}
            type="button"
            onClick={() => {
              setSelectedId(activity.id);
              setTitle(activity.title);
              setSelectedBlocker(null);
            }}
            className={`lms-focus grid w-full grid-cols-[1.5rem_1fr] gap-3 border-t border-[var(--lms-rule)] px-5 py-4 text-left ${selectedId === activity.id ? "bg-[var(--lms-accent-soft)]" : "hover:bg-stone-50"}`}
          >
            <span className="font-mono text-xs text-[var(--lms-muted)]">
              {index + 1}
            </span>
            <span>
              <span className="block text-sm leading-5 font-semibold">
                {activity.title}
              </span>
              <span className="mt-1 block text-xs text-[var(--lms-muted)]">
                {activity.type}
              </span>
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setActivityAdded(true);
            setSaveMessage("New activity draft added in this preview");
          }}
          className="lms-focus flex w-full items-center gap-2 border-t border-dashed border-[var(--lms-rule)] px-5 py-4 text-sm font-semibold text-[var(--lms-accent-strong)]"
        >
          <BookOpen className="h-4 w-4" />
          {activityAdded ? "Activity draft added" : "Add activity"}
        </button>
      </aside>

      <section className="min-w-0 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-[-0.03em]">
                Activity settings
              </h1>
            </div>
            <span className="text-xs text-[var(--lms-muted)]" role="status">
              {saveMessage}
            </span>
          </div>
          <div className="mt-8 grid gap-6">
            <div>
              <label htmlFor="activity-title" className="text-sm font-semibold">
                Activity title
              </label>
              <Input
                id="activity-title"
                className="mt-2 bg-white"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setSaveMessage("Unsaved changes");
                }}
              />
            </div>
            <div>
              <label htmlFor="instructions" className="text-sm font-semibold">
                Student instructions
              </label>
              <Textarea
                id="instructions"
                className="mt-2 min-h-36 bg-white"
                defaultValue="Read the scenario and submit a short reflection. Name what you noticed, the response you would try, and one question you still have."
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="release-rule" className="text-sm font-semibold">
                  Release rule
                </label>
                <select
                  id="release-rule"
                  className="lms-focus border-input mt-2 h-10 w-full rounded-md border bg-white px-3 text-sm"
                >
                  <option>After previous activity</option>
                  <option>Immediately</option>
                  <option>On a date</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="completion-rule"
                  className="text-sm font-semibold"
                >
                  Completion evidence
                </label>
                <select
                  id="completion-rule"
                  className="lms-focus border-input mt-2 h-10 w-full rounded-md border bg-white px-3 text-sm"
                >
                  <option>Faculty-reviewed submission</option>
                  <option>Student confirmation</option>
                  <option>Passing score</option>
                </select>
              </div>
            </div>
            <div className="border-y border-[var(--lms-rule)] py-6">
              <div className="flex items-start gap-3">
                <Accessibility className="mt-0.5 h-5 w-5 text-[var(--lms-accent)]" />
                <div>
                  <p className="text-sm font-semibold">Accessible by design</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--lms-muted)]">
                    Instructions, labels, keyboard order, error recovery, and
                    equivalent routes are checked before publication.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setSaveMessage("Activity saved in this preview")}
              >
                <Check /> Save activity
              </Button>
            </div>
          </div>
        </div>
      </section>

      <aside className="border-t border-[var(--lms-rule)] bg-[#f8f4ef] p-6 lg:border-t-0 lg:border-l">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Publication readiness</p>
          <span className="font-mono text-xs text-[var(--lms-muted)]">
            {blockers.length} blockers
          </span>
        </div>
        <div className="mt-5 divide-y divide-[var(--lms-rule)] border-y border-[var(--lms-rule)]">
          {blockers.map((blocker) => {
            const active = blocker.id === selectedBlocker;
            return (
              <button
                key={blocker.id}
                type="button"
                onClick={() => {
                  const activity = activities.find(
                    (item) => item.id === blocker.activityId,
                  );
                  setSelectedBlocker(blocker.id);
                  setSelectedId(blocker.activityId);
                  if (activity) setTitle(activity.title);
                }}
                className={`lms-focus flex w-full items-start gap-3 py-4 text-left ${active ? "text-[var(--lms-accent-strong)]" : ""}`}
              >
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-amber-600 text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {blocker.label}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--lms-muted)]">
                    {blocker.activity}
                  </span>
                </span>
                <ChevronRight className="mt-1 ml-auto h-4 w-4 text-[var(--lms-muted)]" />
              </button>
            );
          })}
        </div>
        <p
          className="mt-5 text-xs leading-5 text-[var(--lms-muted)]"
          role="status"
        >
          {activeBlocker
            ? `${activeBlocker.activity}: ${activeBlocker.guidance}`
            : "Select a blocker to open its exact activity and required evidence."}
        </p>
        <Button className="mt-6 w-full" disabled>
          <Play /> Review publish manifest
        </Button>
      </aside>
    </div>
  );
}

export function LmsPreview({
  initialRole = "student",
}: {
  initialRole?: Role;
}) {
  const [role, setRole] = useState<Role>(initialRole);
  const roleLabel = useMemo(() => roleMeta[role].label, [role]);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-[#352b40] px-4 py-3 text-xs text-[#f7f0fa] shadow-[0_10px_30px_rgba(39,27,49,0.15)]">
        <span className="font-semibold">Synthetic preview</span>
        <span className="text-[#d8cce1]">
          Explore the same Course as each Role. Nothing here changes production
          data.
        </span>
        <span className="ml-auto flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4" /> {roleLabel} scope
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--lms-rule)] bg-white">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--lms-rule)] px-5 py-4 md:px-7">
          <div>
            <p className="font-display text-lg font-semibold">
              Counselling Skills Certificate
            </p>
            <p className="mt-1 text-xs text-[var(--lms-muted)]">
              Published Curriculum v1 · September batch
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold">Aarav Singh</p>
              <p className="mt-0.5 text-xs text-[var(--lms-muted)]">
                {roleLabel}
              </p>
            </div>
            <div className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lms-accent-soft)] font-semibold text-[var(--lms-accent-strong)]">
              AS
            </div>
          </div>
        </header>
        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <RoleRail role={role} onChange={setRole} />
          <div key={role} className="lms-role-surface min-w-0">
            {role === "student" ? (
              <StudentWorkspace />
            ) : role === "faculty" ? (
              <FacultyWorkspace />
            ) : (
              <AdministratorWorkspace />
            )}
          </div>
        </div>
      </div>
      <div
        id="accessibility"
        className="mt-4 flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-[var(--lms-muted)]"
      >
        <span>Preview data is illustrative and clearly labeled.</span>
        <span className="flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5" /> Responsive · keyboard-aware ·
          reduced-motion safe
        </span>
      </div>
    </div>
  );
}
