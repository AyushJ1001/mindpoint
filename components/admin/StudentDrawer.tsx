"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/lib/backend/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { hasLifetimeRecordings } from "@/lib/recording-entitlement";
import { assertConvexSuccess } from "@/lib/convex-error";
import type { Id } from "@/lib/backend/data-model";

/**
 * Student detail panel. Reads the existing admin enrollment query — no new
 * storage, no duplicated records. Every line is either a stored field or is
 * omitted; nothing is inferred to fill a gap.
 */
export function StudentDrawer({
  enrollmentId,
  certificateName,
  onClose,
}: {
  enrollmentId: Id<"enrollments">;
  certificateName?: string;
  onClose: () => void;
}) {
  const detail = useQuery(api.adminEnrollments.getEnrollmentDetail, {
    enrollmentId,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Student enrollment detail"
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      onClick={onClose}
    >
      <aside
        className="bg-background h-full w-full max-w-xl overflow-y-auto p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl">
            {detail?.userName ?? "Student"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="border-border rounded border px-3 py-1 text-sm"
          >
            Close
          </button>
        </div>

        {detail === undefined ? (
          <p className="text-muted-foreground mt-6 text-sm">Loading…</p>
        ) : detail === null ? (
          <p className="text-muted-foreground mt-6 text-sm">
            That enrollment could not be found.
          </p>
        ) : (
          <div className="mt-6 space-y-6 text-sm">
            <section>
              <h3 className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
                Contact
              </h3>
              <p className="mt-2">{detail.userEmail ?? "No email on record"}</p>
              <p>{detail.userPhone ?? "No phone on record"}</p>
            </section>

            <section>
              <h3 className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
                This enrollment
              </h3>
              <dl className="mt-2 grid grid-cols-2 gap-y-1">
                <dt className="text-muted-foreground">Course</dt>
                <dd>{detail.course?.name ?? "—"}</dd>
                <dt className="text-muted-foreground">Enrollment no.</dt>
                <dd>{detail.enrollmentNumber}</dd>
                <dt className="text-muted-foreground">Registered</dt>
                <dd>
                  {new Date(detail._creationTime).toLocaleDateString("en-IN")}
                </dd>
                <dt className="text-muted-foreground">Batch</dt>
                <dd>{detail.batchLabel ?? "No batch assigned"}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant="outline">{detail.status}</Badge>
                </dd>
                <dt className="text-muted-foreground">Amount paid</dt>
                <dd>
                  {typeof detail.amountPaid === "number"
                    ? `₹${detail.amountPaid.toLocaleString("en-IN")}`
                    : "Not recorded"}
                </dd>
                <dt className="text-muted-foreground">Payment</dt>
                <dd>{detail.paymentVerification ?? "verified or none required"}</dd>
                <dt className="text-muted-foreground">Recordings</dt>
                <dd>{hasLifetimeRecordings(detail) ? "Lifetime" : "—"}</dd>
                <dt className="text-muted-foreground">Certificate</dt>
                <dd>{certificateName ?? "Not issued"}</dd>
                {detail.couponCode ? (
                  <>
                    <dt className="text-muted-foreground">Coupon</dt>
                    <dd>{detail.couponCode}</dd>
                  </>
                ) : null}
                {detail.redemptionDiscountAmount ? (
                  <>
                    <dt className="text-muted-foreground">Discount</dt>
                    <dd>
                      ₹{detail.redemptionDiscountAmount.toLocaleString("en-IN")}
                    </dd>
                  </>
                ) : null}
              </dl>
            </section>

            <section>
              <h3 className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
                History
              </h3>
              <ul className="mt-2 space-y-2">
                {[
                  {
                    at: detail._creationTime,
                    text: `enrolled on ${detail.course?.name ?? "this course"}`,
                  },
                  detail.transferredAt
                    ? {
                        at: detail.transferredAt,
                        text: "a batch or course transfer was recorded on this enrollment (the destination is not stored on this row)",
                      }
                    : null,
                  detail.cancelledAt
                    ? {
                        at: detail.cancelledAt,
                        text: `cancelled${detail.statusReason ? ` — ${detail.statusReason}` : ""}`,
                      }
                    : null,
                  detail.lastConfirmationSentAt
                    ? {
                        at: detail.lastConfirmationSentAt,
                        text: "confirmation email sent",
                      }
                    : null,
                ]
                  .filter((event): event is { at: number; text: string } => Boolean(event))
                  .sort((a, b) => a.at - b.at)
                  .map((event) => (
                    <li key={`${event.at}-${event.text}`}>
                      {new Date(event.at).toLocaleDateString("en-IN")} · {event.text}
                    </li>
                  ))}
              </ul>
              <p className="text-muted-foreground mt-2 text-xs">
                Only recorded events are listed. Older changes that were never
                logged are not reconstructed.
              </p>
            </section>

            <section>
              <h3 className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
                Other enrollments
              </h3>
              {detail.relatedEnrollments.length <= 1 ? (
                <p className="text-muted-foreground mt-2">
                  No other enrollments on this account.
                </p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {detail.relatedEnrollments
                    .filter((row) => row._id !== detail._id)
                    .map((row) => (
                      <li key={row._id} className="flex justify-between gap-3">
                        <span>{row.courseName ?? "Course"}</span>
                        <span className="text-muted-foreground">
                          {row.status} · {row.batchLabel ?? "no batch"}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </section>

            <TransferSection detail={detail} />
          </div>
        )}
      </aside>
    </div>
  );
}

function TransferSection({
  detail,
}: {
  detail: {
    _id: Id<"enrollments">;
    courseId: Id<"courses">;
    batchId?: Id<"courseBatches">;
    batchLabel?: string;
    status: string;
    userName?: string;
  };
}) {
  const batches = useQuery(api.adminCourses.listCourseBatches, {
    courseId: detail.courseId,
  });
  const changeBatch = useMutation(api.adminEnrollments.changeEnrollmentBatch);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (detail.status !== "active") {
    return (
      <section className="border-border border-t pt-4">
        <h3 className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
          Actions
        </h3>
        <p className="text-muted-foreground mt-2">
          This enrollment is {detail.status}; batches cannot be changed.
        </p>
      </section>
    );
  }

  const destinations = (batches ?? [])
    .filter(
      (batch) =>
        String(batch._id) !== String(detail.batchId ?? "") &&
        (batch.lifecycleStatus ?? "published") === "published",
    )
    .sort((a, b) => (a.startDate < b.startDate ? -1 : 1));

  const chosen = destinations.find((batch) => String(batch._id) === target);

  return (
    <section className="border-border border-t pt-4">
      <h3 className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
        Actions
      </h3>
      {!open ? (
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => setOpen(true)}
        >
          Move to another batch
        </Button>
      ) : (
        <div className="mt-3 space-y-3 text-sm">
          <p>
            Current batch: <b>{detail.batchLabel ?? "none assigned"}</b>
          </p>
          <label className="block">
            <span className="text-muted-foreground text-xs uppercase">
              Destination batch
            </span>
            <select
              className="mt-1 h-10 w-full rounded-md border bg-white px-3"
              value={target}
              onChange={(event) => {
                setTarget(event.target.value);
                setReviewing(false);
                setMessage(null);
              }}
            >
              <option value="">Choose a batch…</option>
              {destinations.map((batch) => (
                <option key={batch._id} value={String(batch._id)}>
                  {batch.label} · starts {batch.startDate} · {batch.startTime}–
                  {batch.endTime}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-muted-foreground text-xs uppercase">
              Reason (required)
            </span>
            <Input
              className="mt-1"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Student requested the later cohort"
            />
          </label>

          {reviewing && chosen ? (
            <div className="border-border rounded border p-3">
              <p>
                Move <b>{detail.userName ?? "this student"}</b> from{" "}
                <b>{detail.batchLabel ?? "no batch"}</b> to{" "}
                <b>{chosen.label}</b>.
              </p>
              <p className="text-muted-foreground mt-1">
                Reason: {reason}. The original enrollment, payment and
                certificates stay as they are.
              </p>
            </div>
          ) : null}

          {message ? (
            <p className="text-rose-700 text-sm">{message}</p>
          ) : null}

          <div className="flex gap-2">
            {!reviewing ? (
              <Button
                size="sm"
                disabled={!chosen || !reason.trim()}
                onClick={() => setReviewing(true)}
              >
                Review transfer
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={busy}
                onClick={async () => {
                  if (!chosen) return;
                  setBusy(true);
                  setMessage(null);
                  try {
                    // The mutation returns a tagged failure (full batch, stale
                    // batch, empty reason) rather than throwing, so the result
                    // has to be checked or a refusal would look like success.
                    assertConvexSuccess(
                      await changeBatch({
                        enrollmentId: detail._id,
                        batchId: chosen._id,
                        reason: reason.trim(),
                        expectedBatchId: detail.batchId ?? null,
                      }),
                      "Transfer failed",
                    );
                    setMessage("Batch updated.");
                    setOpen(false);
                    setReviewing(false);
                    setReason("");
                    setTarget("");
                  } catch (error) {
                    setMessage(
                      error instanceof Error ? error.message : "Transfer failed",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Moving…" : "Confirm transfer"}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setReviewing(false);
                setMessage(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
