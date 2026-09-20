import { ScrollReveal } from "@/components/ScrollReveal";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import Link from "next/link";
import Image from "next/image";
import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  PlaySquare,
  Sparkles,
  HeartPulse,
  Telescope,
  FileText,
} from "lucide-react";

const CATEGORIES = [
  {
    title: "Certificate Courses",
    href: "/courses/certificate",
    desc: "Structured learning with a credential you can build on.",
    icon: Award,
  },
  {
    title: "Internship Programs",
    href: "/courses/internship",
    desc: "Hands-on practice with a mentor in your corner.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Diploma Programs",
    href: "/courses/diploma",
    desc: "A deeper commitment for those ready to go further.",
    icon: GraduationCap,
  },
  {
    title: "Pre-recorded Courses",
    href: "/courses/pre-recorded",
    desc: "Self-paced modules you can revisit anytime.",
    icon: PlaySquare,
  },
  {
    title: "Masterclasses",
    href: "/courses/masterclass",
    desc: "Focused sessions on one topic, taught by someone who lives it.",
    icon: Sparkles,
  },
  {
    title: "Therapy Sessions",
    href: "/courses/therapy",
    desc: "A safe, professional space to be heard and supported.",
    icon: HeartPulse,
  },
  {
    title: "Supervised Programs",
    href: "/courses/supervised",
    desc: "Guided feedback on real clinical work, from someone who cares.",
    icon: Telescope,
  },
  {
    title: "Resume Studio",
    href: "/courses/resume-studio",
    desc: "Help telling your professional story clearly and compellingly.",
    icon: FileText,
  },
];

export default function CoursesHero() {
  return (
    <>
      <section className="py-14 sm:py-20">
        <div className="container grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className={eyebrowVariants()}>Programs</span>
            <h1 className="font-display mt-4 text-4xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              Find your path in <em className="italic">mental health.</em>
            </h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-lg">
              Structured programs, live workshops, self-paced learning, and
              professional support — all in one place. Start wherever feels
              right for you.
            </p>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded shadow-[0_40px_80px_-50px_rgba(19,46,43,0.6)]">
            <Image
              src="/coastal/calm.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container pb-20 sm:pb-28">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIES.map((category) => (
            <ScrollReveal key={category.href}>
              <Link
                href={category.href}
                className="group border-border hover:border-primary hover:bg-card block h-full rounded border border-dashed p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-46px_rgba(19,46,43,0.5)]"
              >
                <div className="text-primary mb-5">
                  <category.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-display group-hover:text-primary mb-2 text-xl transition-colors">
                  {category.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {category.desc}
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
