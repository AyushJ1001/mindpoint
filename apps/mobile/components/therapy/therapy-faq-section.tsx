import { FAQSection } from "@/components/course/faq-section";

const THERAPY_FAQ = [
  {
    question: "How does online therapy work?",
    answer:
      "Our online therapy sessions are conducted via secure video calls. You'll be matched with a licensed therapist who specializes in your areas of concern. Sessions are typically 50 minutes long.",
  },
  {
    question: "Is online therapy as effective as in-person therapy?",
    answer:
      "Research shows that online therapy can be just as effective as in-person therapy for many conditions. Our therapists use evidence-based approaches adapted for the online format.",
  },
  {
    question: "How do I choose the right plan?",
    answer:
      "We recommend starting with a smaller session package to find the right fit. You can always upgrade to a larger package later. Our team can help you decide based on your goals.",
  },
  {
    question: "What if I need to cancel a session?",
    answer:
      "You can reschedule or cancel a session up to 24 hours before the scheduled time. Late cancellations may count as a used session depending on the circumstances.",
  },
  {
    question: "Is my information confidential?",
    answer:
      "Absolutely. All sessions are confidential and conducted on a HIPAA-compliant platform. Your personal information and session content are protected.",
  },
];

export function TherapyFAQSection() {
  return (
    <FAQSection
      title="Therapy FAQ"
      items={THERAPY_FAQ}
    />
  );
}
