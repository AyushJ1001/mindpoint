import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";
import { readPublicEnv } from "@/lib/config";
import { auth } from "@clerk/nextjs/server";
import { hasAdminAccess } from "@/lib/admin-access";
import { resolveAuthEmail } from "@/lib/clerk-email";
import { isClerkServerConfigured } from "@/lib/clerk-env";
import HeroSection from "@/components/landing/HeroSection";

export const revalidate = 3600;

export const metadata = {
  title: "The Mind Point - A Kinder, Brighter You.",
  description:
    "Psychology education, practical training and supportive learning designed for students, aspiring mental health professionals and lifelong learners.",
  metadataBase: new URL("https://themindpoint.org"),
  alternates: { canonical: "/" },
};

const pathways = [
  {
    number: "01",
    title: "Learn psychology with depth",
    text: "Certificate courses, diplomas and masterclasses built to move beyond memorising theory into real understanding and application.",
    href: "/courses",
    link: "Explore programs",
  },
  {
    number: "02",
    title: "Build practical confidence",
    text: "Internships, supervised learning and case-based practice designed for psychology students and emerging professionals.",
    href: "/courses/internship",
    link: "Explore practical training",
  },
  {
    number: "03",
    title: "Find personal support",
    text: "Accessible therapy and counselling for moments when you need clarity, grounding, emotional support or a place to begin.",
    href: "/courses/therapy",
    link: "Explore personal support",
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
        .slice(0, 3) || []
    );
  } catch (error) {
    console.warn("Failed to fetch upcoming courses:", error);
    return [];
  }
}

export default async function Home() {
  const upcomingCourses = await getUpcomingCourses();
  let canAccessAdmin = false;

  if (isClerkServerConfigured()) {
    const { userId, sessionClaims, getToken } = await auth();
    const sessionEmail = await resolveAuthEmail(sessionClaims);

    if (userId || sessionEmail) {
      try {
        const convexToken = await getToken({ template: "convex" });
        canAccessAdmin = await hasAdminAccess(
          userId,
          sessionEmail,
          convexToken,
        );
      } catch (error) {
        console.warn("Failed to resolve home-page admin access:", error);
      }
    }
  }

  return (
    <div className="bg-[#fffdf9] text-[#173f3d]">
      <HeroSection canAccessAdmin={canAccessAdmin} />

      <section
        className="border-y border-[#0f4d4d]/12 bg-[#f0f6f3]"
        aria-label="The Mind Point at a glance"
      >
        <div className="mx-auto grid max-w-7xl divide-y divide-[#0f4d4d]/12 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-10 lg:grid-cols-4 lg:px-[7vw]">
          {[
            ["One ecosystem", "Education, practice and care"],
            ["Built in India", "Designed for Indian learners"],
            ["Human guidance", "Questions are welcome here"],
            ["Flexible paths", "Start where you are"],
          ].map(([title, detail]) => (
            <div key={title} className="py-7 sm:px-6 lg:px-8">
              <p className="font-display text-2xl font-semibold text-[#173f3d]">
                {title}
              </p>
              <p className="mt-1 text-xs font-semibold tracking-[0.08em] text-[#627572] uppercase">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EDITORIAL INTRO — no conventional cards */}
      <section className="px-6 py-24 sm:px-10 lg:px-[7vw] lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div>
              <p className="text-[0.68rem] font-semibold tracking-[0.26em] text-[#0f4d4d]/55 uppercase">
                The Mind Point
              </p>
              <h2 className="font-display mt-5 text-5xl leading-[0.95] font-medium tracking-[-0.04em] sm:text-6xl">
                Psychology that feels
                <span className="block italic">clear, human and useful.</span>
              </h2>
            </div>
            <div className="lg:pt-14">
              <p className="max-w-2xl text-xl leading-9 text-[#607572]">
                We bring learning, practice and personal support into one
                thoughtful space — so psychology feels less overwhelming and
                more meaningful, whether you are studying it, working in it, or
                simply trying to understand yourself better.
              </p>
            </div>
          </div>

          <div className="mt-20 border-t border-[#0f4d4d]/12">
            {pathways.map((item) => (
              <Link
                href={item.href}
                key={item.number}
                className="group grid gap-5 border-b border-[#0f4d4d]/12 py-9 transition sm:grid-cols-[5rem_0.8fr_1.2fr_auto] sm:items-center sm:gap-8 lg:py-11"
              >
                <span className="font-display text-2xl text-[#b79755] italic">
                  {item.number}
                </span>
                <h3 className="font-display text-3xl leading-tight font-medium sm:text-4xl">
                  {item.title}
                </h3>
                <p className="max-w-xl text-base leading-7 text-[#657774]">
                  {item.text}
                </p>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#0f4d4d]/15 bg-[#f4f8f6] text-[#0f4d4d] transition group-hover:translate-x-1 group-hover:bg-[#0f4d4d] group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DEEP TEAL BRAND MOMENT */}
      <section className="relative overflow-hidden bg-[#0f4d4d] px-6 py-24 text-[#faf8f3] sm:px-10 lg:px-[7vw] lg:py-32">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full border border-[#9fd0cf]/10" />
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.26em] text-[#9fd0cf] uppercase">
              A calmer way to learn
            </p>
            <h2 className="font-display mt-5 text-5xl leading-[0.96] font-medium tracking-[-0.04em] sm:text-6xl">
              Serious learning.
              <span className="block text-[#b9dedd] italic">Never cold.</span>
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#d2e1de] sm:text-xl sm:leading-9">
            TMP is built for people who want depth without intimidation,
            structure without rigidity, and a professional learning environment
            that still feels safe enough to ask, question, practise and grow.
          </p>
        </div>
      </section>

      {/* UPCOMING PROGRAMS — magazine-like large features */}
      <section className="px-6 py-24 sm:px-10 lg:px-[7vw] lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold tracking-[0.26em] text-[#0f4d4d]/55 uppercase">
                Now enrolling
              </p>
              <h2 className="font-display mt-4 text-5xl leading-none font-medium tracking-[-0.04em] sm:text-6xl">
                Your next place to learn.
              </h2>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center text-sm font-semibold text-[#0f4d4d]"
            >
              View all programs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {upcomingCourses.length > 0 ? (
            <div className="mt-14 grid gap-8 lg:grid-cols-3">
              {upcomingCourses.map((course, index) => {
                const start = new Date(course.startDate).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short", year: "numeric" },
                );
                const image = course.imageUrls?.[0];
                return (
                  <Link
                    href={`/courses/${course._id}`}
                    key={course._id}
                    className={`group ${index === 0 ? "lg:col-span-2" : ""}`}
                  >
                    <div
                      className={`relative overflow-hidden rounded-[2rem] bg-[#eef4f2] ${index === 0 ? "aspect-[16/9]" : "aspect-[4/5]"}`}
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={course.name}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-[1.02]"
                          sizes={
                            index === 0
                              ? "(max-width: 1024px) 100vw, 66vw"
                              : "(max-width: 1024px) 100vw, 33vw"
                          }
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(142,193,195,0.45),transparent_20rem),linear-gradient(145deg,#f2f7f5,#e5efec)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#173f3d]/70 via-transparent to-transparent" />
                      <div className="absolute right-5 bottom-5 left-5 text-white sm:right-7 sm:bottom-7 sm:left-7">
                        <div className="mb-3 flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.16em] text-white/80 uppercase">
                          <CalendarDays className="h-4 w-4" />
                          {start}
                        </div>
                        <h3 className="font-display max-w-2xl text-3xl leading-tight font-medium sm:text-4xl">
                          {course.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-14 border-y border-[#0f4d4d]/12 py-12 text-[#607572]">
              New batches will appear here as soon as they are published.
            </div>
          )}
        </div>
      </section>

      {/* PERSONAL SUPPORT SPLIT */}
      <section className="grid min-h-[42rem] lg:grid-cols-2">
        <div className="relative min-h-[28rem] overflow-hidden lg:min-h-full">
          <Image
            src="/illustrations/hope.jpg"
            alt="A calm space for personal support"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-[#0f4d4d]/10" />
        </div>
        <div className="flex items-center bg-[#edf5f2] px-6 py-16 sm:px-10 lg:px-[7vw] lg:py-20">
          <div className="max-w-xl">
            <p className="text-[0.68rem] font-semibold tracking-[0.26em] text-[#0f4d4d]/55 uppercase">
              Personal support
            </p>
            <h2 className="font-display mt-5 text-5xl leading-[0.95] font-medium tracking-[-0.04em] sm:text-6xl">
              Some growth begins
              <span className="block italic">with being heard.</span>
            </h2>
            <p className="mt-7 text-lg leading-8 text-[#617572]">
              Therapy and counselling at TMP are designed to feel approachable,
              grounded and practical — a place to understand what is happening
              and decide what you need next.
            </p>
            <Link
              href="/courses/therapy"
              className="mt-9 inline-flex items-center rounded-full bg-[#0f4d4d] px-7 py-3.5 text-sm font-semibold tracking-wide text-white"
            >
              Explore support
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — editorial quotes rather than cards */}
      <section className="px-6 py-24 sm:px-10 lg:px-[7vw] lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-semibold tracking-[0.26em] text-[#0f4d4d]/55 uppercase">
              Student voices
            </p>
            <h2 className="font-display mt-4 text-5xl leading-none font-medium tracking-[-0.04em] sm:text-6xl">
              What learners carry with them.
            </h2>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-10">
            {voices.map((voice, index) => (
              <blockquote
                key={voice.label}
                className={`border-t border-[#0f4d4d]/16 pt-7 ${index === 1 ? "lg:mt-16" : ""}`}
              >
                <span className="font-display text-6xl leading-none text-[#b79755]/45">
                  “
                </span>
                <p className="font-display -mt-3 text-3xl leading-[1.2] font-medium text-[#173f3d]">
                  {voice.quote}
                </p>
                <footer className="mt-7 text-[0.68rem] font-semibold tracking-[0.18em] text-[#0f4d4d]/55 uppercase">
                  {voice.label}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL COASTAL CTA */}
      <section className="relative min-h-[34rem] overflow-hidden">
        <Image
          src="/illustrations/hero.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f4d4d]/92 via-[#173f3d]/78 to-[#0f4d4d]/32" />
        <div className="relative z-10 flex min-h-[34rem] items-center px-6 py-20 sm:px-10 lg:px-[7vw]">
          <div className="max-w-3xl text-white">
            <p className="text-[0.68rem] font-semibold tracking-[0.26em] text-[#b9dedd] uppercase">
              A brighter tomorrow starts here
            </p>
            <h2 className="font-display mt-5 text-5xl leading-[0.95] font-medium tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Learn something meaningful.
              <span className="block text-[#d9efeb] italic">
                Carry it forward.
              </span>
            </h2>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-full bg-[#faf8f3] px-7 py-3.5 text-sm font-semibold text-[#0f4d4d]"
              >
                Explore programs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur"
              >
                About The Mind Point
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
