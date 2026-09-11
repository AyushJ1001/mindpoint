import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";
import { readPublicEnv } from "@/lib/config";

export const revalidate = 3600;

export const metadata = {
  title: "The Mind Point - Learn · Grow · Heal · Belong",
  description:
    "Psychology education, practical training and supportive learning designed for students, aspiring mental health professionals and lifelong learners.",
  metadataBase: new URL("https://themindpoint.org"),
  alternates: { canonical: "/" },
};

const journeys = [
  {
    label: "first",
    title: "Learn",
    text: "Certificate courses, diplomas, workshops and recorded learning that make psychology easier to understand and remember.",
  },
  {
    label: "then",
    title: "Practise",
    text: "Internships, supervised learning, case discussions and applied exercises that move you beyond memorising theory.",
  },
  {
    label: "and",
    title: "Grow",
    text: "Build professional confidence, personal insight and a learning path that can keep evolving with you.",
  },
];

const doors = [
  {
    eyebrow: "to learn",
    title: "TMP Academy",
    text: "All psychology programmes in one place — certificates, diplomas, internships, masterclasses and self-paced learning.",
    href: "/courses",
    link: "open the Academy",
  },
  {
    eyebrow: "to practise",
    title: "Practical Training",
    text: "Internships, supervised programmes and case-based learning for students who want to turn knowledge into usable skill.",
    href: "/courses/internship",
    link: "explore practical training",
  },
  {
    eyebrow: "for support",
    title: "Therapy & Growth",
    text: "A professional, supportive space for counselling, personal growth and the moments when understanding yourself matters most.",
    href: "/courses/therapy",
    link: "find personal support",
  },
];

const voices = [
  {
    quote:
      "The learning felt clear, practical and genuinely useful — not like another set of notes to memorise.",
    label: "Psychology learner",
  },
  {
    quote:
      "TMP gave me a space where I could ask questions, practise, and slowly feel more confident about the work I want to do.",
    label: "Certificate student",
  },
  {
    quote:
      "What stayed with me was how human the whole experience felt. Professional, but never intimidating.",
    label: "Community member",
  },
];

async function getUpcomingCourses() {
  try {
    const { convexUrl } = readPublicEnv();
    if (!convexUrl) return [];

    const convex = new ConvexHttpClient(convexUrl);
    const allCourses = await convex.query(api.courses.listCourses, {
      count: undefined,
    });

    return (
      allCourses
        ?.filter((course) => {
          if (!course.startDate || course.startDate.trim() === "") return false;
          if (!course.type || course.type === "pre-recorded") return false;
          return new Date(course.startDate) > new Date();
        })
        ?.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        )
        .slice(0, 6) || []
    );
  } catch (error) {
    console.warn("Failed to fetch upcoming courses:", error);
    return [];
  }
}

export default async function Home() {
  const upcomingCourses = await getUpcomingCourses();

  return (
    <div className="ss-page ss-home">
      <section className="ss-hero">
        <div className="ss-wrap">
          <div className="ss-hero-grid">
            <div>
              <p className="ss-kicker">since 2020 · online across India</p>
              <h1 className="ss-heading-xl">A thoughtful place to learn psychology.</h1>
              <p className="ss-lead ss-dropcap mt-7">
                From your first curiosity about psychology to deeper professional
                training, The Mind Point brings learning, practical experience and
                personal support into one clear path. Learn it properly, practise it
                meaningfully, and grow at a pace that still feels human.
              </p>
              <div className="mt-7 flex flex-wrap gap-x-7 gap-y-4">
                <Link href="/courses" className="ss-link">
                  find your path <span aria-hidden="true">›</span>
                </Link>
                <Link href="/about" className="ss-link">
                  meet The Mind Point <span aria-hidden="true">›</span>
                </Link>
              </div>
            </div>

            <div className="ss-hero-image">
              <Image
                src="/illustrations/hero.jpg"
                alt="A calm coastal scene representing learning and growth"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 980px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-[#eef4ef]/10" />
            </div>
          </div>

          <div className="ss-stat-grid mt-12 lg:mt-16">
            <div className="ss-stat">
              <strong>10,000+</strong>
              <span>learners reached</span>
            </div>
            <div className="ss-stat">
              <strong>2020</strong>
              <span>founded in India</span>
            </div>
            <div className="ss-stat">
              <strong>Online</strong>
              <span>built for access across locations</span>
            </div>
            <div className="ss-stat">
              <strong>MSME</strong>
              <span>registered · quality focused</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ss-section-tight">
        <div className="ss-wrap">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="ss-kicker">on right now</p>
              <h2 className="ss-heading-md">What’s open.</h2>
            </div>
            <Link href="/courses" className="ss-link">
              see every programme <span aria-hidden="true">›</span>
            </Link>
          </div>

          <div className="ss-row-list">
            {upcomingCourses.length > 0 ? (
              upcomingCourses.map((course) => {
                const date = new Date(course.startDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });
                return (
                  <Link className="ss-row" href={`/courses/${course._id}`} key={course._id}>
                    <span className="ss-row-date">starts {date}</span>
                    <span className="ss-row-title">{course.name}</span>
                    <span className="ss-row-meta">{course.type?.replaceAll("-", " ")}</span>
                    <span className="text-sm text-[#0f4d4d]" aria-hidden="true">›</span>
                  </Link>
                );
              })
            ) : (
              <div className="ss-row">
                <span className="ss-row-date">new batches</span>
                <span className="ss-row-title">Fresh programmes are being prepared.</span>
                <span className="ss-row-meta">check the Academy for current options</span>
                <span aria-hidden="true">›</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <p className="ss-kicker">the whole journey, one place</p>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
            <h2 className="ss-heading-lg">Learn. Practise. Grow.</h2>
            <p className="ss-lead">
              Psychology education can become a collection of notes very quickly.
              TMP is organised as a path instead: understand the idea, apply it to
              people and cases, then build the confidence to use what you learned.
            </p>
          </div>

          <div className="ss-steps">
            {journeys.map((item) => (
              <article className="ss-step" key={item.title}>
                <span className="ss-step-label">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <p className="ss-kicker">where to begin</p>
          <h2 className="ss-heading-lg">Three doors in.</h2>

          <div className="ss-door-grid">
            {doors.map((door) => (
              <Link href={door.href} className="ss-door" key={door.title}>
                <span className="ss-kicker">{door.eyebrow}</span>
                <h3>{door.title}</h3>
                <p>{door.text}</p>
                <span className="ss-link mt-6">
                  {door.link} <span aria-hidden="true">›</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ss-band ss-section">
        <div className="ss-wrap">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
            <div>
              <p className="ss-kicker">the part that matters</p>
              <h2 className="ss-heading-lg">Understand it well enough to use it.</h2>
            </div>
            <div>
              <p className="ss-lead">
                TMP courses are built around detailed reference material, discussion,
                case examples and practical exercises. The aim is not to make learning
                look complicated. It is to make the important parts clear enough that
                they stay with you after the course ends.
              </p>
              <Link href="/courses" className="ss-link mt-7">
                see how the Academy works <span aria-hidden="true">›</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="relative min-h-[420px] border-y border-[#163f3d]/20 lg:min-h-[560px]">
              <Image
                src="/illustrations/hope.jpg"
                alt="A calm space for learning, reflection and support"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
            <div className="lg:self-center">
              <p className="ss-kicker">who we are</p>
              <h2 className="ss-heading-lg">Built around learning that still feels human.</h2>
              <p className="ss-lead mt-6">
                The Mind Point began in 2020 with a simple idea: serious psychology
                education should be accessible without becoming impersonal. The same
                principle still shapes the courses, the support, the material and the
                way students are spoken to today.
              </p>
              <Link href="/about" className="ss-link mt-7">
                read our story <span aria-hidden="true">›</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <p className="ss-kicker">the proof, not the pitch</p>
          <h2 className="ss-heading-lg">What learners say.</h2>
          <div className="ss-quote-grid">
            {voices.map((voice) => (
              <figure className="ss-quote" key={voice.label}>
                <blockquote>“{voice.quote}”</blockquote>
                <figcaption>{voice.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="ss-kicker">one good first step</p>
              <h2 className="ss-heading-lg">Begin where you are.</h2>
              <p className="ss-lead mt-5">
                You do not need to know your entire path before you start. Browse the
                Academy, choose what feels useful now, and go deeper when you are ready.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 border border-[#0f4d4d] bg-[#0f4d4d] px-6 py-4 text-sm font-semibold text-[#faf8f3]"
            >
              explore programmes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
