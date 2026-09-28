// Homepage FAQ. Kept in a plain module so the visible list and the FAQPage
// structured data stay in step.

export interface HomeFaqItem {
  q: string;
  a: string;
}

export const HOME_FAQ: HomeFaqItem[] = [
  {
    q: "Is this a recognised degree?",
    a: "No. Our certificates document completion of a training programme — they are not a degree, licence or accreditation. We say so plainly, and we verify every certificate publicly.",
  },
  {
    q: "Do I need a psychology background?",
    a: "Not always. Some programs assume no prior training; others are built for students and practitioners. Each program page states who it's for.",
  },
  {
    q: "How do the live classes work?",
    a: "Cohorts are small and run live every week. If you miss one, the recording is available to your cohort for the access window.",
  },
  {
    q: "What if I'm not sure where to start?",
    a: "Start with one calm conversation. It's a single session with a licensed professional — a low-pressure way to get oriented.",
  },
];
