import type { LucideIcon } from "lucide-react";
import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  PlaySquare,
  Sparkles,
  HeartPulse,
  Telescope,
  FileText,
  BookOpen,
  Users,
  Heart,
  Shield,
  TrendingUp,
  Clock,
  Repeat,
  Video,
  Download,
  Star,
  Zap,
  Target,
  Edit,
  Eye,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Course Type Content (for CourseTypePage hero)
// ---------------------------------------------------------------------------

export interface CourseTypeInfo {
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
}

export const courseTypeContent: Record<string, CourseTypeInfo> = {
  certificate: {
    title: "Certificate Courses",
    tagline: "Start where you are. Leave with something real.",
    description:
      "Structured, expert-led certificate courses in psychology and mental health — built around practice, not passive lectures. Small cohorts, real exercises, and a credential you can put to work.",
    icon: Award,
  },
  diploma: {
    title: "Diploma Programs",
    tagline: "The deep end, with a hand on your back.",
    description:
      "For the learner ready to commit. Diploma programs move from theory into complex case work and applied practice — the kind of depth that changes how you work, and how you are seen.",
    icon: GraduationCap,
  },
  internship: {
    title: "Internship Programs",
    tagline: "Stop studying it. Start doing it.",
    description:
      "Structured internships with real case exposure, clear milestones, and a mentor who is genuinely invested. This is where what you know becomes what you can actually do.",
    icon: BriefcaseBusiness,
  },
  therapy: {
    title: "Therapy & Counselling",
    tagline: "You don't have to have it all figured out.",
    description:
      "Licensed therapists who meet you where you are — warm, evidence-based, and scheduled around your life. No diagnosis required. Just a space that is yours.",
    icon: HeartPulse,
  },
  supervised: {
    title: "Supervised Practice",
    tagline: "Honest feedback. A steadier clinical voice.",
    description:
      "Supervision for students and early-career therapists who want real feedback on real work. Your mentor walks beside you — reviewing, challenging, and building your confidence case by case.",
    icon: Telescope,
  },
  "pre-recorded": {
    title: "Pre-recorded Courses",
    tagline: "Meaningful learning that fits your life.",
    description:
      "Self-paced video modules you can start tonight and revisit whenever you need. Professionally produced, downloadable, and free of scheduling pressure.",
    icon: PlaySquare,
  },
  masterclass: {
    title: "Masterclasses",
    tagline: "One topic. Deep. Yours to ask about.",
    description:
      "Live, focused sessions led by practitioners who do this work daily. Bring the questions that have been sitting with you — leave with frameworks you can use the next morning.",
    icon: Sparkles,
  },
  "resume-studio": {
    title: "Resume Studio",
    tagline: "Your experience, finally legible.",
    description:
      "We shape a psychology-specific, ATS-friendly CV that shows employers who you actually are — with personal feedback and career positioning, not a fill-in-the-blank template.",
    icon: FileText,
  },
  worksheet: {
    title: "Worksheets & Resources",
    tagline: "Tools you can use in the very next session.",
    description:
      "Evidence-based, professionally designed worksheets for therapists and clients. Download, print, and put them to work immediately — no waiting, no theory tax.",
    icon: BookOpen,
  },
};

// ---------------------------------------------------------------------------
// WhoShouldDo Data Per Type
// ---------------------------------------------------------------------------

export interface WhoShouldDoItem {
  icon: string;
  title: string;
  description: string;
}

export interface WhoShouldDoData {
  title: string;
  description: string;
  items: WhoShouldDoItem[];
}

export const whoShouldDoByType: Record<string, WhoShouldDoData> = {
  certificate: {
    title: "Who is this for?",
    description:
      "Wherever you're starting from, there's a clear way in — and a guide for the climb.",
    items: [
      {
        icon: "\u{1F393}",
        title: "Psychology Students",
        description:
          "Add a practical credential to your degree — one that proves you can apply what you've studied.",
      },
      {
        icon: "\u{1F504}",
        title: "Career Changers",
        description:
          "Test the water before you leap. Build real skills and find out whether this work fits.",
      },
      {
        icon: "\u{1F4BC}",
        title: "Working Professionals",
        description:
          "Bring mental health literacy into your current role — and become the person people trust.",
      },
      {
        icon: "\u{1F331}",
        title: "Curious Learners",
        description:
          "Understand the mind with structure, depth, and a guide — not another scattered scroll.",
      },
    ],
  },
  diploma: {
    title: "Who is this for?",
    description:
      "Diploma programs are for learners who are ready to commit — and want it done properly.",
    items: [
      {
        icon: "\u{1F393}",
        title: "Aspiring Practitioners",
        description:
          "You're ready to invest in the long path toward clinical work, and you want solid ground beneath it.",
      },
      {
        icon: "\u{1F4DA}",
        title: "Psychology Graduates",
        description:
          "Close the gap between academic theory and the room where the real work happens.",
      },
      {
        icon: "\u{1F3E5}",
        title: "Healthcare Workers",
        description:
          "Add formal mental health training to your clinical background and widen what you can offer.",
      },
      {
        icon: "\u{1F3AF}",
        title: "Career Advancers",
        description:
          "Earn a qualification that signals depth — and opens doors a certificate alone won't.",
      },
    ],
  },
  internship: {
    title: "Who is this for?",
    description:
      "Internships are for learners ready to practise, not just study.",
    items: [
      {
        icon: "\u{1F393}",
        title: "Final-year Students",
        description:
          "You need supervised hours and real exposure to complete your training properly.",
      },
      {
        icon: "\u{1F331}",
        title: "Early-career Professionals",
        description:
          "Get hands-on case experience before you step into independent practice.",
      },
      {
        icon: "\u{1F504}",
        title: "Career Transitioners",
        description:
          "Build practical proof of experience to support your move into mental health.",
      },
      {
        icon: "\u{1F4A1}",
        title: "Skill Builders",
        description:
          "You learn by doing, and you want a mentor close enough to catch the details.",
      },
    ],
  },
  therapy: {
    title: "Who is therapy for?",
    description: "Therapy meets you wherever you are.",
    items: [
      {
        icon: "\u{1F33F}",
        title: "Anyone Seeking Support",
        description:
          "You don't need a diagnosis to deserve someone who listens properly.",
      },
      {
        icon: "\u{1F4AD}",
        title: "People Processing Change",
        description:
          "Transitions, grief, relationships, uncertainty — you want help carrying it.",
      },
      {
        icon: "\u{1F9E0}",
        title: "Those Managing Anxiety or Stress",
        description:
          "You want evidence-based tools to quiet the noise and feel steady again.",
      },
      {
        icon: "\u{2728}",
        title: "Growth-oriented Individuals",
        description:
          "You want to understand yourself — not just feel better for a week.",
      },
    ],
  },
  supervised: {
    title: "Who is supervision for?",
    description: "For practitioners building clinical confidence that lasts.",
    items: [
      {
        icon: "\u{1F393}",
        title: "Psychology Trainees",
        description:
          "You need supervised clinical hours — and you want them to actually count.",
      },
      {
        icon: "\u{1F331}",
        title: "Early-career Therapists",
        description:
          "You want a seasoned eye on your real cases, not a rubber stamp.",
      },
      {
        icon: "\u{1F504}",
        title: "Returning Practitioners",
        description:
          "Coming back after a break and wanting support to find your footing again.",
      },
      {
        icon: "\u{1F4AA}",
        title: "Skill Refiners",
        description:
          "Experienced, but you want fresh perspective and honest challenge on your approach.",
      },
    ],
  },
  "pre-recorded": {
    title: "Who is this for?",
    description: "Self-paced courses for learners who need learning to fit life.",
    items: [
      {
        icon: "\u{23F0}",
        title: "Busy Professionals",
        description:
          "You want to learn seriously, without rearranging your week around a timetable.",
      },
      {
        icon: "\u{1F501}",
        title: "Revisiting Learners",
        description:
          "You learn best when you can pause, rewind, and sit with a concept until it clicks.",
      },
      {
        icon: "\u{1F30D}",
        title: "Remote Learners",
        description:
          "Any time zone, any schedule — the material is there when you are.",
      },
      {
        icon: "\u{1F4D6}",
        title: "Self-directed Learners",
        description:
          "You like controlling the pace and order of your own study.",
      },
    ],
  },
  masterclass: {
    title: "Who is this for?",
    description: "Masterclasses suit learners who want depth on one topic.",
    items: [
      {
        icon: "\u{1F9E0}",
        title: "Practicing Therapists",
        description:
          "Fresh, specific perspectives on the approaches you use every day.",
      },
      {
        icon: "\u{1F393}",
        title: "Advanced Students",
        description:
          "Go beyond the syllabus into topics your coursework doesn't reach.",
      },
      {
        icon: "\u{1F4AC}",
        title: "Community Workers",
        description:
          "Mental health shows up in your work daily — get tools built for that reality.",
      },
      {
        icon: "\u{1F31F}",
        title: "Lifelong Learners",
        description:
          "You're drawn to one topic and want to understand it deeply, not skim it.",
      },
    ],
  },
  "resume-studio": {
    title: "Who is this for?",
    description: "For psychology professionals at every career stage.",
    items: [
      {
        icon: "\u{1F393}",
        title: "Fresh Graduates",
        description:
          "Turn your degree, placements, and projects into a CV that gets read.",
      },
      {
        icon: "\u{1F504}",
        title: "Career Switchers",
        description:
          "Translate your transferable skills into language mental health employers recognise.",
      },
      {
        icon: "\u{1F4C8}",
        title: "Mid-career Professionals",
        description:
          "Update your story so it reflects the practitioner you've become.",
      },
      {
        icon: "\u{1F3AF}",
        title: "Job Seekers",
        description:
          "You're applying and hearing nothing. Let's fix what happens before the interview.",
      },
    ],
  },
  worksheet: {
    title: "Who is this for?",
    description: "Worksheets for practitioners and anyone doing structured work.",
    items: [
      {
        icon: "\u{1F9D1}\u200D\u2695\uFE0F",
        title: "Therapists & Counsellors",
        description:
          "Add ready-made, evidence-based activities to your next session without prep time.",
      },
      {
        icon: "\u{1F4DA}",
        title: "Students in Training",
        description:
          "Practise with the same structured tools you'll use with clients.",
      },
      {
        icon: "\u{1F331}",
        title: "People Doing Inner Work",
        description:
          "Move from reading about growth to doing it, one structured exercise at a time.",
      },
      {
        icon: "\u{1F4CB}",
        title: "Workshop Facilitators",
        description:
          "Print and run activities that keep groups engaged and on track.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// WhyChoose Data Per Type
// ---------------------------------------------------------------------------

export interface WhyChooseItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface WhyChooseData {
  title: string;
  description: string;
  items: WhyChooseItem[];
}

export const whyChooseByType: Record<string, WhyChooseData> = {
  certificate: {
    title: "Why learn with us?",
    description: "What makes this experience different.",
    items: [
      {
        icon: BookOpen,
        title: "Practical, not just theoretical",
        description:
          "Every course includes exercises you apply in-session — so the learning lands in your hands, not just your notes.",
      },
      {
        icon: Users,
        title: "Small, attentive cohorts",
        description:
          "You're a person here, not a seat number. Our educators know your name and your goals.",
      },
      {
        icon: Heart,
        title: "Support that doesn't expire",
        description:
          "Doubt-clearing and community access continue after the course ends.",
      },
      {
        icon: Award,
        title: "Recognised certification",
        description:
          "A credential you can show employers and institutions with confidence.",
      },
    ],
  },
  diploma: {
    title: "Why choose a diploma?",
    description: "The advantages of a longer, deeper commitment.",
    items: [
      {
        icon: GraduationCap,
        title: "Advanced depth",
        description:
          "Move well past surface understanding into applied, clinical-level expertise.",
      },
      {
        icon: Award,
        title: "Professional standing",
        description:
          "A diploma signals serious commitment to employers and professional bodies.",
      },
      {
        icon: Target,
        title: "Career momentum",
        description:
          "Unlock roles that ask for more than a certificate-level qualification.",
      },
      {
        icon: Users,
        title: "A cohort that keeps going",
        description:
          "Build lasting relationships with people as dedicated as you are.",
      },
    ],
  },
  internship: {
    title: "Why intern with us?",
    description:
      "What makes this internship different from a textbook exercise.",
    items: [
      {
        icon: Eye,
        title: "Real case exposure",
        description:
          "Work with actual scenarios under structured guidance — not hypothetical worksheets.",
      },
      {
        icon: Shield,
        title: "Safe to make mistakes",
        description:
          "Your mentor is there to catch you, not judge you. That's how skill gets built.",
      },
      {
        icon: TrendingUp,
        title: "Progress you can see",
        description:
          "Feedback loops and clear milestones make your growth visible, week by week.",
      },
      {
        icon: Heart,
        title: "Mentorship that lasts",
        description:
          "The relationship with your supervisor continues long after the program ends.",
      },
    ],
  },
  therapy: {
    title: "Why therapy with us?",
    description: "What makes this space different.",
    items: [
      {
        icon: Shield,
        title: "Licensed professionals",
        description:
          "Every therapist is qualified, supervised, and genuinely invested in your wellbeing.",
      },
      {
        icon: Clock,
        title: "Scheduling that bends to you",
        description:
          "Sessions fit around your life — not the other way around.",
      },
      {
        icon: Heart,
        title: "Warm and evidence-based",
        description:
          "Real compassion, paired with proven approaches like CBT and positive psychology.",
      },
      {
        icon: Users,
        title: "Priced to be reachable",
        description:
          "Quality therapy shouldn't be a luxury. Our pricing reflects that belief.",
      },
    ],
  },
  supervised: {
    title: "Why supervision with us?",
    description: "What makes this mentorship different.",
    items: [
      {
        icon: Eye,
        title: "Guidance from working clinicians",
        description:
          "Learn from practitioners who are in clinical settings right now.",
      },
      {
        icon: Shield,
        title: "A safe place to be unsure",
        description:
          "Ask the questions you'd normally keep to yourself. That's the point.",
      },
      {
        icon: TrendingUp,
        title: "Feedback that sharpens you",
        description:
          "Structured, specific, and actionable — never vague encouragement.",
      },
      {
        icon: Users,
        title: "Peers who get it",
        description:
          "Connect with trainees navigating exactly the stage you're in.",
      },
    ],
  },
  "pre-recorded": {
    title: "Why choose self-paced?",
    description: "The benefits of learning on your own terms.",
    items: [
      {
        icon: Clock,
        title: "Complete flexibility",
        description: "Study at midnight or midday. No live schedule to work around.",
      },
      {
        icon: Repeat,
        title: "Rewatch without limits",
        description: "Revisit difficult concepts until they feel obvious.",
      },
      {
        icon: Video,
        title: "Professionally produced",
        description:
          "Clear audio, thoughtful visuals, and pacing designed for retention.",
      },
      {
        icon: Download,
        title: "Resources you keep",
        description:
          "Downloadable materials you'll still be using long after the course.",
      },
    ],
  },
  masterclass: {
    title: "Why attend a masterclass?",
    description: "What makes focused, intensive learning valuable.",
    items: [
      {
        icon: Star,
        title: "Taught by practitioners",
        description:
          "Not just academics — people who do this work every day in real rooms.",
      },
      {
        icon: Zap,
        title: "Depth without the drag",
        description: "More insight in less time, with nothing padded out.",
      },
      {
        icon: Users,
        title: "Live and interactive",
        description:
          "Your specific questions get answered, not glossed over.",
      },
      {
        icon: Target,
        title: "Usable the next morning",
        description:
          "Frameworks and language you can apply in your very next session.",
      },
    ],
  },
  "resume-studio": {
    title: "Why use Resume Studio?",
    description: "Because your CV is often the first impression you get.",
    items: [
      {
        icon: FileText,
        title: "Psychology-specific expertise",
        description:
          "We know what mental health employers and institutions actually look for.",
      },
      {
        icon: Target,
        title: "ATS-friendly formatting",
        description:
          "Structured so automated screens pass you through to a human.",
      },
      {
        icon: Edit,
        title: "Genuinely personal",
        description:
          "A CV shaped around your experience and goals — never a template.",
      },
      {
        icon: Users,
        title: "Career guidance included",
        description:
          "Positioning advice for the roles you want, not an upsell.",
      },
    ],
  },
  worksheet: {
    title: "Why use our worksheets?",
    description: "Because good tools should be ready when you need them.",
    items: [
      {
        icon: FileText,
        title: "Designed by practitioners",
        description:
          "Built by professionals who use these activities in real sessions.",
      },
      {
        icon: Shield,
        title: "Evidence-based",
        description:
          "Grounded in established clinical approaches, not generic self-help.",
      },
      {
        icon: Download,
        title: "Printable and immediate",
        description:
          "Download once, then use them in sessions or personal practice right away.",
      },
      {
        icon: Repeat,
        title: "Kept current",
        description:
          "Updated as practitioners tell us what works and what needs refining.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Per-type proof points (qualitative — no invented statistics)
// ---------------------------------------------------------------------------

export const courseTypeProof: Record<string, string[]> = {
  certificate: [
    "Expert-led, practice-first curriculum",
    "Small cohorts with named educators",
    "Verifiable certificate on completion",
  ],
  diploma: [
    "Advanced, applied clinical depth",
    "Personalised mentorship throughout",
    "A cohort of committed peers",
  ],
  internship: [
    "Real case exposure, not observation",
    "A mentor invested in your progress",
    "Clear milestones and feedback loops",
  ],
  therapy: [
    "Licensed, supervised therapists",
    "Evidence-based, warm approach",
    "Sessions that fit your schedule",
  ],
  supervised: [
    "Supervisors who work clinically today",
    "Specific, actionable feedback",
    "Support that continues after the program",
  ],
  "pre-recorded": [
    "Self-paced and professionally produced",
    "Rewatch and revisit anytime",
    "Downloadable resources you keep",
  ],
  masterclass: [
    "Live, interactive sessions",
    "Led by practising experts",
    "One topic, taught with depth",
  ],
  "resume-studio": [
    "Psychology-specific CV expertise",
    "ATS-friendly and personalised",
    "Career guidance included",
  ],
  worksheet: [
    "Evidence-based and professionally designed",
    "Ready to print and use",
    "Built for real sessions",
  ],
};

// ---------------------------------------------------------------------------
// Per-type FAQ (objection handling for the category landing page)
// ---------------------------------------------------------------------------

export interface CourseTypeFaq {
  question: string;
  answer: string;
}

export const courseTypeFaqs: Record<string, CourseTypeFaq[]> = {
  certificate: [
    {
      question: "Do I need a psychology background to start?",
      answer:
        "No. Certificate courses meet you where you are. If you're new to the field, you'll get the foundations. If you're studying or working, you'll go deeper. Your educator helps you pitch in at the right level.",
    },
    {
      question: "How much time will this take each week?",
      answer:
        "Most learners set aside a few hours a week. Sessions are scheduled and the exercises are built to fit around work or study, so you always know what's expected before you commit.",
    },
    {
      question: "Is the certificate recognised?",
      answer:
        "You'll finish with a verifiable certificate of completion from The Mind Point — with honest wording about what it is: a professional learning credential, not a degree or licence.",
    },
    {
      question: "What if it turns out not to be right for me?",
      answer:
        "Talk to us before you enrol. We'd rather help you choose the right course than take payment for the wrong one. See our refund policy for the details.",
    },
  ],
  diploma: [
    {
      question: "How is a diploma different from a certificate?",
      answer:
        "A diploma is longer, deeper, and more applied. You'll work through complex case studies and clinical-level material, and finish with a qualification that signals serious commitment.",
    },
    {
      question: "Can I do this alongside a job?",
      answer:
        "Yes. The program is built for working learners, with scheduled sessions and milestones that keep the workload predictable week to week.",
    },
    {
      question: "What support will I get?",
      answer:
        "Personalised mentorship throughout, a cohort of peers on the same path, and doubt-clearing support that continues after you finish.",
    },
    {
      question: "Will this qualify me to practise?",
      answer:
        "A diploma is a professional learning credential, not a licence to practise. We're clear about that, and we'll help you understand how it fits with your local requirements.",
    },
  ],
  internship: [
    {
      question: "Do I need prior experience?",
      answer:
        "No. Internships take you from theory into practice with structure and guidance, whatever your starting point.",
    },
    {
      question: "How are the hours structured?",
      answer:
        "You'll get clear tasks, real case exposure, and milestone check-ins. Your mentor reviews your work and gives feedback, so the hours translate into skill.",
    },
    {
      question: "Will I get documentation of completion?",
      answer:
        "Yes — you'll finish with documented completion you can reference in applications, plus real experience you can talk about with confidence.",
    },
    {
      question: "What if I make mistakes?",
      answer:
        "You will, and that's the design. An internship is a safe place to stretch, with a mentor there to catch you.",
    },
  ],
  therapy: [
    {
      question: "Do I need a diagnosis to book?",
      answer:
        "No. You don't need to have it all figured out or meet some threshold. If you'd like support, that's reason enough.",
    },
    {
      question: "How do I choose the right therapist?",
      answer:
        "Tell us what you're looking for and we'll match you. If the fit isn't right, you can switch — that matters more than anything else.",
    },
    {
      question: "How many sessions will I need?",
      answer:
        "You decide the pace. Some people come for a few focused sessions; others stay longer. There's no lock-in.",
    },
    {
      question: "Is it confidential?",
      answer:
        "Yes. Sessions are private and handled by licensed professionals bound by confidentiality, with the standard legal exceptions explained to you upfront.",
    },
  ],
  supervised: [
    {
      question: "Who is supervision for?",
      answer:
        "Psychology trainees who need supervised hours, early-career therapists who want feedback on real cases, and returning practitioners rebuilding confidence.",
    },
    {
      question: "How does the supervision actually work?",
      answer:
        "You bring real work; your supervisor reviews it with you and gives specific, actionable feedback. It's structured, honest, and supportive.",
    },
    {
      question: "Will this count toward my requirements?",
      answer:
        "Supervision is designed to support licensure and training requirements. Tell us what you need documented and we'll be transparent about what we can provide.",
    },
    {
      question: "Can I choose my supervisor?",
      answer:
        "We'll match you with a working clinician suited to your goals. If the fit isn't right, we'll help you change.",
    },
  ],
  "pre-recorded": [
    {
      question: "How long do I have access?",
      answer:
        "Your access window is stated clearly on each course before you buy, so there are no surprises later.",
    },
    {
      question: "Can I learn on my phone?",
      answer:
        "Yes. The modules work on phone, tablet, and desktop, so you can study in the gaps in your day.",
    },
    {
      question: "Are the resources downloadable?",
      answer:
        "Most courses include downloadable materials you can keep and revisit — they're listed on each course page.",
    },
    {
      question: "What if I get stuck?",
      answer:
        "You'll have access to support for doubt-clearing, so a difficult concept doesn't become a dead end.",
    },
  ],
  masterclass: [
    {
      question: "Are masterclasses live or recorded?",
      answer:
        "They're live and interactive, so you can ask questions in the moment. Where a recording is available, that's stated on the session.",
    },
    {
      question: "How long is a masterclass?",
      answer:
        "Focused by design — enough time for real depth on one topic, without padding. The exact length is listed per session.",
    },
    {
      question: "Do I need to prepare anything?",
      answer:
        "Just bring your questions. If there's anything to read or prepare, we'll tell you beforehand.",
    },
    {
      question: "Will I get a recording?",
      answer:
        "Where recordings are offered, you'll be told before you book. We don't promise what we can't deliver.",
    },
  ],
  "resume-studio": [
    {
      question: "Is this a template or a rewrite?",
      answer:
        "A rewrite. We shape your CV around your actual experience and goals — not a fill-in-the-blank template.",
    },
    {
      question: "Do you understand psychology careers?",
      answer:
        "That's all we do. We know what mental health employers and institutions screen for.",
    },
    {
      question: "How much feedback do I get?",
      answer:
        "You get personalised feedback and revisions as part of the service. The exact scope is confirmed with you before we start.",
    },
    {
      question: "Will it pass ATS screening?",
      answer:
        "We structure your CV to be ATS-friendly, so it reaches a human reviewer instead of disappearing into a filter.",
    },
  ],
  worksheet: [
    {
      question: "Who are the worksheets for?",
      answer:
        "Therapists, counsellors, students, and anyone doing structured personal work. They're written to be usable by a professional and by a motivated individual.",
    },
    {
      question: "Are they evidence-based?",
      answer:
        "Yes. The activities are grounded in established clinical approaches, not generic self-help.",
    },
    {
      question: "How do I receive them?",
      answer:
        "They're downloadable, so you can print and use them right away — and keep them for future sessions.",
    },
    {
      question: "Can I use them with clients?",
      answer:
        "Yes — that's the point. They're designed for real sessions and structured self-practice.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Per-type closing CTA
// ---------------------------------------------------------------------------

export interface CourseTypeClosing {
  headline: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

const ADVISOR_HREF = "/contact";
const COURSES_ANCHOR = "#courses";

export const courseTypeClosing: Record<string, CourseTypeClosing> = {
  certificate: {
    headline: "Your next step can start this week.",
    body: "Browse the certificate courses below, or ask us which one fits where you are.",
    primaryLabel: "Browse certificate courses",
    primaryHref: COURSES_ANCHOR,
    secondaryLabel: "Talk to an advisor",
    secondaryHref: ADVISOR_HREF,
  },
  diploma: {
    headline: "Commit to the deeper path.",
    body: "See the diploma programs, or talk to us about whether it's the right fit for your goals.",
    primaryLabel: "Browse diploma programs",
    primaryHref: COURSES_ANCHOR,
    secondaryLabel: "Talk to an advisor",
    secondaryHref: ADVISOR_HREF,
  },
  internship: {
    headline: "Turn theory into practice.",
    body: "Find an internship that gives you real cases and real feedback.",
    primaryLabel: "Browse internships",
    primaryHref: COURSES_ANCHOR,
    secondaryLabel: "Talk to an advisor",
    secondaryHref: ADVISOR_HREF,
  },
  therapy: {
    headline: "You've carried it on your own long enough.",
    body: "Book a first session, or ask us anything before you do.",
    primaryLabel: "Book a first session",
    primaryHref: COURSES_ANCHOR,
    secondaryLabel: "Ask a question",
    secondaryHref: ADVISOR_HREF,
  },
  supervised: {
    headline: "Get the feedback your practice deserves.",
    body: "See supervision options, or tell us what you need documented.",
    primaryLabel: "Browse supervision",
    primaryHref: COURSES_ANCHOR,
    secondaryLabel: "Talk to an advisor",
    secondaryHref: ADVISOR_HREF,
  },
  "pre-recorded": {
    headline: "Start tonight. Go at your pace.",
    body: "Browse self-paced courses and learn on your own schedule.",
    primaryLabel: "Browse self-paced courses",
    primaryHref: COURSES_ANCHOR,
    secondaryLabel: "Talk to an advisor",
    secondaryHref: ADVISOR_HREF,
  },
  masterclass: {
    headline: "Bring the question. Leave with the answer.",
    body: "See upcoming masterclasses, or suggest a topic you want covered.",
    primaryLabel: "Browse masterclasses",
    primaryHref: COURSES_ANCHOR,
    secondaryLabel: "Suggest a topic",
    secondaryHref: ADVISOR_HREF,
  },
  "resume-studio": {
    headline: "Make your CV do its job.",
    body: "Start your rewrite, or ask us what employers are looking for.",
    primaryLabel: "Start my resume",
    primaryHref: COURSES_ANCHOR,
    secondaryLabel: "Ask a question",
    secondaryHref: ADVISOR_HREF,
  },
  worksheet: {
    headline: "Use it in your next session.",
    body: "Browse worksheets you can download and put to work today.",
    primaryLabel: "Browse worksheets",
    primaryHref: COURSES_ANCHOR,
    secondaryLabel: "Talk to an advisor",
    secondaryHref: ADVISOR_HREF,
  },
};

// ---------------------------------------------------------------------------
// Default Emotional Hooks Per Type (fallback when course has no custom hook)
// ---------------------------------------------------------------------------

export const defaultEmotionalHooks: Record<string, string> = {
  certificate: "A practical, gentle way in.",
  therapy: "A space to come back to yourself.",
  supervised: "Grow with someone in your corner.",
  diploma: "Depth, taken one week at a time.",
  internship: "Learning that actually sits in your hands.",
  "pre-recorded": "Learn on your time, without the rush.",
  masterclass: "One topic. Taught well.",
  "resume-studio": "Let your work speak clearly.",
  worksheet: "A resource you can keep returning to.",
};

// ---------------------------------------------------------------------------
// Default Pain Points Per Type
// ---------------------------------------------------------------------------

export const defaultPainPoints: Record<string, string[]> = {
  certificate: [
    "You want structured learning, but most courses stay stuck in theory",
    "You need a credential that carries real weight",
    "You want to apply what you learn, not memorise it and forget",
    "You've tried self-study, and you know you need guidance",
  ],
  therapy: [
    "You overthink — even the small things",
    "Your mind feels exhausting and hard to switch off",
    "The anxiety shows up without a clear reason",
    "You've tried self-help, and nothing quite sticks",
  ],
  supervised: [
    "You want feedback on your clinical work but don't know where to find it",
    "You're unsure whether your approach is actually working",
    "You need supervised hours — but you want mentorship, not a checkbox",
    "You're early in your career and want someone experienced in your corner",
  ],
  diploma: [
    "You want more than a surface-level understanding of psychology",
    "You're ready to commit to something serious and long-term",
    "You need a qualification that's recognised and respected",
    "You want to stand out in a crowded, competitive field",
  ],
  internship: [
    "You've studied the theory but never sat with a real case",
    "You want supervised experience before practising independently",
    "You need practical hours to complete your training",
    "You learn best by doing, not by reading",
  ],
  "pre-recorded": [
    "Your schedule leaves no room for fixed class times",
    "You want to learn at your own pace, without pressure",
    "You need to revisit hard concepts more than once",
    "You want quality teaching without time-zone gymnastics",
  ],
  masterclass: [
    "You want depth on one topic, not another broad survey",
    "You want insight from someone who practises daily",
    "You want your questions answered live, not pre-recorded",
    "You need something focused — not another six-week commitment",
  ],
  "resume-studio": [
    "Your CV doesn't reflect how capable you actually are",
    "You don't know what psychology employers are screening for",
    "You've been applying and hearing nothing back",
    "You want to position yourself for the roles you actually want",
  ],
  worksheet: [
    "You need ready-to-use tools for your practice or your own growth",
    "You want evidence-based exercises, not generic self-help",
    "You're looking for structured activities that actually move the needle",
    "You want something you can use in the next session",
  ],
};

// ---------------------------------------------------------------------------
// Default Outcomes Per Type
// ---------------------------------------------------------------------------

export const defaultOutcomes: Record<string, string[]> = {
  certificate: [
    "Apply psychology concepts to real situations, not just exams",
    "Earn a credential employers and institutions recognise",
    "Build practical skills through hands-on exercises",
    "Join a community that keeps supporting your growth",
  ],
  therapy: [
    "Understand how your thoughts shape how you feel",
    "Learn practical tools to manage overthinking and anxiety",
    "Break the loops that keep you stuck",
    "Feel clearer, steadier, and more in control",
  ],
  supervised: [
    "Make clinical decisions with real confidence",
    "Receive honest, structured feedback on your approach",
    "Build a therapeutic framework that holds up under pressure",
    "Feel supported while you navigate real client work",
  ],
  diploma: [
    "Develop advanced clinical and theoretical understanding",
    "Build a portfolio that demonstrates your expertise",
    "Earn a diploma that signals depth and commitment",
    "Join a cohort of serious, dedicated learners",
  ],
  internship: [
    "Work with real scenarios under professional guidance",
    "Build confidence through milestones and feedback",
    "Develop practical skills no classroom can teach",
    "Graduate with experience employers actually value",
  ],
  "pre-recorded": [
    "Learn at your own pace, with no scheduling constraints",
    "Revisit any module as many times as you need",
    "Keep downloadable resources for the long haul",
    "Complete modules around your existing commitments",
  ],
  masterclass: [
    "Gain deep understanding of one therapeutic topic",
    "Learn from a practitioner who works in it daily",
    "Leave with frameworks you can apply immediately",
    "Get your specific questions answered live",
  ],
  "resume-studio": [
    "Have a polished, ATS-friendly CV tailored for psychology",
    "Communicate your strengths clearly and confidently",
    "Position yourself for the roles you actually want",
    "Get personalised feedback from career professionals",
  ],
  worksheet: [
    "Start using evidence-based tools immediately",
    "Strengthen your practice with professionally designed activities",
    "Support clients with structured, printable resources",
    "Build a personal toolkit for ongoing mental health work",
  ],
};

// ---------------------------------------------------------------------------
// Default Why Different Per Type
// ---------------------------------------------------------------------------

export const defaultWhyDifferent: Record<string, string[]> = {
  certificate: [
    "You practise techniques in-session, not just listen to lectures",
    "Small cohorts mean your educators know your name",
    "Lifetime access to community and doubt-clearing support",
    "Curriculum designed by working professionals, not career academics",
  ],
  therapy: [
    "You practise techniques in sessions, not just talk about them",
    "Sessions are tailored to your situation, not a script",
    "You're guided step by step — no confusion, no overwhelm",
    "Our therapists are compassionate, qualified, and genuinely invested",
  ],
  supervised: [
    "Your supervisor is a working clinician, not just an academic",
    "Feedback is specific and actionable — never judgmental",
    "You work with real cases, not hypothetical scenarios",
    "The mentorship relationship continues beyond the program",
  ],
  diploma: [
    "Long-form immersion that goes far beyond short courses",
    "Case studies and projects that mirror real clinical work",
    "Personalised mentorship throughout the program",
    "A peer network of committed professionals who share your drive",
  ],
  internship: [
    "Structured exposure to real cases, not just observation",
    "Your mentor catches you when you stumble — that's the point",
    "Clear milestones so you can see your own progress",
    "A safe place where mistakes are part of the work",
  ],
  "pre-recorded": [
    "Professionally produced content designed for retention",
    "Bite-sized lessons that fit any schedule",
    "Downloadable resources that outlast the course",
    "No time pressure — learn when it suits you best",
  ],
  masterclass: [
    "Taught by someone who does this work every day",
    "Interactive — your questions get answered live",
    "One topic, taught with depth and care",
    "Takeaways you can use the very next day",
  ],
  "resume-studio": [
    "We specialise in psychology careers, not generic CV writing",
    "Every CV is personalised, never template-based",
    "ATS optimisation so your application reaches a human",
    "Strategic career guidance is included, not an upsell",
  ],
  worksheet: [
    "Designed by practising professionals, not generated from templates",
    "Evidence-based activities grounded in clinical research",
    "Printable and immediately usable in sessions or self-practice",
    "Updated regularly based on practitioner feedback",
  ],
};
