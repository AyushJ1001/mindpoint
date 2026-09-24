"use client";

import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentApprovals() {
  const pending = useQuery(
    api.adminEnrollments.listPendingPaymentVerifications,
    {},
  );
  const approve = useMutation(api.adminEnrollments.approveEnrollmentPayment);
  const reject = useMutation(api.adminEnrollments.rejectEnrollmentPayment);

  async function handle(
    enrollmentId: Id<"enrollments">,
    action: "approve" | "reject",
  ) {
    try {
      if (action === "approve") {
        await approve({ enrollmentId });
        toast.success("Payment approved — learner now has access");
      } else {
        const note = window.prompt(
          "Reason for rejecting (optional, sent to the record):",
        );
        await reject({ enrollmentId, note: note ?? undefined });
        toast.success("Payment rejected and enrollment cancelled");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update enrollment",
      );
    }
  }

  if (pending === undefined) {
    return <p className="text-sm text-slate-500">Loading pending payments…</p>;
  }

  if (pending.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-slate-500">
          No payments are awaiting verification.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((enrollment) => (
        <Card key={enrollment._id}>
          <CardHeader>
            <CardTitle className="text-base">
              {enrollment.courseName ?? "Course"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1 text-sm">
              <p className="font-medium text-slate-900">
                {enrollment.userName ?? "—"}
              </p>
              <p className="text-slate-500">{enrollment.userEmail ?? ""}</p>
              <p className="text-slate-500">
                Paid ₹{enrollment.amountPaid ?? 0} ·{" "}
                {enrollment.enrollmentNumber ?? "no number"}
              </p>
              {enrollment.paymentScreenshotUrl && (
                <a
                  href={enrollment.paymentScreenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-block text-xs underline"
                >
                  View payment screenshot
                </a>
              )}
            </div>

            {enrollment.paymentScreenshotUrl && (
              <div className="border-border relative h-32 w-24 overflow-hidden rounded border">
                <Image
                  src={enrollment.paymentScreenshotUrl}
                  alt="Payment screenshot"
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => handle(enrollment._id, "approve")}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handle(enrollment._id, "reject")}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
