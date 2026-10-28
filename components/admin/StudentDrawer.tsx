"use client";

import { useQuery } from "convex/react";

import { api } from "@/lib/backend/api";
import { Badge } from "@/components/ui/badge";
import { hasLifetimeRecordings } from "@/lib/recording-entitlement";
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
                <li>
                  {new Date(detail._creationTime).toLocaleDateString("en-IN")} ·
                  enrolled on {detail.course?.name ?? "this course"}
                </li>
                {detail.transferredAt ? (
                  <li>
                    {new Date(detail.transferredAt).toLocaleDateString("en-IN")} ·
                    transferred from {detail.batchLabel ?? "a previous batch"}
                  </li>
                ) : null}
                {detail.cancelledAt ? (
                  <li>
                    {new Date(detail.cancelledAt).toLocaleDateString("en-IN")} ·
                    cancelled
                    {detail.statusReason ? ` — ${detail.statusReason}` : ""}
                  </li>
                ) : null}
                {detail.lastConfirmationSentAt ? (
                  <li>
                    {new Date(detail.lastConfirmationSentAt).toLocaleDateString(
                      "en-IN",
                    )}{" "}
                    · confirmation email sent
                  </li>
                ) : null}
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

            <section className="border-border border-t pt-4">
              <h3 className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
                Actions
              </h3>
              <p className="text-muted-foreground mt-2">
                Moving a student between batches and uploading certificates are
                the next phases; nothing here changes records yet.
              </p>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
