// The free masterclass is the top of the funnel: a single session, given away
// for an email (and optionally a WhatsApp number), with no card and no
// pressure. The recording does not exist yet, so until
// NEXT_PUBLIC_MASTERCLASS_VIDEO_URL is set the page is a "notify me when it's
// released" sign-up. Setting the URL shows the player and switches the copy.

export const MASTERCLASS_VIDEO_URL =
  process.env.NEXT_PUBLIC_MASTERCLASS_VIDEO_URL ?? "";

export const MASTERCLASS_RELEASED = Boolean(MASTERCLASS_VIDEO_URL);

export const MASTERCLASS = {
  eyebrow: "Free masterclass",
  title: MASTERCLASS_RELEASED
    ? "See how The Mind Point teaches — free."
    : "A free masterclass is on the way.",
  supporting: MASTERCLASS_RELEASED
    ? "One recorded session. No card, no pressure."
    : "The session, faculty and registration details are being finalised.",
  description: MASTERCLASS_RELEASED
    ? "A single recorded class that shows how we actually work: structured teaching, real examples and a clear sense of what a full programme feels like. Watch it, then decide if the pace and the approach suit you."
    : "We're preparing a single free class that shows how we actually work: structured teaching, real examples and a clear sense of what a full programme feels like. It isn't scheduled yet; this page will open for registration once the session and faculty are confirmed.",
  takeaways: [
    "How a typical session is structured, start to finish",
    "The core idea behind our cognitive behavioural teaching",
    "What changes when you learn live with faculty",
  ],
  faq: [
    {
      q: "Is the masterclass really free?",
      a: MASTERCLASS_RELEASED
        ? "Yes. You give us an email and you can watch it. No card, no hidden step."
        : "Yes. It isn't scheduled yet. This page will open for registration once the session is confirmed; no card and no hidden step.",
    },
    {
      q: "Do I need a psychology background?",
      a: "No. The masterclass assumes no prior study, and the ₹999 intro courses are built as entry points for people who are new to the subject.",
    },
    {
      q: "What else is open right now?",
      a: "Registration is open for three live certificate courses starting in January 2027 (₹4,500 each, eight weeks: six of structured learning, two of practical training) and the Counselling Psychology Internship (₹2,499, from 18 January 2027). Four ₹999 self-paced intro courses are also available, and their fee is credited toward a certificate course. You can unsubscribe from our emails any time.",
    },
    {
      q: "Is this a degree or a licence?",
      a: "No. The Mind Point certificates document completion of a training programme. They are not a degree, licence or accreditation, and we say so plainly.",
    },
  ],
} as const;
