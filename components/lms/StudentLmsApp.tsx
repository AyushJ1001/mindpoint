"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  LockKeyhole,
  PlayCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  studentLmsApi,
  type LmsProgressStatus,
  type StudentLmsActivity,
} from "@/lib/lms-api";

const isLmsConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CONVEX_URL,
);

const activityLabels: Record<StudentLmsActivity["type"], string> = {
  reading: "Reading",
  media: "Media",
  external_resource: "Resource",
  quiz: "Knowledge check",
  assignment: "Assignment",
  feedback: "Feedback",
};

function formatError(error: unknown) {
  return error instanceof Error
    ? error.message.replace(/^\[CONVEX[^]*?\]\s*/, "")
    : "Something interrupted the learning current. Please try again.";
}

function LoadingWorkspace() {
  return (
    <div
      className="lms-live-state"
      aria-busy="true"
      aria-label="Loading learning workspace"
    >
      <div className="lms-live-skeleton lms-live-skeleton-mark" />
      <div className="lms-live-skeleton lms-live-skeleton-title" />
      <div className="lms-live-skeleton lms-live-skeleton-copy" />
    </div>
  );
}

function GatewayState({ kind }: { kind: "configuration" | "signin" }) {
  const configuration = kind === "configuration";
  return (
    <div className="lms-live-page">
      <section className="lms-live-gateway" aria-labelledby="lms-gateway-title">
        <Image
          src="/brand/the-mind-point-logo.png"
          alt="The Mind Point"
          width={430}
          height={350}
          className="lms-live-gateway-logo"
          priority
        />
        <div className="lms-live-gateway-copy">
          <h1 id="lms-gateway-title">
            {configuration
              ? "Your learning space is nearly ready."
              : "Return to your learning current."}
          </h1>
          <p>
            {configuration
              ? "The secure learning connection has not been configured in this environment. Add the Clerk and Convex public keys to open enrolled Courses."
              : "Sign in with the account used for your Enrollment. Your Course, progress, and private Faculty support will be waiting here."}
          </p>
          {configuration ? (
            <>
              <p className="lms-live-gateway-note">
                No Student data is shown while the secure connection is
                unavailable.
              </p>
              <Button asChild variant="outline" className="lms-live-outline">
                <Link href="/lms/preview?role=student">
                  Open the interface preview
                </Link>
              </Button>
            </>
          ) : (
            <SignInButton mode="modal">
              <Button className="lms-live-primary">Sign in to learn</Button>
            </SignInButton>
          )}
        </div>
      </section>
    </div>
  );
}

export function StudentLmsApp() {
  if (!isLmsConfigured) return <GatewayState kind="configuration" />;

  return <AuthenticatedStudentLmsApp />;
}

function AuthenticatedStudentLmsApp() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const enrollments = useQuery(
    studentLmsApi.listMyEnrollments,
    isLmsConfigured && isAuthenticated ? {} : "skip",
  );
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>();
  const selectedEnrollment = enrollments?.find(
    (item) => item.enrollmentId === selectedEnrollmentId,
  );
  const workspace = useQuery(
    studentLmsApi.getMyWorkspace,
    selectedEnrollment?.lmsStatus === "active" ||
      selectedEnrollment?.lmsStatus === "completed"
      ? { enrollmentId: selectedEnrollment.enrollmentId }
      : "skip",
  );
  const setSelfCompletion = useMutation(studentLmsApi.setSelfCompletion);
  const submitAssignment = useMutation(studentLmsApi.submitAssignment);
  const askQuestion = useMutation(studentLmsApi.askQuestion);
  const [selectedActivityId, setSelectedActivityId] = useState<string>();
  const [assignmentText, setAssignmentText] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [pendingAction, setPendingAction] = useState<string>();
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  }>();

  useEffect(() => {
    if (!selectedEnrollmentId && enrollments?.length) {
      const active = enrollments.find((item) => item.lmsStatus === "active");
      setSelectedEnrollmentId((active ?? enrollments[0]).enrollmentId);
    }
  }, [enrollments, selectedEnrollmentId]);

  const progressByActivity = useMemo(
    () =>
      new Map(
        workspace?.progress.map((item) => [item.activityId, item.status]) ?? [],
      ),
    [workspace?.progress],
  );
  const sortedActivities = useMemo(
    () =>
      [...(workspace?.activities ?? [])].sort((a, b) => {
        const moduleA =
          workspace?.modules.find((item) => item.moduleId === a.moduleId)
            ?.sortOrder ?? 0;
        const moduleB =
          workspace?.modules.find((item) => item.moduleId === b.moduleId)
            ?.sortOrder ?? 0;
        return moduleA - moduleB || a.sortOrder - b.sortOrder;
      }),
    [workspace],
  );

  useEffect(() => {
    if (!workspace) return;
    const selected = workspace.activities.find(
      (item) => item.activityId === selectedActivityId,
    );
    if (selected?.isAvailable) return;
    const current = sortedActivities.find(
      (item) =>
        item.isAvailable &&
        progressByActivity.get(item.activityId) !== "completed",
    );
    const available =
      current ?? sortedActivities.find((item) => item.isAvailable);
    setSelectedActivityId(available?.activityId);
  }, [progressByActivity, selectedActivityId, sortedActivities, workspace]);

  if (isAuthLoading)
    return (
      <div className="lms-live-page">
        <LoadingWorkspace />
      </div>
    );
  if (!isAuthenticated) return <GatewayState kind="signin" />;
  if (enrollments === undefined)
    return (
      <div className="lms-live-page">
        <LoadingWorkspace />
      </div>
    );

  if (enrollments.length === 0) {
    return (
      <div className="lms-live-page">
        <section className="lms-live-empty">
          <Image
            src="/brand/the-mind-point-mark.png"
            alt=""
            width={180}
            height={180}
          />
          <h1>Your first learning current starts with an Enrollment.</h1>
          <p>
            When you enroll in a Course with this signed-in account, it will
            appear here automatically.
          </p>
          <Button asChild className="lms-live-primary">
            <Link href="/courses">Explore Courses</Link>
          </Button>
        </section>
      </div>
    );
  }

  if (
    !selectedEnrollment ||
    selectedEnrollment.lmsStatus === "awaiting_activation" ||
    selectedEnrollment.lmsStatus === "suspended"
  ) {
    return (
      <div className="lms-live-page">
        <header className="lms-live-current">
          <Image
            src="/brand/the-mind-point-logo.png"
            alt="The Mind Point"
            width={250}
            height={190}
          />
          <span>Secure Student workspace</span>
        </header>
        <section className="lms-live-empty">
          <Clock3 aria-hidden="true" />
          <h1>
            {selectedEnrollment?.courseName ?? "Your Course"} is enrolled.
          </h1>
          <p>
            {selectedEnrollment?.lmsStatus === "suspended"
              ? "Learning access is paused. Please contact The Mind Point team for help."
              : "The Course team is preparing your Curriculum. Your workspace will open here as soon as it is activated."}
          </p>
          <EnrollmentSelect
            enrollments={enrollments}
            value={selectedEnrollmentId}
            onChange={setSelectedEnrollmentId}
          />
        </section>
      </div>
    );
  }

  if (workspace === undefined)
    return (
      <div className="lms-live-page">
        <LoadingWorkspace />
      </div>
    );
  if (workspace === null) {
    return (
      <div className="lms-live-page">
        <section className="lms-live-empty">
          <h1>This workspace is not available yet.</h1>
          <p>
            The published Curriculum may have changed. Please refresh or contact
            The Mind Point team.
          </p>
        </section>
      </div>
    );
  }

  const selectedActivity = sortedActivities.find(
    (item) => item.activityId === selectedActivityId,
  );
  const completedCount = sortedActivities.filter(
    (item) => progressByActivity.get(item.activityId) === "completed",
  ).length;
  const progressPercent = sortedActivities.length
    ? Math.round((completedCount / sortedActivities.length) * 100)
    : 0;

  async function runAction(
    key: string,
    action: () => Promise<unknown>,
    success: string,
  ) {
    setPendingAction(key);
    setNotice(undefined);
    try {
      await action();
      setNotice({ type: "success", text: success });
    } catch (error) {
      setNotice({ type: "error", text: formatError(error) });
    } finally {
      setPendingAction(undefined);
    }
  }

  return (
    <div className="lms-live-page">
      <header className="lms-live-current">
        <Image
          src="/brand/the-mind-point-logo.png"
          alt="The Mind Point"
          width={250}
          height={190}
          priority
        />
        <div>
          <span>Student workspace</span>
          <strong>Learn · Grow · Heal · Belong.</strong>
        </div>
        <EnrollmentSelect
          enrollments={enrollments}
          value={selectedEnrollmentId}
          onChange={(value) => {
            setSelectedEnrollmentId(value);
            setSelectedActivityId(undefined);
          }}
        />
      </header>

      <section className="lms-live-course-head">
        <div>
          <h1>{workspace.course?.name ?? selectedEnrollment.courseName}</h1>
          <p>
            {workspace.curriculum.title} · Version{" "}
            {workspace.curriculum.version}
          </p>
        </div>
        <div
          className="lms-live-progress-summary"
          aria-label={`${progressPercent}% complete`}
        >
          <span>
            {completedCount} of {sortedActivities.length} activities
          </span>
          <strong>{progressPercent}% complete</strong>
        </div>
      </section>

      <div className="lms-live-progress-track" aria-hidden="true">
        <span style={{ transform: `scaleX(${progressPercent / 100})` }} />
      </div>

      <div className="lms-live-basin">
        <nav className="lms-live-map" aria-label="Course activities">
          <h2>Course map</h2>
          {workspace.modules.map((module) => (
            <section key={module.moduleId}>
              <h3>{module.title}</h3>
              {sortedActivities
                .filter((item) => item.moduleId === module.moduleId)
                .map((activity) => {
                  const status =
                    progressByActivity.get(activity.activityId) ??
                    "not_started";
                  return (
                    <button
                      key={activity.activityId}
                      type="button"
                      className="lms-live-activity-row"
                      aria-current={
                        activity.activityId === selectedActivityId
                          ? "step"
                          : undefined
                      }
                      disabled={!activity.isAvailable}
                      onClick={() => {
                        setSelectedActivityId(activity.activityId);
                        setNotice(undefined);
                      }}
                    >
                      <ActivityState
                        status={status}
                        available={activity.isAvailable}
                      />
                      <span>
                        <strong>{activity.title}</strong>
                        <small>
                          {activity.isAvailable
                            ? `${activityLabels[activity.type]}${
                                activity.durationMinutes
                                  ? ` · ${activity.durationMinutes} min`
                                  : ""
                              }`
                            : `Locked · ${activity.lockReason ?? "Not available yet"}`}
                        </small>
                      </span>
                    </button>
                  );
                })}
            </section>
          ))}
        </nav>

        <main className="lms-live-work" id="lms-active-work">
          {selectedActivity ? (
            <ActivityWork
              activity={selectedActivity}
              status={
                progressByActivity.get(selectedActivity.activityId) ??
                "not_started"
              }
              assignmentText={assignmentText}
              pendingAction={pendingAction}
              onAssignmentText={setAssignmentText}
              onComplete={() =>
                runAction(
                  "complete",
                  () =>
                    setSelfCompletion({
                      enrollmentId: workspace.enrollment.enrollmentId,
                      activityId: selectedActivity.activityId,
                      completed: true,
                    }),
                  "Activity complete. Your learning current has moved forward.",
                )
              }
              onSubmit={() =>
                runAction(
                  "submit",
                  async () => {
                    await submitAssignment({
                      enrollmentId: workspace.enrollment.enrollmentId,
                      activityId: selectedActivity.activityId,
                      responseText: assignmentText,
                    });
                    setAssignmentText("");
                  },
                  "Your response is with Faculty for review.",
                )
              }
            />
          ) : (
            <div className="lms-live-work-empty">
              <BookOpen aria-hidden="true" />
              <h2>Your Course map is ready.</h2>
              <p>Select an available activity to begin.</p>
            </div>
          )}
          {notice && (
            <p
              className={`lms-live-notice ${notice.type}`}
              role={notice.type === "error" ? "alert" : "status"}
            >
              {notice.text}
            </p>
          )}
        </main>

        <aside className="lms-live-bank">
          <section>
            <h2>Your progress</h2>
            <p>
              <strong>{progressPercent}%</strong> of this Curriculum is
              complete.
            </p>
            <p>
              {
                sortedActivities.filter(
                  (item) =>
                    item.isAvailable &&
                    progressByActivity.get(item.activityId) !== "completed",
                ).length
              }{" "}
              activities are ready now.
            </p>
          </section>
          <section>
            <h2>Ask Faculty privately</h2>
            <p>
              Your question stays connected to this Enrollment and the selected
              activity.
            </p>
            <label htmlFor="lms-question">Your question</label>
            <Textarea
              id="lms-question"
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="What would help you continue?"
            />
            <Button
              className="lms-live-primary"
              disabled={!questionText.trim() || pendingAction === "question"}
              onClick={() =>
                runAction(
                  "question",
                  async () => {
                    await askQuestion({
                      enrollmentId: workspace.enrollment.enrollmentId,
                      activityId: selectedActivity?.activityId,
                      visibility: "private",
                      body: questionText,
                    });
                    setQuestionText("");
                  },
                  "Your private question has been sent to Faculty.",
                )
              }
            >
              <Send aria-hidden="true" />
              {pendingAction === "question"
                ? "Sending…"
                : "Send private question"}
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function EnrollmentSelect({
  enrollments,
  value,
  onChange,
}: {
  enrollments: Array<{ enrollmentId: string; courseName: string }>;
  value?: string;
  onChange: (value: string) => void;
}) {
  if (enrollments.length === 1)
    return (
      <span className="lms-live-enrollment">{enrollments[0].courseName}</span>
    );
  return (
    <label className="lms-live-select">
      <span>Course</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      >
        {enrollments.map((item) => (
          <option key={item.enrollmentId} value={item.enrollmentId}>
            {item.courseName}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActivityState({
  status,
  available,
}: {
  status: LmsProgressStatus;
  available: boolean;
}) {
  if (!available) return <LockKeyhole aria-label="Locked" />;
  if (status === "completed") return <CheckCircle2 aria-label="Complete" />;
  if (status === "awaiting_review" || status === "submitted")
    return <Clock3 aria-label="Awaiting review" />;
  return <span className="lms-live-state-dot" aria-label="Available" />;
}

function ActivityWork({
  activity,
  status,
  assignmentText,
  pendingAction,
  onAssignmentText,
  onComplete,
  onSubmit,
}: {
  activity: StudentLmsActivity;
  status: LmsProgressStatus;
  assignmentText: string;
  pendingAction?: string;
  onAssignmentText: (value: string) => void;
  onComplete: () => void;
  onSubmit: () => void;
}) {
  const icon =
    activity.type === "media" ? (
      <PlayCircle />
    ) : activity.type === "assignment" ? (
      <FileText />
    ) : (
      <BookOpen />
    );
  const complete = status === "completed";
  const awaiting = status === "awaiting_review" || status === "submitted";
  return (
    <article>
      <div className="lms-live-work-meta">
        {icon}
        <span>{activityLabels[activity.type]}</span>
        {activity.durationMinutes && (
          <span>
            <Clock3 />
            {activity.durationMinutes} min
          </span>
        )}
        {activity.required && <span>Required</span>}
      </div>
      <h2>{activity.title}</h2>
      {activity.instructions && (
        <p className="lms-live-instructions">{activity.instructions}</p>
      )}
      {activity.content && (
        <div className="lms-live-reading">
          {activity.content
            .split("\n")
            .filter(Boolean)
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
        </div>
      )}
      {activity.accessibleAlternative && (
        <details>
          <summary>Accessible alternative</summary>
          <p>{activity.accessibleAlternative}</p>
        </details>
      )}
      {activity.externalUrl && (
        <Button asChild variant="outline" className="lms-live-outline">
          <a href={activity.externalUrl} target="_blank" rel="noreferrer">
            Open secure resource <ArrowUpRight />
          </a>
        </Button>
      )}
      {activity.type === "assignment" && !awaiting && !complete && (
        <div className="lms-live-response">
          <label htmlFor="lms-assignment">Your response</label>
          <Textarea
            id="lms-assignment"
            value={assignmentText}
            onChange={(event) => onAssignmentText(event.target.value)}
            placeholder="Write your reflection or response here…"
          />
          <Button
            className="lms-live-primary"
            disabled={!assignmentText.trim() || pendingAction === "submit"}
            onClick={onSubmit}
          >
            <Send />
            {pendingAction === "submit"
              ? "Submitting…"
              : "Submit for Faculty review"}
          </Button>
        </div>
      )}
      {(activity.type === "quiz" || activity.type === "feedback") && (
        <div className="lms-live-coming">
          <Sparkles />
          <div>
            <strong>This activity is being prepared.</strong>
            <p>It will open when its secure response flow is ready.</p>
          </div>
        </div>
      )}
      {(activity.completionMode === "view" ||
        activity.completionMode === "self_confirm") &&
        activity.type !== "quiz" &&
        activity.type !== "feedback" &&
        !complete && (
          <Button
            className="lms-live-primary"
            disabled={pendingAction === "complete"}
            onClick={onComplete}
          >
            <Check />
            {pendingAction === "complete"
              ? "Saving…"
              : "Mark activity complete"}
          </Button>
        )}
      {complete && (
        <p className="lms-live-complete">
          <CheckCircle2 /> Complete
        </p>
      )}
      {awaiting && (
        <p className="lms-live-complete awaiting">
          <Clock3 /> Submitted · awaiting Faculty review
        </p>
      )}
    </article>
  );
}
