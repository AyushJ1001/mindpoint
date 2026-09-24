import type { Metadata } from "next";
import { CheckoutConfirmation } from "@/components/checkout/CheckoutConfirmation";

export const metadata: Metadata = {
  title: "Enrollment handoff preview | The Mind Point",
  robots: { index: false, follow: false },
};

export default function CheckoutConfirmationPreviewPage() {
  return (
    <CheckoutConfirmation
      email="learner@example.com"
      enrollments={[
        {
          courseName: "Foundations of Emotional Wellbeing",
          courseType: "certificate",
          enrollmentNumber: "TMP-CERT-260916",
        },
        {
          courseName: "The Calm Practice Library",
          courseType: "pre-recorded",
          enrollmentNumber: "TMP-CALM-260916",
          isBogoFree: true,
        },
      ]}
    />
  );
}
