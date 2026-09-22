import Link from "next/link";
import PaymentApprovals from "@/components/admin/PaymentApprovals";

export const metadata = {
  title: "Payment approvals - MindPoint Admin",
};

export default function AdminPaymentApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/enrollments"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to enrollments
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Payment approvals
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Screenshot/UPI checkouts wait here until you verify the payment.
          Approving unlocks the learner&apos;s course access; rejecting cancels
          the enrollment.
        </p>
      </div>
      <PaymentApprovals />
    </div>
  );
}
