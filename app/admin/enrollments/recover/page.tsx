"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { showRupees } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

type RecoveryCourseLine = {
  id: string;
  courseId: string;
  batchId: string;
  listedPrice: string;
  checkoutPrice: string;
  amountPaid: string;
};

function parseMoney(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

export default function RecoverPaidOrderPage() {
  const courses = useQuery(api.adminCourses.listCourses, { limit: 500 });
  const recoverPaidOrder = useMutation(api.adminEnrollments.recoverPaidOrder);

  const [recoveryReason, setRecoveryReason] = useState("");
  const [razorpayOrderId, setRazorpayOrderId] = useState("");
  const [razorpayPaymentId, setRazorpayPaymentId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [buyerUserId, setBuyerUserId] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [referrerClerkUserId, setReferrerClerkUserId] = useState("");
  const [backfillBuyerMindPoints, setBackfillBuyerMindPoints] = useState(true);
  const [backfillReferralReward, setBackfillReferralReward] = useState(true);
  const [overrideAvailability, setOverrideAvailability] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [lines, setLines] = useState<RecoveryCourseLine[]>([
    {
      id: crypto.randomUUID(),
      courseId: "",
      batchId: "",
      listedPrice: "",
      checkoutPrice: "",
      amountPaid: "",
    },
  ]);

  const coursesById = useMemo(
    () =>
      new Map((courses ?? []).map((course) => [String(course._id), course])),
    [courses],
  );
  const allocatedAmount = lines.reduce(
    (total, line) => total + parseMoney(line.amountPaid),
    0,
  );
  const paymentAmount = parseMoney(amountPaid);
  const canSubmit =
    recoveryReason.trim() &&
    razorpayOrderId.trim() &&
    razorpayPaymentId.trim() &&
    buyerUserId.trim() &&
    buyerEmail.trim() &&
    lines.every((line) => line.courseId && parseMoney(line.amountPaid) > 0) &&
    (!overrideAvailability || overrideReason.trim());

  const updateLine = (
    lineId: string,
    patch: Partial<Omit<RecoveryCourseLine, "id">>,
  ) => {
    setLines((current) =>
      current.map((line) =>
        line.id === lineId ? { ...line, ...patch } : line,
      ),
    );
  };

  const addLine = () => {
    setLines((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        courseId: "",
        batchId: "",
        listedPrice: "",
        checkoutPrice: "",
        amountPaid: "",
      },
    ]);
  };

  const removeLine = (lineId: string) => {
    setLines((current) =>
      current.length === 1
        ? current
        : current.filter((line) => line.id !== lineId),
    );
  };

  const handleRecover = async () => {
    if (!canSubmit || isRecovering) {
      return;
    }

    setIsRecovering(true);
    try {
      const result = await recoverPaidOrder({
        recoveryReason: recoveryReason.trim(),
        razorpayOrderId: razorpayOrderId.trim(),
        razorpayPaymentId: razorpayPaymentId.trim(),
        amountPaid: paymentAmount,
        buyerUserId: buyerUserId.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerName: buyerName.trim() || undefined,
        buyerPhone: buyerPhone.trim() || undefined,
        referrerClerkUserId: referrerClerkUserId.trim() || undefined,
        backfillBuyerMindPoints,
        backfillReferralReward,
        overrideAvailability,
        overrideReason: overrideReason.trim() || undefined,
        courses: lines.map((line) => ({
          courseId: line.courseId as Id<"courses">,
          batchId: line.batchId.trim()
            ? (line.batchId.trim() as Id<"courseBatches">)
            : undefined,
          listedPrice: parseMoney(line.listedPrice),
          checkoutPrice: parseMoney(line.checkoutPrice),
          amountPaid: parseMoney(line.amountPaid),
        })),
      });

      toast.success("Paid order recovered", {
        description: `${result.enrollmentIds.length} enrollment${result.enrollmentIds.length === 1 ? "" : "s"} created.`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to recover paid order",
      );
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Recover Paid Order"
        description="Create enrollments and loyalty backfill for a captured Razorpay payment that did not finalize through checkout."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/enrollments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to enrollments
            </Link>
          </Button>
        }
      />

      <div className="space-y-5">
        <section className="rounded-lg border bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Step 1: Payment lookup
            </h2>
            {razorpayPaymentId ? (
              <Badge variant="outline">Duplicate checked on submit</Badge>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="space-y-1 text-sm">
              <span>Razorpay order ID</span>
              <Input
                value={razorpayOrderId}
                onChange={(event) => setRazorpayOrderId(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Razorpay payment ID</span>
              <Input
                value={razorpayPaymentId}
                onChange={(event) => setRazorpayPaymentId(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Amount paid</span>
              <Input
                type="number"
                min="0"
                value={amountPaid}
                onChange={(event) => setAmountPaid(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Recovery reason</span>
              <Input
                value={recoveryReason}
                onChange={(event) => setRecoveryReason(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Step 2: Buyer and referrer
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span>Buyer Clerk ID or guest email</span>
              <Input
                value={buyerUserId}
                onChange={(event) => {
                  setBuyerUserId(event.target.value);
                  if (event.target.value.includes("@")) {
                    setBuyerEmail(event.target.value);
                  }
                }}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Buyer email</span>
              <Input
                value={buyerEmail}
                onChange={(event) => setBuyerEmail(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Referrer Clerk ID</span>
              <Input
                value={referrerClerkUserId}
                onChange={(event) => setReferrerClerkUserId(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Buyer name</span>
              <Input
                value={buyerName}
                onChange={(event) => setBuyerName(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Buyer phone</span>
              <Input
                value={buyerPhone}
                onChange={(event) => setBuyerPhone(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Step 3: Courses and pricing
            </h2>
            <Button variant="outline" size="sm" onClick={addLine}>
              <Plus className="mr-2 h-4 w-4" />
              Add course
            </Button>
          </div>
          <div className="space-y-3">
            {lines.map((line) => {
              const selectedCourse = coursesById.get(line.courseId);

              return (
                <div
                  key={line.id}
                  className="grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_repeat(3,minmax(0,1fr))_auto]"
                >
                  <label className="space-y-1 text-sm">
                    <span>Course</span>
                    <select
                      className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                      value={line.courseId}
                      onChange={(event) => {
                        const course = coursesById.get(event.target.value);
                        const price = String(Math.max(0, course?.price ?? 0));
                        updateLine(line.id, {
                          courseId: event.target.value,
                          listedPrice: price,
                          checkoutPrice: price,
                          amountPaid: price,
                        });
                      }}
                    >
                      <option value="">Select course</option>
                      {(courses ?? []).map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name} ({course.type})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Batch ID</span>
                    <Input
                      value={line.batchId}
                      onChange={(event) =>
                        updateLine(line.id, { batchId: event.target.value })
                      }
                      placeholder="optional"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Listed</span>
                    <Input
                      type="number"
                      min="0"
                      value={line.listedPrice}
                      onChange={(event) =>
                        updateLine(line.id, {
                          listedPrice: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Checkout</span>
                    <Input
                      type="number"
                      min="0"
                      value={line.checkoutPrice}
                      onChange={(event) =>
                        updateLine(line.id, {
                          checkoutPrice: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Paid</span>
                    <Input
                      type="number"
                      min="0"
                      value={line.amountPaid}
                      onChange={(event) =>
                        updateLine(line.id, { amountPaid: event.target.value })
                      }
                    />
                  </label>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      aria-label={`Remove ${selectedCourse?.name ?? "course"} line`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Step 4: Recovery actions
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={backfillBuyerMindPoints}
                onChange={(event) =>
                  setBackfillBuyerMindPoints(event.target.checked)
                }
              />
              Backfill buyer Mind Points
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={backfillReferralReward}
                onChange={(event) =>
                  setBackfillReferralReward(event.target.checked)
                }
              />
              Backfill referral reward
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={overrideAvailability}
                onChange={(event) =>
                  setOverrideAvailability(event.target.checked)
                }
              />
              Override full/past availability
            </label>
            <label className="space-y-1 text-sm">
              <span>Override reason</span>
              <Input
                value={overrideReason}
                onChange={(event) => setOverrideReason(event.target.value)}
                disabled={!overrideAvailability}
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Step 5: Review and confirm
          </h2>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <div>Payment ID: {razorpayPaymentId || "Not entered"}</div>
            <div>Buyer: {buyerEmail || buyerUserId || "Not entered"}</div>
            <div>Payment amount: {showRupees(paymentAmount)}</div>
            <div>Allocated amount: {showRupees(allocatedAmount)}</div>
            <div>
              Course rows: {lines.filter((line) => line.courseId).length}
            </div>
            <div>
              Referrer: {referrerClerkUserId.trim() || "No referrer backfill"}
            </div>
          </div>
          {paymentAmount !== allocatedAmount ? (
            <p className="mt-3 text-sm text-amber-700">
              Allocated amount does not match payment amount. You can still
              recover, but the audit log will preserve both values.
            </p>
          ) : null}
          <div className="mt-4">
            <Button
              onClick={handleRecover}
              disabled={!canSubmit || isRecovering}
            >
              {isRecovering
                ? "Recovering..."
                : "Create enrollments and backfill selected rewards"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
