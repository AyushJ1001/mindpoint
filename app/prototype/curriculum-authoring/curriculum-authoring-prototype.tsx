"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Copy,
  Eye,
  FileCheck2,
  GripVertical,
  Link2,
  ListChecks,
  LockKeyhole,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Variant = "A" | "B" | "C";
type Role = "Administrator" | "Faculty";
type Activity = {
  id: string;
  title: string;
  type: "Reading" | "Media" | "Quiz" | "Assignment" | "Feedback";
  required: boolean;
  status: "ready" | "warning" | "draft";
  duration: string;
};

const initialActivities: Activity[] = [
  {
    id: "read",
    title: "What makes a helping conversation safe?",
    type: "Reading",
    required: true,
    status: "warning",
    duration: "12 min",
  },
  {
    id: "watch",
    title: "Listening without fixing",
    type: "Media",
    required: true,
    status: "ready",
    duration: "18 min",
  },
  {
    id: "quiz",
    title: "Knowledge check",
    type: "Quiz",
    required: true,
    status: "ready",
    duration: "10 pts",
  },
  {
    id: "reflect",
    title: "Observation journal",
    type: "Assignment",
    required: true,
    status: "draft",
    duration: "Manual review",
  },
  {
    id: "feedback",
    title: "Module pulse",
    type: "Feedback",
    required: false,
    status: "ready",
    duration: "Private",
  },
];

const typeIcons = {
  Reading: BookOpen,
  Media: Play,
  Quiz: ListChecks,
  Assignment: ClipboardCheck,
  Feedback: MessageSquareText,
};

const variantNames: Record<Variant, string> = {
  A: "Release desk",
  B: "Outline desk",
  C: "Journey canvas",
};

const blockers = [
  {
    id: "rights",
    title: "Rights evidence needs review",
    detail: "Required reading · hosted PDF",
    owner: "Administrator",
    severity: "Blocks publish",
  },
  {
    id: "alternative",
    title: "Accessible alternative is missing",
    detail: "Required reading · PDF",
    owner: "Faculty",
    severity: "Blocks publish",
  },
  {
    id: "criteria",
    title: "Grading criteria are incomplete",
    detail: "Observation journal",
    owner: "Faculty",
    severity: "Needs attention",
  },
];

function StatusDot({ status }: { status: Activity["status"] }) {
  const styles =
    status === "ready"
      ? "bg-emerald-500"
      : status === "warning"
        ? "bg-[#b65332]"
        : "bg-amber-500";
  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${styles}`}
      aria-label={status}
    />
  );
}

function ActivityIcon({
  type,
  className = "h-4 w-4",
}: {
  type: Activity["type"];
  className?: string;
}) {
  const Icon = typeIcons[type];
  return <Icon className={className} aria-hidden="true" />;
}

function TopBar({
  role,
  setRole,
  preview,
  setPreview,
}: {
  role: Role;
  setRole: (role: Role) => void;
  preview: boolean;
  setPreview: (value: boolean) => void;
}) {
  return (
    <header className="border-b border-[#ded8e5] bg-[#fbf9fc] px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="grid h-9 w-9 place-items-center rounded-xl border border-[#ded8e5] bg-white text-[#4f4658] md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#6f5b83] text-sm font-bold text-white">
            MP
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#2b2530]">
              Certificate in Counselling Skills
            </p>
            <p className="truncate text-xs text-[#746b7d]">
              Curriculum v3 · Draft
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="hidden items-center rounded-xl border border-[#ded8e5] bg-white p-1 sm:flex"
            aria-label="Preview role"
          >
            {(["Faculty", "Administrator"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setRole(option)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f5b83] ${role === option ? "bg-[#eee9f2] text-[#4d3c5b]" : "text-[#746b7d] hover:text-[#2b2530]"}`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPreview(!preview)}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#cfc6d8] bg-white px-3 text-xs font-semibold text-[#4d3c5b] hover:bg-[#f2edf5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f5b83]"
          >
            <Eye className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">
              {preview ? "Exit preview" : "Student preview"}
            </span>
          </button>
          <button
            disabled={role !== "Administrator"}
            className="hidden h-9 items-center gap-2 rounded-xl bg-[#5e4a70] px-4 text-xs font-semibold text-white hover:bg-[#4d3c5b] disabled:cursor-not-allowed disabled:bg-[#d2cad8] sm:inline-flex"
          >
            <LockKeyhole className="h-4 w-4" /> Publish
          </button>
        </div>
      </div>
    </header>
  );
}

function SideRail() {
  const items = [
    [BookOpen, "Curriculum", true],
    [Users, "People", false],
    [MessageSquareText, "Q&A", false],
    [ClipboardCheck, "Reviews", false],
    [FileCheck2, "Resources", false],
    [Settings2, "Settings", false],
  ] as const;
  return (
    <aside className="hidden w-[76px] shrink-0 border-r border-[#ded8e5] bg-[#f1edf4] px-2 py-5 lg:block">
      <nav aria-label="Course workspace" className="space-y-2">
        {items.map(([Icon, label, active]) => (
          <button
            key={label}
            className={`flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[10px] font-semibold ${active ? "bg-white text-[#5e4a70] shadow-[0_5px_15px_rgba(71,55,82,0.08)]" : "text-[#776d7e] hover:bg-white/70"}`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function ReadyMeter({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "min-w-[180px]" : "w-full"}>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-xs font-semibold text-[#4f4658]">
          Publication readiness
        </span>
        <span className="text-sm font-bold text-[#2b2530] tabular-nums">
          74%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[#e5dee9]"
        aria-label="Publication readiness 74 percent"
      >
        <div className="h-full w-[74%] rounded-full bg-[#6f5b83]" />
      </div>
    </div>
  );
}

function CurriculumTree({
  activities,
  selected,
  onSelect,
  onMove,
}: {
  activities: Activity[];
  selected: string;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="text-sm font-bold text-[#332b39]">Curriculum outline</h2>
        <button
          className="rounded-lg p-1.5 text-[#665b6e] hover:bg-[#eee9f2]"
          aria-label="Curriculum options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-2 flex items-center gap-2 rounded-xl bg-[#eee9f2] px-3 py-2 text-xs font-semibold text-[#4d3c5b]">
        <ChevronDown className="h-4 w-4" />
        <span className="flex-1 truncate">Module 1 · Foundations</span>
        <span className="text-[10px] font-medium text-[#746b7d]">
          4 required
        </span>
      </div>
      <div className="space-y-1">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`group flex items-center rounded-xl border ${selected === activity.id ? "border-[#a896b5] bg-[#f4f0f6]" : "border-transparent hover:bg-[#f8f6f9]"}`}
          >
            <GripVertical className="ml-1 h-4 w-4 shrink-0 text-[#b1a8b6]" />
            <button
              onClick={() => onSelect(activity.id)}
              className="flex min-w-0 flex-1 items-center gap-2 px-1 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#6f5b83]"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-[#64546f]">
                <ActivityIcon type={activity.type} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-[#3d3443]">
                  {activity.title}
                </span>
                <span className="block truncate text-[10px] text-[#827789]">
                  {activity.type} ·{" "}
                  {activity.required ? "Required" : "Optional"}
                </span>
              </span>
              <StatusDot status={activity.status} />
            </button>
            <div className="mr-1 hidden items-center group-focus-within:flex group-hover:flex">
              <button
                disabled={index === 0}
                onClick={() => onMove(activity.id, -1)}
                className="rounded p-1 text-[#746b7d] hover:bg-white disabled:opacity-30"
                aria-label={`Move ${activity.title} up`}
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                disabled={index === activities.length - 1}
                onClick={() => onMove(activity.id, 1)}
                className="rounded p-1 text-[#746b7d] hover:bg-white disabled:opacity-30"
                aria-label={`Move ${activity.title} down`}
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#bdb2c5] py-2.5 text-xs font-semibold text-[#675872] hover:bg-[#f4f0f6]">
        <Plus className="h-4 w-4" /> Add activity
      </button>
      <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-[#746b7d] hover:bg-[#f4f0f6]">
        <Plus className="h-4 w-4" /> Add module
      </button>
    </div>
  );
}

function Editor({
  activity,
  blockerId,
  onSave,
}: {
  activity: Activity;
  blockerId: string | null;
  onSave: () => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (blockerId === "alternative") titleRef.current?.focus();
  }, [blockerId]);
  return (
    <section
      className="min-w-0 bg-white"
      aria-label={`${activity.type} editor`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e0e9] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eee9f2] text-[#5e4a70]">
            <ActivityIcon type={activity.type} className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-[#302837]">
              {activity.type} editor
            </h2>
            <p className="text-xs text-[#7a7081]">
              Changes autosave to Curriculum v3
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#ded8e5] px-3 text-xs font-semibold text-[#63576b] hover:bg-[#f4f0f6]">
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </button>
          <button
            onClick={onSave}
            className="inline-flex h-8 items-center gap-2 rounded-lg bg-[#5e4a70] px-3 text-xs font-semibold text-white hover:bg-[#4c3b5b]"
          >
            <Save className="h-3.5 w-3.5" /> Save draft
          </button>
        </div>
      </div>
      <div className="space-y-6 p-5">
        <div>
          <label
            htmlFor="activity-title"
            className="mb-2 block text-xs font-bold text-[#4a404f]"
          >
            Activity title
          </label>
          <input
            ref={titleRef}
            id="activity-title"
            defaultValue={activity.title}
            className={`w-full rounded-xl border bg-[#fbf9fc] px-3 py-2.5 text-sm text-[#2f2834] outline-none focus:border-[#7b6788] focus:ring-2 focus:ring-[#d9cfdf] ${blockerId === "alternative" ? "border-[#b65332]" : "border-[#dcd5e1]"}`}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="reading-content"
              className="text-xs font-bold text-[#4a404f]"
            >
              Reading content
            </label>
            <span className="text-[10px] text-[#8a7f90]">Semantic HTML</span>
          </div>
          <textarea
            id="reading-content"
            defaultValue="A helping conversation begins with clear boundaries, consent, and attentive listening. Review the scenario and note where the listener makes safety explicit."
            rows={5}
            className="w-full resize-none rounded-xl border border-[#dcd5e1] bg-[#fbf9fc] px-3 py-3 text-sm leading-6 text-[#403747] outline-none focus:border-[#7b6788] focus:ring-2 focus:ring-[#d9cfdf]"
          />
        </div>
        <fieldset>
          <legend className="mb-2 text-xs font-bold text-[#4a404f]">
            Completion evidence
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#a896b5] bg-[#f5f1f7] p-3">
              <input
                type="radio"
                name="completion"
                defaultChecked
                className="mt-0.5 accent-[#6f5b83]"
              />
              <span>
                <span className="block text-xs font-semibold text-[#403447]">
                  Reach the end
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-[#746b7d]">
                  Record once the Student reaches the final section.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#ded8e5] p-3">
              <input
                type="radio"
                name="completion"
                className="mt-0.5 accent-[#6f5b83]"
              />
              <span>
                <span className="block text-xs font-semibold text-[#403447]">
                  Student confirms
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-[#746b7d]">
                  Require an explicit completion action.
                </span>
              </span>
            </label>
          </div>
        </fieldset>
        <div className="grid gap-4 xl:grid-cols-2">
          <div>
            <label
              htmlFor="release-rule"
              className="mb-2 block text-xs font-bold text-[#4a404f]"
            >
              Release rule
            </label>
            <select
              id="release-rule"
              className="w-full rounded-xl border border-[#dcd5e1] bg-white px-3 py-2.5 text-sm"
            >
              <option>After previous required activity</option>
              <option>On enrollment</option>
              <option>On a scheduled date</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="accessibility-status"
              className="mb-2 block text-xs font-bold text-[#4a404f]"
            >
              Accessibility status
            </label>
            <select
              id="accessibility-status"
              className="w-full rounded-xl border border-[#b65332] bg-[#fff9f6] px-3 py-2.5 text-sm"
            >
              <option>Alternative required</option>
              <option>Reviewed</option>
              <option>Not reviewed</option>
            </select>
          </div>
        </div>
        <div className="border-t border-[#e6e0e9] pt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#4a404f]">
                Supporting resource
              </h3>
              <p className="mt-1 text-[11px] text-[#7a7081]">
                Hosted PDF · Counselling foundations reader.pdf
              </p>
            </div>
            <button className="text-xs font-semibold text-[#665174] underline decoration-[#aa9ab4] underline-offset-4">
              Open Rights record
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <StateCell
              icon={ShieldCheck}
              label="Rights"
              value="In review"
              warning
            />
            <StateCell
              icon={FileCheck2}
              label="Accessibility"
              value="Alternative missing"
              warning
            />
            <StateCell icon={Link2} label="Delivery" value="Hosted copy" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StateCell({
  icon: Icon,
  label,
  value,
  warning = false,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${warning ? "bg-[#fbebe5] text-[#883d27]" : "bg-[#f2eff4] text-[#574c5e]"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>
        <span className="block text-[10px] font-medium opacity-75">
          {label}
        </span>
        <span className="block text-xs font-bold">{value}</span>
      </span>
    </div>
  );
}

function ReadinessPanel({
  active,
  onSelect,
  role,
}: {
  active: string | null;
  onSelect: (id: string) => void;
  role: Role;
}) {
  return (
    <aside className="min-w-0 bg-[#fbf9fc] p-4">
      <ReadyMeter />
      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#332b39]">
          3 issues to resolve
        </h2>
        <button className="text-[11px] font-semibold text-[#655471] underline underline-offset-4">
          View all 7 checks
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {blockers.map((blocker) => (
          <button
            key={blocker.id}
            onClick={() => onSelect(blocker.id)}
            className={`w-full rounded-xl border p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f5b83] ${active === blocker.id ? "border-[#a64e32] bg-[#fff7f3]" : "border-[#e0d9e4] bg-white hover:border-[#b9acbf]"}`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#a64e32]" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#3b313f]">
                  {blocker.title}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-[#7a7081]">
                  {blocker.detail}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-[#6b5d72]">
                    {blocker.owner}
                  </span>
                  <span className="rounded-full bg-[#f5ddd5] px-2 py-1 text-[9px] font-bold text-[#873a24]">
                    {blocker.severity}
                  </span>
                </div>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 text-[#958a9b]" />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-5 border-t border-[#e1dae5] pt-4">
        <h3 className="text-xs font-bold text-[#4a404f]">Publish handoff</h3>
        <p className="mt-1 text-[11px] leading-5 text-[#766c7d]">
          Faculty can request review after blockers clear. Only an Administrator
          can publish the immutable manifest.
        </p>
        <button
          disabled
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d8d1dc] py-2.5 text-xs font-bold text-[#817687]"
        >
          <LockKeyhole className="h-4 w-4" />{" "}
          {role === "Administrator"
            ? "Resolve blockers to publish"
            : "Resolve blockers to request review"}
        </button>
        <p className="mt-2 text-center text-[10px] text-[#8a7f90]">
          Publishing will not activate Enrollments.
        </p>
      </div>
    </aside>
  );
}

function ReleaseDesk(props: WorkspaceProps) {
  return (
    <main className="mx-auto max-w-[1560px] p-3 md:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-[-0.02em] text-[#2b2530] md:text-2xl">
              Prepare Curriculum v3 for publication
            </h1>
            <span className="rounded-full bg-[#eee9f2] px-2.5 py-1 text-[10px] font-bold text-[#5e4a70]">
              Draft
            </span>
          </div>
          <p className="mt-1 text-xs text-[#766c7d]">
            Last saved just now by you · Source mapped from legacy course
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#d6cedb] bg-white px-3 text-xs font-semibold text-[#5b4e64]">
            <Clock3 className="h-4 w-4" /> Version history
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#d6cedb] bg-white px-3 text-xs font-semibold text-[#5b4e64]">
            <Eye className="h-4 w-4" /> Preview manifest
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#dcd5e1] bg-white shadow-[0_16px_40px_rgba(54,42,63,0.08)]">
        <div className="grid min-h-[700px] grid-cols-1 xl:grid-cols-[280px_minmax(480px,1fr)_320px]">
          <div className="border-b border-[#e4dee7] p-4 xl:border-r xl:border-b-0">
            <CurriculumTree {...props} />
          </div>
          <Editor
            activity={props.activity}
            blockerId={props.blockerId}
            onSave={props.onSave}
          />
          <div className="border-t border-[#e4dee7] xl:border-t-0 xl:border-l">
            <ReadinessPanel
              active={props.blockerId}
              onSelect={props.onBlocker}
              role={props.role}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

type WorkspaceProps = {
  activities: Activity[];
  selected: string;
  activity: Activity;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  blockerId: string | null;
  onBlocker: (id: string) => void;
  onSave: () => void;
  role: Role;
};

function OutlineDesk(props: WorkspaceProps) {
  return (
    <main className="mx-auto max-w-[1560px] p-3 md:p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#2b2530]">
            Curriculum v3
          </h1>
          <p className="mt-1 text-xs text-[#766c7d]">
            Build the learning sequence, then send it for publication review.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ReadyMeter compact />
          <button className="rounded-xl bg-[#5e4a70] px-4 py-2.5 text-xs font-bold text-white">
            Request review
          </button>
        </div>
      </div>
      <div className="grid min-h-[700px] overflow-hidden rounded-2xl border border-[#dcd5e1] bg-white shadow-[0_16px_40px_rgba(54,42,63,0.08)] lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="border-b border-[#e4dee7] bg-[#fbf9fc] p-5 lg:border-r lg:border-b-0">
          <div className="mb-5 grid grid-cols-2 gap-2">
            <button className="rounded-xl bg-[#5e4a70] px-3 py-2 text-xs font-bold text-white">
              <Plus className="mr-1 inline h-3.5 w-3.5" /> Activity
            </button>
            <button className="rounded-xl border border-[#d8d0dd] bg-white px-3 py-2 text-xs font-bold text-[#5b4e64]">
              <Plus className="mr-1 inline h-3.5 w-3.5" /> Module
            </button>
          </div>
          <CurriculumTree {...props} />
          <div className="mt-6 rounded-xl bg-[#f3e7e2] p-3">
            <p className="text-xs font-bold text-[#743d2d]">
              3 publication issues
            </p>
            <button
              onClick={() => props.onBlocker("rights")}
              className="mt-2 text-[11px] font-semibold text-[#743d2d] underline underline-offset-4"
            >
              Review blockers
            </button>
          </div>
        </aside>
        <Editor
          activity={props.activity}
          blockerId={props.blockerId}
          onSave={props.onSave}
        />
      </div>
    </main>
  );
}

function JourneyCanvas(props: WorkspaceProps) {
  return (
    <main className="mx-auto max-w-[1560px] p-3 md:p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#2b2530]">
            Shape the Student journey
          </h1>
          <p className="mt-1 text-xs text-[#766c7d]">
            Curriculum v3 · Draft · 5 activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#fbebe5] px-3 py-1.5 text-[10px] font-bold text-[#8b3f28]">
            3 blockers
          </span>
          <button className="rounded-xl border border-[#d6cedb] bg-white px-4 py-2 text-xs font-bold text-[#5b4e64]">
            Review readiness
          </button>
        </div>
      </div>
      <section className="overflow-hidden rounded-2xl border border-[#dcd5e1] bg-white shadow-[0_16px_40px_rgba(54,42,63,0.08)]">
        <div className="border-b border-[#e4dee7] bg-[#f7f4f8] px-5 py-4">
          <div className="flex min-w-max items-center gap-3 overflow-x-auto pb-2">
            <div className="shrink-0 rounded-xl bg-[#5e4a70] px-4 py-3 text-white">
              <p className="text-[10px] font-semibold opacity-80">MODULE 1</p>
              <p className="text-xs font-bold">Foundations</p>
            </div>
            {props.activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex shrink-0 items-center gap-3"
              >
                <ArrowRight className="h-4 w-4 text-[#b0a6b5]" />
                <button
                  onClick={() => props.onSelect(activity.id)}
                  className={`w-44 rounded-xl border p-3 text-left ${props.selected === activity.id ? "border-[#7d6a89] bg-white shadow-[0_6px_18px_rgba(67,51,77,0.1)]" : "border-[#ded8e5] bg-[#fbf9fc]"}`}
                >
                  <div className="flex items-center justify-between">
                    <ActivityIcon type={activity.type} />
                    <span className="text-[10px] text-[#8b8190]">
                      {index + 1}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-xs font-bold text-[#3b3240]">
                    {activity.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusDot status={activity.status} />
                    <span className="text-[10px] text-[#7a7081]">
                      {activity.required ? "Required" : "Optional"}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
          <Editor
            activity={props.activity}
            blockerId={props.blockerId}
            onSave={props.onSave}
          />
          <ReadinessPanel
            active={props.blockerId}
            onSelect={props.onBlocker}
            role={props.role}
          />
        </div>
      </section>
    </main>
  );
}

function StudentPreview({ onClose }: { onClose: () => void }) {
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2530]">Student preview</h1>
          <p className="mt-1 text-xs text-[#766c7d]">
            Previewing a new Enrollment in Curriculum v3
          </p>
        </div>
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-xl border border-[#d6cedb] bg-white"
          aria-label="Exit Student preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="rounded-2xl border border-[#dcd5e1] bg-white p-5 shadow-[0_16px_40px_rgba(54,42,63,0.08)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#665a6e]">
          <BookOpen className="h-4 w-4" /> Module 1 of 4
        </div>
        <h2 className="mt-4 text-xl font-bold text-[#302837]">
          What makes a helping conversation safe?
        </h2>
        <p className="mt-3 max-w-[70ch] text-sm leading-7 text-[#5f5566]">
          A helping conversation begins with clear boundaries, consent, and
          attentive listening. Review the scenario and note where the listener
          makes safety explicit.
        </p>
        <div className="mt-6 rounded-xl bg-[#f6ece8] p-4 text-sm text-[#793f2f]">
          <AlertTriangle className="mr-2 inline h-4 w-4" /> This preview uses
          the accessible HTML alternative because the source PDF is not ready.
        </div>
        <button className="mt-8 rounded-xl bg-[#5e4a70] px-4 py-2.5 text-sm font-bold text-white">
          Mark reading complete
        </button>
      </div>
    </div>
  );
}

function PrototypeSwitcher({
  variant,
  onChange,
}: {
  variant: Variant;
  onChange: (variant: Variant) => void;
}) {
  if (process.env.NODE_ENV === "production") return null;
  const order: Variant[] = ["A", "B", "C"];
  const move = (step: number) =>
    onChange(
      order[(order.indexOf(variant) + step + order.length) % order.length],
    );
  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#251f2a] p-1.5 text-white shadow-[0_10px_30px_rgba(28,21,32,0.3)]">
      <button
        onClick={() => move(-1)}
        className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Previous prototype"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[148px] text-center text-xs font-bold">
        {variant} · {variantNames[variant]}
      </span>
      <button
        onClick={() => move(1)}
        className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Next prototype"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CurriculumAuthoringPrototype() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawVariant = searchParams.get("variant");
  const variant: Variant =
    rawVariant === "B" || rawVariant === "C" ? rawVariant : "A";
  const [role, setRole] = useState<Role>("Administrator");
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState("read");
  const [activities, setActivities] = useState(initialActivities);
  const [blockerId, setBlockerId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const activity = useMemo(
    () => activities.find((item) => item.id === selected) ?? activities[0],
    [activities, selected],
  );
  const changeVariant = (next: Variant) =>
    router.replace(`/prototype/curriculum-authoring?variant=${next}`);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']"))
        return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const order: Variant[] = ["A", "B", "C"];
      const step = event.key === "ArrowRight" ? 1 : -1;
      changeVariant(
        order[(order.indexOf(variant) + step + order.length) % order.length],
      );
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  });
  const moveActivity = (id: string, direction: -1 | 1) =>
    setActivities((current) => {
      const from = current.findIndex((item) => item.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  const onSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };
  const workspaceProps = {
    activities,
    selected,
    activity,
    onSelect: setSelected,
    onMove: moveActivity,
    blockerId,
    onBlocker: (id: string) => {
      setBlockerId(id);
      if (id === "criteria") setSelected("reflect");
      else setSelected("read");
    },
    onSave,
    role,
  };
  return (
    <div className="min-h-screen bg-[#f6f3f8] text-[#2b2530] selection:bg-[#cfc2d8] selection:text-[#2d2433]">
      <TopBar
        role={role}
        setRole={setRole}
        preview={preview}
        setPreview={setPreview}
      />
      <div className="flex">
        <SideRail />
        <div className="min-w-0 flex-1">
          {preview ? (
            <StudentPreview onClose={() => setPreview(false)} />
          ) : variant === "A" ? (
            <ReleaseDesk {...workspaceProps} />
          ) : variant === "B" ? (
            <OutlineDesk {...workspaceProps} />
          ) : (
            <JourneyCanvas {...workspaceProps} />
          )}
        </div>
      </div>
      {saved && (
        <div
          role="status"
          className="fixed top-20 right-4 z-40 flex items-center gap-2 rounded-xl bg-[#244f3c] px-4 py-3 text-xs font-bold text-white shadow-[0_10px_25px_rgba(30,60,45,0.2)]"
        >
          <Check className="h-4 w-4" /> Draft saved
        </div>
      )}
      {!preview && (
        <PrototypeSwitcher variant={variant} onChange={changeVariant} />
      )}
      <div className="sr-only" aria-live="polite">
        Prototype {variant}: {variantNames[variant]}
      </div>
    </div>
  );
}
