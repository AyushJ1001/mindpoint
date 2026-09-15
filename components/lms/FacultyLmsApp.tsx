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
  const queue = useQuery(
    facultyLmsApi.listMyQueue,
    isAuthenticated ? {} : "skip",
  );
  const reviewSubmission = useMutation(facultyLmsApi.reviewSubmission);
  const answerQuestion = useMutation(facultyLmsApi.answerQuestion);
  const approveCompletion = useMutation(facultyLmsApi.approveCompletion);
  const [selectedId, setSelectedId] = useState<string>();
  const [response, setResponse] = useState("");
  const [pending, setPending] = useState<string>();
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  }>();
  const selected =
    queue?.items.find((item) => item.id === selectedId) ?? queue?.items[0];

  if (isLoading || (isAuthenticated && queue === undefined))
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
  if (!queue?.assignments.length)
    return (
      <div className="lms-live-page faculty-gateway">
        <section className="lms-live-empty">
          <GraduationCap />
          <h1>No Faculty scope is assigned.</h1>
          <p>
            An Administrator must assign your Convex token identifier to a
            Course or batch before Student evidence can appear.
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
              onApproveCompletion={() =>
                selected.kind === "completion" &&
                act(
                  "completion",
                  () => approveCompletion({ requestId: selected.id }),
                  "Completion approved and Certificate issued.",
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
  onApproveCompletion,
}: {
  item: FacultyQueueItem;
  response: string;
  pending?: string;
  onResponse: (value: string) => void;
  onAccept: () => void;
  onReturn: () => void;
  onAnswer: () => void;
  onApproveCompletion: () => void;
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
      {item.kind !== "completion" && (
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
        <Button
          className="lms-live-primary"
          disabled={!response.trim() || Boolean(pending)}
          onClick={onAnswer}
        >
          <Send />
          {pending === "answer" ? "Sending…" : "Send official answer"}
        </Button>
      ) : (
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
      )}
    </article>
  );
}
