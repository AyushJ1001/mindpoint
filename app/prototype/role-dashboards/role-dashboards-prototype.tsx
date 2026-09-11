"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileWarning,
  GraduationCap,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const variantNames = {
  A: "Role desk",
  B: "Daily agenda",
  C: "Domain lanes",
} as const;

const roleNames = {
  student: "Student",
  faculty: "Faculty",
  administrator: "Administrator",
} as const;

type VariantKey = keyof typeof variantNames;
type RoleKey = keyof typeof roleNames;

type WorkItem = {
  label: string;
  detail: string;
  state: string;
  urgent?: boolean;
};

const roleData: Record<
  RoleKey,
  {
    heading: string;
    summary: string;
    primaryAction: string;
    primaryDetail: string;
    progress: string;
    items: WorkItem[];
    watch: WorkItem[];
  }
> = {
  student: {
    heading: "Continue your learning",
    summary:
      "Two Courses are active. One answer arrived since your last visit.",
    primaryAction: "Resume reflective listening",
    primaryDetail: "Applied counselling skills · Reading · 18 minutes left",
    progress: "12 of 18 required activities complete",
    items: [
      {
        label: "Assignment due tomorrow",
        detail: "Listening reflection · 6:00 PM IST",
        state: "Draft saved",
        urgent: true,
      },
      {
        label: "Faculty answered your question",
        detail: "The pause before a response",
        state: "Unread",
      },
      {
        label: "Foundations of counselling",
        detail: "Next: Ethics in practice",
        state: "64% complete",
      },
    ],
    watch: [
      {
        label: "Certificate readiness",
        detail: "6 requirements remain",
        state: "Not ready",
      },
      {
        label: "Access period",
        detail: "Ends 30 November 2026",
        state: "Active",
      },
    ],
  },
  faculty: {
    heading: "Review what needs action",
    summary: "Eight items across three active Faculty assignments.",
    primaryAction: "Answer overdue private question",
    primaryDetail: "Nisha Rao · Applied counselling skills · overdue by 24 min",
    progress: "3 questions · 3 grading items · 1 completion · 1 resource issue",
    items: [
      {
        label: "Practice video unavailable",
        detail: "14 affected Students",
        state: "Needs routing",
        urgent: true,
      },
      {
        label: "Listening reflection",
        detail: "Arjun Mehta · Submission 2",
        state: "Unclaimed",
      },
      {
        label: "Completion checklist",
        detail: "Meera Shah",
        state: "Awaiting review",
      },
    ],
    watch: [
      {
        label: "Support target",
        detail: "One question breached",
        state: "Action needed",
      },
      {
        label: "Claims",
        detail: "Two records claimed by you",
        state: "In progress",
      },
    ],
  },
  administrator: {
    heading: "Keep learning operations safe",
    summary: "Five items need an Administrator decision or assignment.",
    primaryAction: "Review blocked publication",
    primaryDetail: "Applied counselling skills v3 · two resource checks failed",
    progress:
      "18 active Courses · 427 active Enrollments · 9 Faculty assignments",
    items: [
      {
        label: "Rights review expires today",
        detail: "Practice dialogue recording",
        state: "Restrict or renew",
        urgent: true,
      },
      {
        label: "Guest Enrollment conflict",
        detail: "Verified email matches two people",
        state: "Needs review",
      },
      {
        label: "Stalled grading claim",
        detail: "No action for 3 business days",
        state: "Reassign",
      },
    ],
    watch: [
      {
        label: "Certificate issuance",
        detail: "11 active · 1 suspended",
        state: "Healthy",
      },
      {
        label: "Accessibility blockers",
        detail: "One required activity unavailable",
        state: "Action needed",
      },
    ],
  },
};

const roleIcons = {
  student: GraduationCap,
  faculty: ClipboardCheck,
  administrator: ShieldCheck,
};

function RoleTabs({
  role,
  setRole,
}: {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
}) {
  return (
    <div
      className="bg-lavender-100 flex gap-1 rounded-xl p-1"
      aria-label="Preview role"
    >
      {(Object.keys(roleNames) as RoleKey[]).map((key) => {
        const Icon = roleIcons[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => setRole(key)}
            className={`focus-visible:outline-primary flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${role === key ? "text-lavender-900 bg-white shadow-sm" : "text-lavender-700 hover:bg-white/60"}`}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{roleNames[key]}</span>
          </button>
        );
      })}
    </div>
  );
}

function TopBar({
  role,
  setRole,
}: {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
}) {
  return (
    <header className="bg-background flex min-h-16 items-center gap-4 border-b px-4 md:px-7">
      <div className="flex items-center gap-3">
        <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl">
          <GraduationCap className="size-4" />
        </span>
        <div>
          <p className="font-display text-base leading-none font-semibold">
            Mind Point
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Thursday, 11 September · Asia/Kolkata
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <RoleTabs role={role} setRole={setRole} />
        <button
          type="button"
          aria-label="Notifications, 3 unread"
          className="hover:bg-muted focus-visible:outline-primary relative grid size-10 place-items-center rounded-xl border focus-visible:outline-2"
        >
          <Bell className="size-4" />
          <span className="bg-terracotta absolute top-2 right-2 size-1.5 rounded-full" />
        </button>
      </div>
    </header>
  );
}

function WorkRow({ item }: { item: WorkItem }) {
  return (
    <button
      type="button"
      className="hover:bg-muted/50 focus-visible:outline-primary grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-t px-1 py-4 text-left focus-visible:outline-2"
    >
      <span
        className={`grid size-8 place-items-center rounded-xl ${item.urgent ? "bg-terracotta-light text-terracotta" : "bg-lavender-100 text-primary"}`}
      >
        {item.urgent ? (
          <AlertTriangle className="size-4" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-sm">{item.label}</strong>
        <span className="text-muted-foreground mt-1 block truncate text-xs">
          {item.detail}
        </span>
      </span>
      <span className="text-secondary-foreground flex items-center gap-2 text-xs font-semibold">
        <span className="hidden sm:inline">{item.state}</span>
        <ChevronRight className="size-4" />
      </span>
    </button>
  );
}

function RoleNav({ role }: { role: RoleKey }) {
  const common = ["Dashboard", "Notifications"];
  const roleLinks =
    role === "student"
      ? ["My Courses", "Questions", "Certificates"]
      : role === "faculty"
        ? ["Work queue", "My Courses", "Students", "Announcements"]
        : ["Courses", "Enrollments", "Faculty", "Resources", "Audit"];
  return (
    <aside className="bg-sidebar hidden min-h-[calc(100vh-4rem)] border-r p-4 lg:block">
      <nav aria-label={`${roleNames[role]} navigation`} className="space-y-1">
        {[...common, ...roleLinks].map((label, index) => (
          <button
            key={label}
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${index === 0 ? "bg-lavender-100 text-lavender-900" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            {index === 0 ? (
              <LayoutDashboard className="size-4" />
            ) : label.includes("Course") ? (
              <BookOpen className="size-4" />
            ) : label === "Settings" ? (
              <Settings className="size-4" />
            ) : (
              <Users className="size-4" />
            )}
            {label}
          </button>
        ))}
      </nav>
      <p className="text-muted-foreground mt-8 border-t pt-4 text-xs leading-5">
        Counts and links reflect only records this role can open.
      </p>
    </aside>
  );
}

function VariantA({ role }: { role: RoleKey }) {
  const data = roleData[role];
  return (
    <div className="lg:grid lg:grid-cols-[210px_minmax(0,1fr)]">
      <RoleNav role={role} />
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl px-4 py-7 md:px-7 md:py-10"
      >
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section>
            <p className="text-muted-foreground text-sm">{data.summary}</p>
            <h1 className="font-display mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.025em] md:text-4xl">
              {data.heading}
            </h1>
            <button
              type="button"
              className="bg-lavender-900 focus-visible:outline-primary mt-7 w-full rounded-2xl p-5 text-left text-white shadow-[0_14px_36px_-22px_oklch(0.28_0.05_290)] focus-visible:outline-2 focus-visible:outline-offset-2 md:p-7"
            >
              <span className="text-lavender-200 text-xs font-semibold">
                Recommended next action
              </span>
              <span className="mt-3 flex items-start justify-between gap-6">
                <span>
                  <strong className="font-display block text-xl font-semibold md:text-2xl">
                    {data.primaryAction}
                  </strong>
                  <span className="text-lavender-100 mt-2 block text-sm leading-6">
                    {data.primaryDetail}
                  </span>
                </span>
                <ChevronRight className="mt-1 size-5 shrink-0" />
              </span>
            </button>
            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Needs attention
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Ordered by deadline, blocked impact, then age.
                </p>
              </div>
              <button className="text-primary text-sm font-semibold">
                View all
              </button>
            </div>
            <div className="mt-3">
              {data.items.map((item) => (
                <WorkRow key={item.label} item={item} />
              ))}
            </div>
          </section>
          <aside className="space-y-7 border-t pt-7 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-7">
            <section>
              <h2 className="font-display text-lg font-semibold">
                Current scope
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                {data.progress}
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-semibold">Watchlist</h2>
              <div className="mt-3 divide-y border-y">
                {data.watch.map((item) => (
                  <WorkRow key={item.label} item={item} />
                ))}
              </div>
            </section>
            <section className="bg-lavender-100 rounded-2xl p-5">
              <h2 className="font-display text-lg font-semibold">
                Dashboard rule
              </h2>
              <p className="text-lavender-900 mt-2 text-sm leading-6">
                This page summarizes and routes. Detailed learning, review, and
                administrative decisions stay in their own workspaces.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function VariantB({ role }: { role: RoleKey }) {
  const data = roleData[role];
  const events = [
    ["Now", data.primaryAction, data.primaryDetail],
    ["Before 2 PM", data.items[0].label, data.items[0].detail],
    ["This afternoon", data.items[1].label, data.items[1].detail],
    ["Later", data.items[2].label, data.items[2].detail],
  ];
  return (
    <main
      id="main-content"
      className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-4 py-9 md:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-7">
        <div>
          <h1 className="font-display text-3xl font-semibold">Today</h1>
          <p className="text-muted-foreground mt-2 text-sm">{data.summary}</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold">
          <CalendarDays className="size-4" /> Change day
        </button>
      </div>
      <div className="mt-8">
        {events.map(([time, label, detail], index) => (
          <div
            key={time}
            className="grid grid-cols-[84px_20px_minmax(0,1fr)] gap-3 pb-8"
          >
            <span className="text-muted-foreground pt-1 text-xs font-semibold">
              {time}
            </span>
            <span className="flex flex-col items-center">
              <span
                className={`mt-1 size-3 rounded-full ${index === 0 ? "bg-primary" : "border-lavender-200 bg-background border-2"}`}
              />
              {index < events.length - 1 ? (
                <span className="bg-border mt-2 h-full w-px" />
              ) : null}
            </span>
            <button
              className={`rounded-2xl p-5 text-left ${index === 0 ? "bg-lavender-900 text-white" : "bg-card hover:bg-muted/50 border"}`}
            >
              <strong className="font-display block text-lg">{label}</strong>
              <span
                className={`mt-2 block text-sm ${index === 0 ? "text-lavender-100" : "text-muted-foreground"}`}
              >
                {detail}
              </span>
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

function VariantC({ role }: { role: RoleKey }) {
  const data = roleData[role];
  const lanes = [
    { name: "Act now", icon: AlertTriangle, items: [data.items[0]] },
    { name: "Continue", icon: BookOpen, items: [data.items[1], data.items[2]] },
    { name: "Monitor", icon: FileWarning, items: data.watch },
  ];
  return (
    <main
      id="main-content"
      className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-7"
    >
      <div className="mx-auto max-w-7xl">
        <h1 className="font-display text-3xl font-semibold">{data.heading}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{data.progress}</p>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {lanes.map(({ name, icon: Icon, items }) => (
            <section
              key={name}
              className="bg-muted/60 min-h-72 rounded-2xl p-4"
            >
              <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                <Icon className="text-primary size-4" />
                {name}
              </h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <button
                    key={item.label}
                    className="bg-card w-full rounded-xl p-4 text-left shadow-[0_8px_24px_-20px_oklch(0.28_0.05_290)]"
                  >
                    <strong className="block text-sm">{item.label}</strong>
                    <span className="text-muted-foreground mt-2 block text-xs leading-5">
                      {item.detail}
                    </span>
                    <span className="text-primary mt-3 block text-xs font-semibold">
                      {item.state}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function PrototypeSwitcher({
  variant,
  setVariant,
}: {
  variant: VariantKey;
  setVariant: (variant: VariantKey) => void;
}) {
  const variants = Object.keys(variantNames) as VariantKey[];
  const cycle = (direction: number) =>
    setVariant(
      variants[
        (variants.indexOf(variant) + direction + variants.length) %
          variants.length
      ],
    );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.matches("input, textarea, [contenteditable='true']")) return;
      if (event.key === "ArrowLeft") cycle(-1);
      if (event.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <div className="bg-foreground text-background fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full p-1.5 shadow-[0_14px_36px_-14px_oklch(0.18_0.02_280)]">
      <button
        type="button"
        onClick={() => cycle(-1)}
        aria-label="Previous dashboard variant"
        className="hover:bg-background/15 grid size-9 place-items-center rounded-full"
      >
        <ArrowLeft className="size-4" />
      </button>
      <span className="min-w-32 text-center text-xs font-semibold">
        {variant} · {variantNames[variant]}
      </span>
      <button
        type="button"
        onClick={() => cycle(1)}
        aria-label="Next dashboard variant"
        className="hover:bg-background/15 grid size-9 place-items-center rounded-full"
      >
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

export default function RoleDashboardsPrototype() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const variantParam = searchParams.get("variant")?.toUpperCase();
  const roleParam = searchParams.get("role")?.toLowerCase();
  const variant: VariantKey =
    variantParam && variantParam in variantNames
      ? (variantParam as VariantKey)
      : "A";
  const role: RoleKey =
    roleParam && roleParam in roleNames ? (roleParam as RoleKey) : "student";
  const update = (nextVariant: VariantKey, nextRole: RoleKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", nextVariant);
    params.set("role", nextRole);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  return (
    <div className="bg-background text-foreground selection:bg-lavender-200 selection:text-lavender-900 min-h-screen">
      <a
        href="#main-content"
        className="focus:bg-background sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:px-4 focus:py-2"
      >
        Skip to dashboard
      </a>
      <TopBar role={role} setRole={(nextRole) => update(variant, nextRole)} />
      {variant === "A" ? (
        <VariantA role={role} />
      ) : variant === "B" ? (
        <VariantB role={role} />
      ) : (
        <VariantC role={role} />
      )}
      <PrototypeSwitcher
        variant={variant}
        setVariant={(nextVariant) => update(nextVariant, role)}
      />
    </div>
  );
}
