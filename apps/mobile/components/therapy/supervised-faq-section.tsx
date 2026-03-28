import { FAQSection } from "@/components/course/faq-section";

const SUPERVISED_FAQ = [
  {
    question: "What is supervised practice?",
    answer:
      "Supervised practice provides guidance from experienced professionals as you develop your clinical skills. You'll work through real scenarios with expert feedback and support.",
  },
  {
    question: "Who are the supervisors?",
    answer:
      "Our supervisors are licensed clinical psychologists and therapists with years of experience in their respective specializations. They are committed to helping you grow professionally.",
  },
  {
    question: "How are supervision sessions conducted?",
    answer:
      "Sessions are conducted online via secure video calls. You'll discuss cases, receive feedback on your approach, and develop your clinical reasoning skills.",
  },
  {
    question: "Can I use supervised hours for my licensure requirements?",
    answer:
      "Our supervised practice hours may count toward licensure requirements depending on your jurisdiction. Please check with your local licensing board for specific requirements.",
  },
];

export function SupervisedFAQSection() {
  return (
    <FAQSection
      title="Supervised Practice FAQ"
      items={SUPERVISED_FAQ}
    />
  );
}
