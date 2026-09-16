"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  MessageSquareText,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { facultyLmsApi, type FacultyQueueItem } from "@/lib/lms-api";

const configured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CONVEX_URL,
);

function readableError(error: unknown) {
  return error instanceof Error
    ? error.message.replace(/^\[CONVEX[^]*?\]\s*/, "")
    : "The review could not be saved. Please try again.";
}

export function FacultyLmsApp() {
  if (!configured) {
    return (
      <div className="lms-live-page faculty-gateway">
        <section className="lms-live-gateway">
          <Image
            src="/brand/the-mind-point-logo.png"
            alt="The Mind Point"
            width={430}
            height={350}
            className="lms-live-gateway-logo"
            priority
          />
          <div className="lms-live-gateway-copy">
            <h1>Faculty review is ready to connect.</h1>
            <p>
              The secure Clerk and Convex connection is not configured in this
              environment. No Student evidence is exposed.
            </p>
            <Button asChild variant="outline" className="lms-live-outline">
              <Link href="/lms/preview?role=faculty">
                Open the Faculty preview
              </Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }
  return <AuthenticatedFacultyLms />;
}

function AuthenticatedFacultyLms() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const accessStatus = useQuery(
    facultyLmsApi.getAccessStatus,
    isAuthenticated ? {} : "skip",
  );
  const hasActiveAccess = (accessStatus?.activeAssignments ?? 0) > 0;
  const queue = useQuery(
    facultyLmsApi.listMyQueue,
    isAuthenticated && hasActiveAccess ? {} : "skip",
  );
  const feedbackReports = useQuery(
    facultyLmsApi.listMyFeedbackReports,
    isAuthenticated && hasActiveAccess ? {} : "skip",
  );
  const claimFacultyAccess = useMutation(facultyLmsApi.claimFacultyAccess);
  const reviewSubmission = useMutation(facultyLmsApi.reviewSubmission);
  const answerQuestion = useMutation(facultyLmsApi.answerQuestion);
  const moderateQuestion = useMutation(facultyLmsApi.moderateQuestion);
  const approveCompletion = useMutation(facultyLmsApi.approveCompletion);
  const updateCompletionReview = useMutation(
    facultyLmsApi.updateCompletionReview,
  );
  const [selectedId, setSelectedId] = useState<string>();
  const [response, setResponse] = useState("");
  const [pending, setPending] = useState<string>();
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  }>();
  const [claimingAccess, setClaimingAccess] = useState(false);
  const [accessError, setAccessError] = useState<string>();
  const selected =
    queue?.items.find((item) => item.id === selectedId) ?? queue?.items[0];

  if (
    isLoading ||
    (isAuthenticated &&
      (accessStatus === undefined ||
        (hasActiveAccess &&
          (queue === undefined || feedbackReports === undefined))))
  )
    return (
      <div className="lms-live-page">
        <div className="lms-live-state" aria-busy="true">
          <div className="lms-live-skeleton lms-live-skeleton-mark" />
          <div className="lms-live-skeleton lms-live-skeleton-title" />
          <div className="lms-live-skeleton lms-live-skeleton-copy" />
        </div>
      </div>
    );
  if (!isAuthenticated)
    return (
      <div className="lms-live-page faculty-gateway">
        <section className="lms-live-empty">
          <GraduationCap />
          <h1>Sign in to review assigned learning.</h1>
          <p>
            Faculty records appear only after Convex confirms your Clerk
            identity and Course assignment.
          </p>
          <SignInButton mode="modal">
            <Button className="lms-live-primary">Sign in as Faculty</Button>
          </SignInButton>
        </section>
      </div>
    );
  if (!accessStatus) return null;
  if (accessStatus.pendingAssignments > 0)
    return (
      <div className="lms-live-page faculty-gateway">
        <section className="lms-live-empty">
          <ShieldCheck />
          <h1>Your Faculty access is ready.</h1>
          <p>
            Confirm that {accessStatus.email} is your Faculty sign-in account.
            This securely connects your assigned Courses without sharing any
            technical account identifiers.
          </p>
          <Button
            className="lms-live-primary"
            disabled={claimingAccess}
            onClick={async () => {
              setClaimingAccess(true);
              setAccessError(undefined);
              try {
                await claimFacultyAccess({});
              } catch (error) {
                setAccessError(readableError(error));
              } finally {
                setClaimingAccess(false);
              }
            }}
          >
            <ShieldCheck />
            {claimingAccess
              ? "Activating Faculty access…"
              : "Confirm and activate access"}
          </Button>
          {accessError && (
            <p className="lms-live-notice error" role="alert">
              {accessError}
            </p>
          )}
        </section>
      </div>
    );
  if (!queue?.assignments.length)
    return (
      <div className="lms-live-page faculty-gateway">
        <section className="lms-live-empty">
          <GraduationCap />
          <h1>No Faculty scope is assigned.</h1>
          <p>
            Ask an Administrator to invite{" "}
            {accessStatus.email ?? "the email you use to sign in"} to a Course.
            Student evidence stays private until that assignment is confirmed.
          </p>
          <Button asChild variant="outline" className="lms-live-outline">
            <Link href="/lms">Go to Student learning</Link>
          </Button>
        </section>
      </div>
    );

  async function act(
    key: string,
    task: () => Promise<unknown>,
    success: string,
  ) {
    setPending(key);
    setNotice(undefined);
    try {
      await task();
      setResponse("");
      setNotice({ type: "success", text: success });
    } catch (error) {
      setNotice({ type: "error", text: readableError(error) });
    } finally {
      setPending(undefined);
    }
  }

  return (
    <div className="lms-live-page lms-faculty-page">
      <header className="lms-live-current">
        <Image
          src="/brand/the-mind-point-logo.png"
          alt="The Mind Point"
          width={250}
          height={190}
          priority
        />
        <div>
          <span>Faculty review desk</span>
          <strong>Evidence moves with care.</strong>
        </div>
        <Link href="/lms">Student workspace</Link>
      </header>
      <section className="faculty-head">
        <div>
          <h1>Review the next learning record.</h1>
          <p>{queue.assignments.map((item) => item.courseName).join(" · ")}</p>
        </div>
        <strong>{queue.items.length} waiting</strong>
      </section>
      <div className="faculty-basin">
        <nav className="faculty-queue" aria-label="Faculty review queue">
          <h2>Review queue</h2>
          {queue.items.length ? (
            queue.items.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-current={selected?.id === item.id ? "true" : undefined}
                onClick={() => {
                  setSelectedId(item.id);
                  setResponse("");
                  setNotice(undefined);
                }}
              >
                <span>
                  {item.kind === "submission" ? (
                    <FileText />
                  ) : item.kind === "completion" ? (
                    <GraduationCap />
                  ) : (
                    <MessageSquareText />
                  )}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    {item.studentName} · {item.courseName}
                  </small>
                </span>
                <Clock3 />
              </button>
            ))
          ) : (
            <div className="faculty-empty">
              <CheckCircle2 />
              <strong>The queue is clear.</strong>
              <p>New assigned submissions and Questions will arrive here.</p>
            </div>
          )}
        </nav>
        <section className="faculty-record">
          {selected ? (
            <ReviewRecord
              item={selected}
              response={response}
              pending={pending}
              onResponse={setResponse}
              onAccept={() =>
                selected.kind === "submission" &&
                act(
                  "accept",
                  () =>
                    reviewSubmission({
                      submissionId: selected.id,
                      decision: "accepted",
                      feedback: response,
                    }),
                  "Submission accepted and Student progress updated.",
                )
              }
              onReturn={() =>
                selected.kind === "submission" &&
                act(
                  "return",
                  () =>
                    reviewSubmission({
                      submissionId: selected.id,
                      decision: "returned",
                      feedback: response,
                    }),
                  "Submission returned with feedback.",
                )
              }
              onAnswer={() =>
                selected.kind === "question" &&
                act(
                  "answer",
                  () =>
                    answerQuestion({
                      questionId: selected.id,
                      answer: response,
                    }),
                  "Official answer sent and Question closed.",
                )
              }
              onModerate={() =>
                selected.kind === "question" &&
                act(
                  "moderate",
                  () =>
                    moderateQuestion({
                      questionId: selected.id,
                      reason: response,
                    }),
                  "Question closed with an audited moderation reason.",
                )
              }
              onApproveCompletion={() =>
                selected.kind === "completion" &&
                act(
                  "completion",
                  () => approveCompletion({ requestId: selected.id }),
                  "Completion approved and Certificate issued.",
                )
              }
              onCompletionReview={(status) =>
                selected.kind === "completion" &&
                act(
                  status,
                  () =>
                    updateCompletionReview({
                      requestId: selected.id,
                      status,
                      reason: response,
                    }),
                  status === "correction_required"
                    ? "Correction requested from the Student."
                    : status === "under_review"
                      ? "Completion placed under review."
                      : "Certificate revoked with an audited reason.",
                )
              }
            />
          ) : (
            <div className="faculty-record-empty">
              <CheckCircle2 />
              <h2>Nothing needs review.</h2>
              <p>Your assigned learning current is clear.</p>
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
        </section>
        <aside className="faculty-bank">
          <h2>Assigned scope</h2>
          {queue.assignments.map((item) => (
            <div key={item.assignmentId}>
              <strong>{item.courseName}</strong>
              <p>
                {[
                  item.canGrade && "Grade",
                  item.canAnswerQuestions && "Answer Questions",
                  item.canApproveCompletion && "Approve Completion",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          ))}
          <h2>Review promise</h2>
          <p>
            Accept only when the evidence satisfies the activity. Return work
            with a clear next step. Student evidence is preserved in either
            path.
          </p>
        </aside>
      </div>
      <section className="faculty-feedback-reports">
        <div>
          <h2>Learning feedback</h2>
          <p>
            Anonymous reports open only when their promised group size is met.
            Batch-only Faculty never receive course-wide anonymous responses.
          </p>
        </div>
        {feedbackReports?.length ? (
          <div className="faculty-feedback-list">
            {feedbackReports.map((report) => (
              <article key={report.activityId}>
                <div>
                  <strong>{report.activityTitle}</strong>
                  <span>
                    {report.courseName} · {report.mode}
                  </span>
                </div>
                {report.released ? (
                  <p>
                    <strong>{report.averageRating?.toFixed(1) ?? "—"}</strong>
                    <span>
                      / 5 from {report.responseCount} response
                      {report.responseCount === 1 ? "" : "s"}
                    </span>
                  </p>
                ) : (
                  <p className="held">
                    <ShieldCheck />
                    Sealed until {report.minimumGroupSize} responses
                  </p>
                )}
                {report.comments.slice(0, 3).map((comment, index) => (
                  <blockquote key={`${index}-${comment}`}>{comment}</blockquote>
                ))}
              </article>
            ))}
          </div>
        ) : (
          <p className="faculty-feedback-empty">
            No released Feedback reports are available yet.
          </p>
        )}
      </section>
    </div>
  );
}

function ReviewRecord({
  item,
  response,
  pending,
  onResponse,
  onAccept,
  onReturn,
  onAnswer,
  onModerate,
  onApproveCompletion,
  onCompletionReview,
}: {
  item: FacultyQueueItem;
  response: string;
  pending?: string;
  onResponse: (value: string) => void;
  onAccept: () => void;
  onReturn: () => void;
  onAnswer: () => void;
  onModerate: () => void;
  onApproveCompletion: () => void;
  onCompletionReview: (
    status: "correction_required" | "under_review" | "revoked",
  ) => void;
}) {
  return (
    <article>
      <div className="faculty-meta">
        <span>
          {item.kind === "submission"
            ? "Assignment submission"
            : item.kind === "question"
              ? `${item.visibility} Question`
              : "Completion evidence"}
        </span>
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
      <h2>{item.title}</h2>
      <p className="faculty-student">
        {item.studentName} · {item.courseName}
        {item.kind === "submission" ? ` · Attempt ${item.attemptNumber}` : ""}
      </p>
      <blockquote>{item.body}</blockquote>
      {item.kind !== "completion" ? (
        <>
          <label htmlFor="faculty-response">
            {item.kind === "submission"
              ? "Faculty feedback"
              : "Official answer"}
          </label>
          <Textarea
            id="faculty-response"
            value={response}
            onChange={(event) => onResponse(event.target.value)}
            placeholder={
              item.kind === "submission"
                ? "Name what is working and the clearest next step…"
                : "Write the answer the Student can rely on…"
            }
          />
        </>
      ) : (
        <>
          <label htmlFor="faculty-response">Review reason</label>
          <Textarea
            id="faculty-response"
            value={response}
            onChange={(event) => onResponse(event.target.value)}
            placeholder="Explain a correction or why this record needs further review…"
            maxLength={500}
          />
        </>
      )}
      {item.kind === "submission" ? (
        <div className="faculty-actions">
          <Button
            variant="outline"
            className="lms-live-outline"
            disabled={response.trim().length < 10 || Boolean(pending)}
            onClick={onReturn}
          >
            <RotateCcw />
            {pending === "return" ? "Returning…" : "Return with feedback"}
          </Button>
          <Button
            className="lms-live-primary"
            disabled={Boolean(pending)}
            onClick={onAccept}
          >
            <CheckCircle2 />
            {pending === "accept" ? "Saving…" : "Accept submission"}
          </Button>
        </div>
      ) : item.kind === "question" ? (
        <div className="faculty-actions">
          <Button
            variant="outline"
            className="lms-live-outline"
            disabled={response.trim().length < 10 || Boolean(pending)}
            onClick={onModerate}
          >
            <ShieldCheck />
            {pending === "moderate" ? "Closing…" : "Close with reason"}
          </Button>
          <Button
            className="lms-live-primary"
            disabled={!response.trim() || Boolean(pending)}
            onClick={onAnswer}
          >
            <Send />
            {pending === "answer" ? "Sending…" : "Send official answer"}
          </Button>
        </div>
      ) : (
        <div className="faculty-completion-actions">
          <div className="faculty-actions">
            <Button
              variant="outline"
              className="lms-live-outline"
              disabled={response.trim().length < 10 || Boolean(pending)}
              onClick={() => onCompletionReview("correction_required")}
            >
              <RotateCcw /> Request correction
            </Button>
            <Button
              variant="outline"
              className="lms-live-outline"
              disabled={response.trim().length < 10 || Boolean(pending)}
              onClick={() => onCompletionReview("under_review")}
            >
              <ShieldCheck /> Hold for review
            </Button>
          </div>
          <Button
            className="lms-live-primary"
            disabled={Boolean(pending)}
            onClick={onApproveCompletion}
          >
            <GraduationCap />
            {pending === "completion"
              ? "Issuing Certificate…"
              : "Approve Completion and issue Certificate"}
          </Button>
        </div>
      )}
    </article>
  );
}
