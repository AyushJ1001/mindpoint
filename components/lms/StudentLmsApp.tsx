"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileText,
  LockKeyhole,
  MessagesSquare,
  Printer,
  Search,
  Save,
  PlayCircle,
  Send,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  studentLmsApi,
  type LmsProgressStatus,
  type LmsLearningMode,
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

const learningModeLabels: Record<LmsLearningMode, string> = {
  self_paced: "Self-paced learning",
  hybrid: "Live + self-paced learning",
  cohort: "Cohort learning",
  event: "Live learning event",
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
  const saveAssignmentDraft = useMutation(studentLmsApi.saveAssignmentDraft);
  const submitQuizAttempt = useMutation(studentLmsApi.submitQuizAttempt);
  const submitFeedback = useMutation(studentLmsApi.submitFeedback);
  const askQuestion = useMutation(studentLmsApi.askQuestion);
  const confirmCertificateName = useMutation(
    studentLmsApi.confirmCertificateName,
  );
  const setCertificateVerificationConsent = useMutation(
    studentLmsApi.setCertificateVerificationConsent,
  );
  const markNotificationRead = useMutation(studentLmsApi.markNotificationRead);
  const [selectedActivityId, setSelectedActivityId] = useState<string>();
  const [assignmentText, setAssignmentText] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionVisibility, setQuestionVisibility] = useState<
    "private" | "course" | "batch"
  >("private");
  const [questionSearch, setQuestionSearch] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [pendingAction, setPendingAction] = useState<string>();
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  }>();

  useEffect(() => {
    if (!selectedEnrollmentId && enrollments?.length) {
      const requestedEnrollmentId = new URLSearchParams(
        window.location.search,
      ).get("enrollment");
      const requestedEnrollment = enrollments.find(
        (item) => item.enrollmentId === requestedEnrollmentId,
      );
      const active = enrollments.find((item) => item.lmsStatus === "active");
      setSelectedEnrollmentId(
        (requestedEnrollment ?? active ?? enrollments[0]).enrollmentId,
      );
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
  const visibleQuestions = useMemo(() => {
    const query = questionSearch.trim().toLocaleLowerCase();
    if (!query) return workspace?.questions ?? [];
    return (workspace?.questions ?? []).filter(
      (question) =>
        question.body.toLocaleLowerCase().includes(query) ||
        question.officialAnswer?.toLocaleLowerCase().includes(query),
    );
  }, [questionSearch, workspace?.questions]);

  useEffect(() => {
    if (!workspace) return;
    const selected = workspace.activities.find(
      (item) => item.activityId === selectedActivityId,
    );
    if (selected?.isAvailable) return;
    const requestedActivityId = new URLSearchParams(window.location.search).get(
      "activity",
    );
    const requestedActivity = workspace.activities.find(
      (item) => item.activityId === requestedActivityId && item.isAvailable,
    );
    const current = sortedActivities.find(
      (item) =>
        item.isAvailable &&
        progressByActivity.get(item.activityId) !== "completed",
    );
    const available =
      requestedActivity ??
      current ??
      sortedActivities.find((item) => item.isAvailable);
    setSelectedActivityId(available?.activityId);
  }, [progressByActivity, selectedActivityId, sortedActivities, workspace]);

  useEffect(() => {
    if (workspace?.completion?.confirmedRecipientName) {
      setCertificateName(workspace.completion.confirmedRecipientName);
    }
  }, [workspace?.completion?.confirmedRecipientName]);

  useEffect(() => {
    const activity = workspace?.activities.find(
      (item) => item.activityId === selectedActivityId,
    );
    if (activity?.type !== "assignment") {
      setAssignmentText("");
      return;
    }
    const latest = activity.assignment?.latestAttempt;
    setAssignmentText(
      latest?.status === "draft" || latest?.status === "returned"
        ? latest.responseText
        : "",
    );
  }, [selectedActivityId, workspace?.activities]);

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
          {selectedEnrollment && (
            <span className="lms-live-mode">
              {learningModeLabels[selectedEnrollment.learningMode]}
            </span>
          )}
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
            {learningModeLabels[workspace.course?.learningMode ?? "self_paced"]}
            {" · "}
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
              key={selectedActivity.activityId}
              activity={selectedActivity}
              status={
                progressByActivity.get(selectedActivity.activityId) ??
                "not_started"
              }
              assignmentText={assignmentText}
              pendingAction={pendingAction}
              onAssignmentText={setAssignmentText}
              onSaveDraft={() =>
                runAction(
                  "save-draft",
                  () =>
                    saveAssignmentDraft({
                      enrollmentId: workspace.enrollment.enrollmentId,
                      activityId: selectedActivity.activityId,
                      responseText: assignmentText,
                    }),
                  "Draft saved. You can safely return to it later.",
                )
              }
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
              onSubmitQuiz={(answers) =>
                runAction(
                  "quiz",
                  () =>
                    submitQuizAttempt({
                      enrollmentId: workspace.enrollment.enrollmentId,
                      activityId: selectedActivity.activityId,
                      answers,
                    }),
                  "Your Quiz was scored and the result is recorded.",
                )
              }
              onSubmitFeedback={(rating, comment) =>
                runAction(
                  "feedback",
                  () =>
                    submitFeedback({
                      enrollmentId: workspace.enrollment.enrollmentId,
                      activityId: selectedActivity.activityId,
                      rating,
                      comment,
                    }),
                  "Feedback received. Your separate Completion receipt is ready.",
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
          {workspace.completion && (
            <section
              id="lms-certificate"
              className="lms-live-certificate-panel"
            >
              <Award aria-hidden="true" />
              <h2>Course completion</h2>
              {workspace.completion.certificate?.status === "issued" ? (
                <>
                  <p>
                    <strong>Certificate issued</strong>
                    <br />
                    {workspace.completion.certificate.recipientName}
                  </p>
                  <code>
                    {workspace.completion.certificate.verificationCode}
                  </code>
                  <Button
                    type="button"
                    className="lms-live-primary"
                    onClick={() => window.print()}
                  >
                    <Printer aria-hidden="true" /> Print or save PDF
                  </Button>
                  <label className="lms-live-consent">
                    <input
                      type="checkbox"
                      checked={
                        workspace.completion.certificate
                          .publicVerificationEnabled
                      }
                      disabled={pendingAction === "verification"}
                      onChange={(event) =>
                        runAction(
                          "verification",
                          () =>
                            setCertificateVerificationConsent({
                              enrollmentId: workspace.enrollment.enrollmentId,
                              enabled: event.target.checked,
                            }),
                          event.target.checked
                            ? "Public verification now includes your confirmed name."
                            : "Your name is now hidden from public verification.",
                        )
                      }
                    />
                    <span>Let public verification show my confirmed name</span>
                  </label>
                  <Link
                    className="lms-live-verify-link"
                    href={`/verify/${workspace.completion.certificate.verificationCode}`}
                  >
                    <ShieldCheck aria-hidden="true" /> Open verification page
                  </Link>
                </>
              ) : workspace.completion.certificate ? (
                <div className="lms-live-certificate-hold" role="status">
                  <strong>
                    Certificate {workspace.completion.certificate.status}
                  </strong>
                  <p>
                    {workspace.completion.correctionReason ??
                      "The Mind Point team is reviewing this Certificate record."}
                  </p>
                </div>
              ) : workspace.completion.status === "pending" ? (
                <p>
                  Your confirmed name is with Faculty for final evidence
                  approval.
                </p>
              ) : workspace.completion.status === "under_review" ? (
                <div className="lms-live-certificate-hold" role="status">
                  <strong>Completion under review</strong>
                  <p>
                    {workspace.completion.correctionReason ??
                      "Faculty is reviewing the evidence before making a decision."}
                  </p>
                </div>
              ) : workspace.completion.status === "revoked" ? (
                <div className="lms-live-certificate-hold" role="status">
                  <strong>Completion revoked</strong>
                  <p>
                    {workspace.completion.correctionReason ??
                      "Contact The Mind Point team for the reviewed record."}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void runAction(
                      "certificate-name",
                      () =>
                        confirmCertificateName({
                          enrollmentId: workspace.enrollment.enrollmentId,
                          recipientName: certificateName,
                        }),
                      "Name confirmed. Faculty can now approve your Completion.",
                    );
                  }}
                >
                  <p>
                    {workspace.completion.status === "correction_required"
                      ? `A correction is required: ${workspace.completion.correctionReason ?? "confirm the corrected Certificate name."}`
                      : "Every required activity is complete. Confirm the exact name to print on your Certificate."}
                  </p>
                  <label htmlFor="lms-certificate-name">Certificate name</label>
                  <input
                    id="lms-certificate-name"
                    value={certificateName}
                    maxLength={120}
                    autoComplete="name"
                    onChange={(event) => setCertificateName(event.target.value)}
                  />
                  <Button
                    type="submit"
                    className="lms-live-primary"
                    disabled={
                      certificateName.trim().length < 2 ||
                      pendingAction === "certificate-name"
                    }
                  >
                    Confirm name
                  </Button>
                </form>
              )}
            </section>
          )}
          {workspace.notifications.length > 0 && (
            <section
              className="lms-live-notifications"
              aria-labelledby="notifications-title"
            >
              <h2 id="notifications-title">
                <Bell aria-hidden="true" /> Updates
              </h2>
              <div>
                {workspace.notifications.slice(0, 5).map((notification) => (
                  <Link
                    key={notification.notificationId}
                    href={notification.href}
                    className={notification.readAt ? "read" : "unread"}
                    onClick={() => {
                      if (!notification.readAt) {
                        void markNotificationRead({
                          notificationId: notification.notificationId,
                        });
                      }
                    }}
                  >
                    <span>{notification.title}</span>
                    <small>{notification.body}</small>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <section id="lms-questions" className="lms-live-discussion">
            <h2>
              <MessagesSquare aria-hidden="true" /> Questions
            </h2>
            <p>
              Ask privately, or share a Course or batch Question for other
              learners to read.
            </p>
            <label htmlFor="lms-question-visibility">Who can read it?</label>
            <select
              id="lms-question-visibility"
              value={questionVisibility}
              onChange={(event) =>
                setQuestionVisibility(
                  event.target.value as "private" | "course" | "batch",
                )
              }
            >
              <option value="private">Only me and Faculty</option>
              <option value="course">Everyone in this Course</option>
              {workspace.enrollment.batchLabel && (
                <option value="batch">Only my batch</option>
              )}
            </select>
            <label htmlFor="lms-question">Your question</label>
            <Textarea
              id="lms-question"
              value={questionText}
              maxLength={2000}
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
                      visibility: questionVisibility,
                      body: questionText,
                    });
                    setQuestionText("");
                  },
                  questionVisibility === "private"
                    ? "Your private Question has been sent to Faculty."
                    : "Your Question is now visible in the selected learning space.",
                )
              }
            >
              <Send aria-hidden="true" />
              {pendingAction === "question" ? "Sending…" : "Post Question"}
            </Button>
            <label htmlFor="lms-question-search">Search Questions</label>
            <div className="lms-live-question-search">
              <Search aria-hidden="true" />
              <input
                id="lms-question-search"
                type="search"
                value={questionSearch}
                onChange={(event) => setQuestionSearch(event.target.value)}
                placeholder="Search Questions and answers"
              />
            </div>
            <div className="lms-live-question-list" aria-live="polite">
              {visibleQuestions.length ? (
                visibleQuestions.slice(0, 12).map((question) => (
                  <article key={question.questionId}>
                    <div>
                      <span>{question.visibility}</span>
                      <small>
                        {question.isMine ? "Your Question" : "Student Question"}
                      </small>
                    </div>
                    <p>{question.body}</p>
                    {question.officialAnswer && (
                      <blockquote>
                        <strong>Official Faculty answer</strong>
                        {question.officialAnswer}
                      </blockquote>
                    )}
                    {question.status === "closed" && (
                      <p className="moderated">
                        Closed by Faculty
                        {question.moderationReason
                          ? ` · ${question.moderationReason}`
                          : ""}
                      </p>
                    )}
                  </article>
                ))
              ) : (
                <p className="lms-live-question-empty">
                  {questionSearch
                    ? "No Questions match this search."
                    : "No Questions have been posted yet."}
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
      {workspace.completion?.certificate && (
        <section className="lms-certificate-print" aria-hidden="true">
          <Image
            src="/brand/the-mind-point-logo.png"
            alt="The Mind Point"
            width={280}
            height={220}
          />
          <p>Certificate of completion</p>
          <h1>{workspace.completion.certificate.recipientName}</h1>
          <p>has completed</p>
          <h2>{workspace.completion.certificate.courseName}</h2>
          <footer>
            Issued{" "}
            {new Date(
              workspace.completion.certificate.issuedAt,
            ).toLocaleDateString()}{" "}
            · Verify {workspace.completion.certificate.verificationCode}
          </footer>
        </section>
      )}
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
  onSaveDraft,
  onComplete,
  onSubmit,
  onSubmitQuiz,
  onSubmitFeedback,
}: {
  activity: StudentLmsActivity;
  status: LmsProgressStatus;
  assignmentText: string;
  pendingAction?: string;
  onAssignmentText: (value: string) => void;
  onSaveDraft: () => void;
  onComplete: () => void;
  onSubmit: () => void;
  onSubmitQuiz: (
    answers: Array<{
      questionId: NonNullable<
        StudentLmsActivity["quiz"]
      >["questions"][number]["questionId"];
      optionId: NonNullable<
        StudentLmsActivity["quiz"]
      >["questions"][number]["options"][number]["optionId"];
    }>,
  ) => Promise<unknown>;
  onSubmitFeedback: (rating: number, comment: string) => Promise<unknown>;
}) {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const icon =
    activity.type === "media" ? (
      <PlayCircle />
    ) : activity.type === "quiz" ? (
      <CircleHelp />
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
      {activity.type === "assignment" && (
        <div className="lms-live-assignment-flow">
          {activity.gradingCriteria && (
            <section className="lms-live-review-criteria">
              <h3>What Faculty will review</h3>
              <p>{activity.gradingCriteria}</p>
            </section>
          )}
          {activity.assignment?.latestAttempt &&
            activity.assignment.latestAttempt.status !== "draft" && (
              <section className="lms-live-submission-state" aria-live="polite">
                <div>
                  <strong>
                    Attempt {activity.assignment.latestAttempt.attemptNumber} ·{" "}
                    {activity.assignment.latestAttempt.status.replaceAll(
                      "_",
                      " ",
                    )}
                  </strong>
                  {activity.assignment.latestAttempt.submittedAt && (
                    <span>
                      Submitted{" "}
                      {new Date(
                        activity.assignment.latestAttempt.submittedAt,
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {activity.assignment.latestAttempt.feedback && (
                  <p>
                    <strong>Faculty feedback</strong>
                    {activity.assignment.latestAttempt.feedback}
                  </p>
                )}
              </section>
            )}
          {!awaiting && !complete && (
            <div className="lms-live-response">
              <label htmlFor="lms-assignment">
                {activity.assignment?.latestAttempt?.status === "returned"
                  ? "Revise your response"
                  : "Your response"}
              </label>
              <Textarea
                id="lms-assignment"
                value={assignmentText}
                onChange={(event) => onAssignmentText(event.target.value)}
                placeholder="Write your reflection or response here…"
              />
              <div className="lms-live-response-actions">
                <Button
                  variant="outline"
                  className="lms-live-outline"
                  disabled={
                    !assignmentText.trim() || pendingAction === "save-draft"
                  }
                  onClick={onSaveDraft}
                >
                  <Save />
                  {pendingAction === "save-draft" ? "Saving…" : "Save Draft"}
                </Button>
                <Button
                  className="lms-live-primary"
                  disabled={!assignmentText.trim() || Boolean(pendingAction)}
                  onClick={onSubmit}
                >
                  <Send />
                  {pendingAction === "submit"
                    ? "Submitting…"
                    : activity.assignment?.latestAttempt?.status === "returned"
                      ? "Resubmit for review"
                      : "Submit for Faculty review"}
                </Button>
              </div>
              {activity.assignment?.latestAttempt?.status === "draft" && (
                <small role="status">
                  Draft saved{" "}
                  {new Date(
                    activity.assignment.latestAttempt.updatedAt,
                  ).toLocaleString()}
                </small>
              )}
            </div>
          )}
          {(awaiting || complete) && activity.assignment?.latestAttempt && (
            <blockquote className="lms-live-submitted-response">
              {activity.assignment.latestAttempt.responseText}
            </blockquote>
          )}
          {(activity.assignment?.history.length ?? 0) > 1 && (
            <details className="lms-live-attempt-history">
              <summary>Earlier attempts</summary>
              <ol>
                {activity.assignment?.history.slice(1).map((attempt) => (
                  <li key={attempt.submissionId}>
                    <strong>Attempt {attempt.attemptNumber}</strong>
                    <span>{attempt.status.replaceAll("_", " ")}</span>
                    {attempt.feedback && <p>{attempt.feedback}</p>}
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      )}
      {activity.type === "quiz" && activity.quiz && (
        <form
          className="lms-live-quiz"
          onSubmit={(event) => {
            event.preventDefault();
            const answers = activity.quiz!.questions.flatMap((question) => {
              const selectedOption = question.options.find(
                (option) =>
                  option.optionId === quizAnswers[question.questionId],
              );
              return selectedOption
                ? [
                    {
                      questionId: question.questionId,
                      optionId: selectedOption.optionId,
                    },
                  ]
                : [];
            });
            void onSubmitQuiz(answers);
          }}
        >
          {activity.quiz.latestAttempt && (
            <div
              className={`lms-live-quiz-result ${
                activity.quiz.latestAttempt.passed ? "passed" : "retry"
              }`}
              role="status"
            >
              <CheckCircle2 />
              <div>
                <strong>
                  {activity.quiz.latestAttempt.score}% · Attempt{" "}
                  {activity.quiz.latestAttempt.attemptNumber}
                </strong>
                <p>
                  {activity.quiz.latestAttempt.passed
                    ? "Passed. This result is part of your Completion evidence."
                    : `Not passed yet. Review the activity and try again; ${activity.passingScore ?? 100}% is required.`}
                </p>
              </div>
            </div>
          )}
          {!complete &&
            activity.quiz.questions.map((question, index) => (
              <fieldset key={question.questionId}>
                <legend>
                  <span>{index + 1}</span>
                  {question.prompt}
                </legend>
                {question.options.map((option) => (
                  <label key={option.optionId}>
                    <input
                      type="radio"
                      name={`quiz-${question.questionId}`}
                      value={option.optionId}
                      checked={
                        quizAnswers[question.questionId] === option.optionId
                      }
                      onChange={() =>
                        setQuizAnswers((current) => ({
                          ...current,
                          [question.questionId]: option.optionId,
                        }))
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </fieldset>
            ))}
          {!complete && (
            <Button
              type="submit"
              className="lms-live-primary"
              disabled={
                pendingAction === "quiz" ||
                Object.keys(quizAnswers).length !==
                  activity.quiz.questions.length
              }
            >
              <Check />
              {pendingAction === "quiz"
                ? "Scoring…"
                : activity.quiz.latestAttempt
                  ? "Submit another attempt"
                  : "Submit Quiz"}
            </Button>
          )}
        </form>
      )}
      {activity.type === "feedback" &&
        activity.feedback &&
        (activity.feedback.receipt ? (
          <section className="lms-live-feedback-receipt" aria-live="polite">
            <CheckCircle2 />
            <div>
              <strong>Feedback received</strong>
              <p>
                Your response is complete. Keep this separate receipt for your
                records.
              </p>
              <code>{activity.feedback.receipt.receiptCode}</code>
            </div>
          </section>
        ) : (
          <form
            className="lms-live-feedback"
            onSubmit={(event) => {
              event.preventDefault();
              void onSubmitFeedback(feedbackRating, feedbackComment);
            }}
          >
            <div className="lms-live-feedback-privacy">
              <Sparkles />
              <div>
                <strong>
                  {activity.feedback.mode === "anonymous"
                    ? "Your response is anonymous."
                    : "Your response is identified."}
                </strong>
                <p>
                  {activity.feedback.mode === "anonymous"
                    ? `Your answers contain no Student or Enrollment reference. Results open only after ${activity.feedback.minimumGroupSize ?? 5} responses; your Completion receipt is stored separately.`
                    : "Assigned Course staff can connect this response to your Enrollment. Your Completion receipt is stored with your progress."}
                </p>
              </div>
            </div>
            <fieldset>
              <legend>How useful was this learning experience?</legend>
              <div className="lms-live-rating">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label key={rating}>
                    <input
                      type="radio"
                      name={`feedback-rating-${activity.activityId}`}
                      value={rating}
                      checked={feedbackRating === rating}
                      onChange={() => setFeedbackRating(rating)}
                    />
                    <span>{rating}</span>
                  </label>
                ))}
              </div>
              <p className="lms-live-rating-scale">
                <span>Not useful yet</span>
                <span>Deeply useful</span>
              </p>
            </fieldset>
            <label htmlFor={`feedback-comment-${activity.activityId}`}>
              What should we keep or improve? <span>Optional</span>
            </label>
            <Textarea
              id={`feedback-comment-${activity.activityId}`}
              value={feedbackComment}
              maxLength={1500}
              onChange={(event) => setFeedbackComment(event.target.value)}
              placeholder="Share what supported your learning, or what would make this clearer…"
            />
            <div className="lms-live-feedback-submit">
              <span>{feedbackComment.length} / 1,500</span>
              <Button
                type="submit"
                className="lms-live-primary"
                disabled={feedbackRating === 0 || pendingAction === "feedback"}
              >
                <Send />
                {pendingAction === "feedback"
                  ? "Sending securely…"
                  : "Submit Feedback"}
              </Button>
            </div>
          </form>
        ))}
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
