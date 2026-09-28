// The free masterclass is the top of the funnel: a real recorded session,
// given away for an email (and optionally a WhatsApp number), with no card and
// no pressure. Set NEXT_PUBLIC_MASTERCLASS_VIDEO_URL to a Drive or direct video
// URL to show the player; the page still works as a lead capture without it.

export const MASTERCLASS_VIDEO_URL =
  process.env.NEXT_PUBLIC_MASTERCLASS_VIDEO_URL ?? "";

export const MASTERCLASS = {
  eyebrow: "Free masterclass",
  title: "See how The Mind Point teaches — free.",
  supporting: "One recorded session. No card, no pressure.",
  description:
    "A single recorded class that shows how we actually work: structured teaching, real examples and a clear sense of what the full programme feels like. Watch it, then decide if the pace and the approach suit you.",
  takeaways: [
    "How a typical session is structured, start to finish",
    "The core idea behind our cognitive behavioural teaching",
    "What changes when you learn in a live, small cohort",
    "How the certificate and self-paced routes fit together",
  ],
  faq: [
    {
      q: "Is the masterclass really free?",
      a: "Yes. You give us an email, we send you the session. No card, no hidden step.",
    },
    {
      q: "Do I need a psychology background?",
      a: "No. The masterclass assumes no prior study, and the intro courses are built as entry points for people who are new to the subject.",
    },
    {
      q: "What happens after I watch it?",
      a: "You will get one follow-up email with the next steps — the ₹999 self-paced intros and the live January 2027 cohorts. You can unsubscribe any time.",
    },
    {
      q: "Is this a degree or a licence?",
      a: "No. The Mind Point certificates document completion of a training programme. They are not a degree, licence or accreditation, and we say so plainly.",
    },
  ],
} as const;
