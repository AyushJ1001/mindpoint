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
    tagline: "Build a meaningful foundation.",
    description:
      "Our certificate courses give you structured, expert-led learning in psychology and mental health. Each one blends theory with real exercises — so you walk away with skills you can actually use.",
    icon: Award,
  },
  diploma: {
    title: "Diploma Programs",
    tagline: "Go deeper, with intention.",
    description:
      "Diploma programs are for the learner ready to commit to a longer journey. You'll develop advanced clinical understanding, work through complex case studies, and build the depth that sets you apart.",
    icon: GraduationCap,
  },
  internship: {
    title: "Internship Programs",
    tagline: "Learn by doing, with guidance.",
    description:
      "Our internships put you in the practice seat — with structured tasks, real case exposure, and a mentor who is invested in your growth. This is where classroom knowledge becomes professional confidence.",
    icon: BriefcaseBusiness,
  },
  therapy: {
    title: "Therapy & Counselling",
    tagline: "A safe space to begin.",
    description:
      "Therapy is for anyone ready to be heard. Our licensed therapists meet you where you are — with warmth, evidence-based approaches, and sessions scheduled around your life.",
    icon: HeartPulse,
  },
  supervised: {
    title: "Supervised Practice",
    tagline: "Grow with someone watching your back.",
    description:
      "Supervised sessions are for psychology students and early-career therapists who want honest, supportive feedback on real clinical work. Your mentor walks beside you, not ahead of you.",
    icon: Telescope,
  },
  "pre-recorded": {
    title: "Pre-recorded Courses",
    tagline: "Learn on your time.",
    description:
      "Self-paced video modules you can revisit whenever you need them. Perfect for fitting meaningful learning into a busy life — no scheduling, no pressure.",
    icon: PlaySquare,
  },
  masterclass: {
    title: "Masterclasses",
    tagline: "One topic, taught well.",
    description:
      "Focused, live sessions on specific therapeutic topics — led by practitioners who do this work every day. Come with questions, leave with clarity.",
    icon: Sparkles,
  },
  "resume-studio": {
    title: "Resume Studio",
    tagline: "Tell your professional story.",
    description:
      "Your experience deserves a resume that reflects it. We help you craft a psychology-focused CV that is clear, compelling, and ready for the roles you want.",
    icon: FileText,
  },
  worksheet: {
    title: "Worksheets & Resources",
    tagline: "Tools you can use right now.",
    description:
      "Professionally designed, evidence-based worksheets for therapists and clients. Download, print, and start using them immediately.",
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
    description: "This course meets you wherever you are in your journey.",
    items: [
      {
        icon: "\u{1F393}",
        title: "Psychology Students",
        description:
          "Looking to add structured credentials alongside your degree.",
      },
      {
        icon: "\u{1F504}",
        title: "Career Changers",
        description:
          "Exploring whether mental health work is the right fit for you.",
      },
      {
        icon: "\u{1F4BC}",
        title: "Working Professionals",
        description:
          "Wanting to add mental health literacy to your existing skill set.",
      },
      {
        icon: "\u{1F331}",
        title: "Curious Learners",
        description:
          "Anyone who wants to understand the mind more deeply and intentionally.",
      },
    ],
  },
  diploma: {
    title: "Who is this for?",
    description: "Diploma programs are designed for committed learners.",
    items: [
      {
        icon: "\u{1F393}",
        title: "Aspiring Practitioners",
        description:
          "Ready to invest in a longer, deeper learning path toward clinical work.",
      },
      {
        icon: "\u{1F4DA}",
        title: "Psychology Graduates",
        description:
          "Looking to bridge the gap between academic study and applied practice.",
      },
      {
        icon: "\u{1F3E5}",
        title: "Healthcare Workers",
        description:
          "Wanting to add formal mental health training to your clinical background.",
      },
      {
        icon: "\u{1F3AF}",
        title: "Career Advancers",
        description:
          "Seeking recognized qualifications that open doors to senior roles.",
      },
    ],
  },
  internship: {
    title: "Who is this for?",
    description:
      "Internships are for learners ready to practice, not just study.",
    items: [
      {
        icon: "\u{1F393}",
        title: "Final-year Students",
        description:
          "Needing supervised hours to complete academic requirements.",
      },
      {
        icon: "\u{1F331}",
        title: "Early-career Professionals",
        description:
          "Wanting real case exposure before stepping into independent practice.",
      },
      {
        icon: "\u{1F504}",
        title: "Career Transitioners",
        description:
          "Building practical experience to support a move into mental health.",
      },
      {
        icon: "\u{1F4A1}",
        title: "Skill Builders",
        description:
          "Anyone who learns best by doing, with a mentor alongside them.",
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
          "You don't need a diagnosis to deserve someone to talk to.",
      },
      {
        icon: "\u{1F4AD}",
        title: "People Processing Change",
        description:
          "Navigating transitions, grief, relationships, or uncertainty.",
      },
      {
        icon: "\u{1F9E0}",
        title: "Those Managing Anxiety or Stress",
        description:
          "Looking for evidence-based tools to regain a sense of calm.",
      },
      {
        icon: "\u{2728}",
        title: "Growth-oriented Individuals",
        description:
          "Who want to understand themselves better, not just feel better.",
      },
    ],
  },
  supervised: {
    title: "Who is supervision for?",
    description: "For practitioners building clinical confidence.",
    items: [
      {
        icon: "\u{1F393}",
        title: "Psychology Trainees",
        description:
          "Needing supervised clinical hours for licensure or certification.",
      },
      {
        icon: "\u{1F331}",
        title: "Early-career Therapists",
        description:
          "Wanting feedback on real cases from an experienced practitioner.",
      },
      {
        icon: "\u{1F504}",
        title: "Returning Practitioners",
        description:
          "Getting back into clinical work after a break and wanting support.",
      },
      {
        icon: "\u{1F4AA}",
        title: "Skill Refiners",
        description:
          "Experienced professionals seeking fresh perspectives on their approach.",
      },
    ],
  },
  "pre-recorded": {
    title: "Who is this for?",
    description: "Self-paced courses for learners who need flexibility.",
    items: [
      {
        icon: "\u{23F0}",
        title: "Busy Professionals",
        description:
          "Who want to learn but cannot commit to fixed schedules.",
      },
      {
        icon: "\u{1F501}",
        title: "Revisiting Learners",
        description:
          "Who benefit from watching material more than once at their own pace.",
      },
      {
        icon: "\u{1F30D}",
        title: "Remote Learners",
        description:
          "In different time zones who need access without scheduling barriers.",
      },
      {
        icon: "\u{1F4D6}",
        title: "Self-directed Learners",
        description:
          "Who thrive when they can control the pace and order of their study.",
      },
    ],
  },
  masterclass: {
    title: "Who is this for?",
    description:
      "Masterclasses suit learners who want depth on a specific topic.",
    items: [
      {
        icon: "\u{1F9E0}",
        title: "Practicing Therapists",
        description:
          "Looking for fresh perspectives on specific therapeutic approaches.",
      },
      {
        icon: "\u{1F393}",
        title: "Advanced Students",
        description:
          "Ready to explore topics beyond what standard coursework covers.",
      },
      {
        icon: "\u{1F4AC}",
        title: "Community Workers",
        description:
          "Who deal with mental health in their daily work and want better tools.",
      },
      {
        icon: "\u{1F31F}",
        title: "Lifelong Learners",
        description:
          "Curious minds drawn to specific topics they want to understand deeply.",
      },
    ],
  },
  "resume-studio": {
    title: "Who is this for?",
    description: "For psychology professionals at any career stage.",
    items: [
      {
        icon: "\u{1F393}",
        title: "Fresh Graduates",
        description:
          "Creating your first professional resume for the psychology field.",
      },
      {
        icon: "\u{1F504}",
        title: "Career Switchers",
        description:
          "Translating transferable skills into a mental health focused CV.",
      },
      {
        icon: "\u{1F4C8}",
        title: "Mid-career Professionals",
        description:
          "Updating your resume to reflect growth and new competencies.",
      },
      {
        icon: "\u{1F3AF}",
        title: "Job Seekers",
        description:
          "Anyone applying for roles who wants their resume to stand out.",
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
          "Every course includes exercises and activities you can apply immediately.",
      },
      {
        icon: Users,
        title: "Small, attentive cohorts",
        description:
          "You're not a number here. Our educators know your name and your goals.",
      },
      {
        icon: Heart,
        title: "Lifetime support",
        description:
          "Doubt clearing and community access don't expire when the course ends.",
      },
      {
        icon: Award,
        title: "Recognized certification",
        description:
          "A credential that carries weight with employers and institutions.",
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
          "Go well beyond surface-level understanding into clinical and applied expertise.",
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
          "Opens doors to roles that require more than a certificate-level qualification.",
      },
      {
        icon: Users,
        title: "Peer network",
        description:
          "Build lasting relationships with fellow learners who share your dedication.",
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
          "Work with actual scenarios under structured guidance, not hypothetical ones.",
      },
      {
        icon: Shield,
        title: "Safe to make mistakes",
        description:
          "Your mentor is there to catch you, not judge you. Learning means stretching.",
      },
      {
        icon: TrendingUp,
        title: "Tangible skill growth",
        description:
          "Track your progress with feedback loops and structured milestones.",
      },
      {
        icon: Heart,
        title: "Mentorship that lasts",
        description:
          "The relationship with your supervisor continues beyond the program.",
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
        title: "Flexible scheduling",
        description:
          "Sessions fit around your life, not the other way around.",
      },
      {
        icon: Heart,
        title: "Compassionate, evidence-based",
        description:
          "We combine warmth with proven approaches like CBT and positive psychology.",
      },
      {
        icon: Users,
        title: "Affordable and accessible",
        description:
          "Quality therapy should not be a luxury. Our pricing reflects that belief.",
      },
    ],
  },
  supervised: {
    title: "Why supervision with us?",
    description: "What makes this mentorship different.",
    items: [
      {
        icon: Eye,
        title: "Expert guidance",
        description:
          "Learn from practitioners who actively work in clinical settings.",
      },
      {
        icon: Shield,
        title: "Safe environment",
        description:
          "Make mistakes, ask questions, and grow without judgment.",
      },
      {
        icon: TrendingUp,
        title: "Skill development",
        description:
          "Structured feedback that accelerates your growth as a clinician.",
      },
      {
        icon: Users,
        title: "Peer learning",
        description:
          "Connect with other trainees navigating the same stage of their career.",
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
        description:
          "Study at midnight or midday. No live schedules to work around.",
      },
      {
        icon: Repeat,
        title: "Watch as many times as you need",
        description:
          "Revisit difficult concepts until they feel natural.",
      },
      {
        icon: Video,
        title: "Professionally produced",
        description:
          "Clear audio, thoughtful visuals, and content designed for retention.",
      },
      {
        icon: Download,
        title: "Downloadable resources",
        description:
          "Supplementary materials you can keep and reference long after the course.",
      },
    ],
  },
  masterclass: {
    title: "Why attend a masterclass?",
    description: "What makes focused, intensive learning valuable.",
    items: [
      {
        icon: Star,
        title: "Learn from practitioners",
        description:
          "Not just academics — people who do this work every day in real settings.",
      },
      {
        icon: Zap,
        title: "Concentrated learning",
        description:
          "More depth in less time. Walk away with actionable understanding.",
      },
      {
        icon: Users,
        title: "Ask your questions live",
        description:
          "Interactive sessions where your specific concerns get addressed.",
      },
      {
        icon: Target,
        title: "Immediately applicable",
        description:
          "Designed around skills and frameworks you can use the next day.",
      },
    ],
  },
  "resume-studio": {
    title: "Why use Resume Studio?",
    description: "Because your resume is often your first impression.",
    items: [
      {
        icon: FileText,
        title: "Psychology-specific expertise",
        description:
          "We know what mental health employers and institutions look for.",
      },
      {
        icon: Target,
        title: "ATS-friendly formatting",
        description:
          "Structured so automated systems pass your resume to human reviewers.",
      },
      {
        icon: Edit,
        title: "Personalized feedback",
        description:
          "Not a template — a resume shaped around your unique experience and goals.",
      },
      {
        icon: Users,
        title: "Career guidance included",
        description:
          "Strategic advice on positioning yourself for the roles you actually want.",
      },
    ],
  },
};
