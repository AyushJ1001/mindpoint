import {
  Globe,
  Users,
  BookOpen,
  Award,
  Heart,
  Target,
  Lightbulb,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { LeafAccent } from "@/components/illustrations";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About The Mind Point",
  description:
    "Learn about The Mind Point's approach to accessible, practical, and human psychology education, professional development, and mental health support.",
  keywords:
    "about The Mind Point, psychology education, mental health education, psychology courses, professional development",
  openGraph: {
    title: "About The Mind Point",
    description:
      "Psychology education and support designed to feel serious, accessible, practical, and human.",
    type: "website",
  },
};

const aboutStructuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "The Mind Point",
  description:
    "A platform for mental health education and support, offering courses in psychology, counseling, and professional development.",
  url: "https://themindpoint.org",
  logo: "https://themindpoint.org/tmp-botanical-logo.svg",
  foundingDate: "2020",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "contact.themindpoint@gmail.com",
    availableLanguage: "English",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Psychology Education Programs",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Certificate Courses",
          description:
            "Professional certification programs in psychology and mental health",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Diploma Programs",
          description:
            "Comprehensive diploma courses for in-depth knowledge and expertise",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Therapy Sessions",
          description:
            "Professional therapy and counseling services for mental wellness",
        },
      },
    ],
  },
  award: ["MSME", "IAOTH", "ISO 9001:2015"],
  knowsAbout: [
    "Mental Health Education",
    "Psychology",
    "Counseling",
    "Therapy",
    "Professional Development",
    "Online Learning",
  ],
};

const SERVICES = [
  {
    icon: Award,
    title: "Certificate & Diploma Programs",
    description:
      "Structured psychology learning designed to build understanding, practical skills, and professional confidence.",
  },
  {
    icon: Users,
    title: "Live Online Learning",
    description:
      "Interactive classes and discussions that make room for questions, reflection, and human connection.",
  },
  {
    icon: BookOpen,
    title: "Self-Paced Courses",
    description:
      "Flexible recorded learning for students who need to move through material at their own pace.",
  },
  {
    icon: Target,
    title: "Supervised Practice & Internships",
    description:
      "Applied learning experiences that help bridge the gap between psychology theory and real-world practice.",
  },
  {
    icon: Lightbulb,
    title: "Workshops & Masterclasses",
    description:
      "Focused learning on useful themes, therapeutic tools, and emerging areas of psychology.",
  },
  {
    icon: Heart,
    title: "Personal Growth & Support",
    description:
      "Spaces for healing, self-understanding, emotional growth, and professional support.",
  },
];

const WHY_CHOOSE = [
  { icon: Globe, text: "Globally useful learning and credentials" },
  { icon: BookOpen, text: "Theory connected to practical application" },
  { icon: Users, text: "Smaller learning spaces and personal attention" },
  { icon: Target, text: "Career-oriented learning pathways" },
  { icon: Award, text: "Accessible pricing and thoughtful offers" },
  { icon: Heart, text: "Case-based, human-centred learning" },
  { icon: Lightbulb, text: "Detailed reference material and tools" },
  { icon: CheckCircle, text: "Recordings for eligible live programs" },
];

const BELIEFS = [
  {
    number: "01",
    title: "Learning should feel safe enough to ask questions.",
    text: "Psychology becomes more meaningful when students can be curious, uncertain, reflective, and still feel supported while learning.",
  },
  {
    number: "02",
    title: "Education should move beyond memorising theory.",
    text: "Concepts matter most when learners can recognise them in people, relationships, cases, practice, and everyday life.",
  },
  {
    number: "03",
    title: "Professional learning can still feel warm and human.",
    text: "Credibility and compassion do not have to compete. TMP is built around holding both at the same time.",
  },
];

export default function About() {
  return (
    <>
      <Script
        id="about-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutStructuredData),
        }}
      />

      <div className="tmp-about-page min-h-screen">
        <section className="brand-hero relative overflow-hidden py-16 sm:py-20 lg:py-24">
          <div className="container relative z-10">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div className="max-w-3xl text-center lg:text-left">
                <div className="flex items-center justify-center gap-4 lg:justify-start">
                  <span className="brand-gold-rule" aria-hidden="true" />
                  <span className="brand-kicker">About The Mind Point</span>
                </div>
                <h1 className="font-display text-foreground mt-6 text-5xl leading-[1.02] font-medium tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                  Psychology education that feels
                  <span className="text-primary block italic">serious and human.</span>
                </h1>
                <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
                  The Mind Point is an online learning and support space built around one belief: people learn psychology best when depth, practical application, accessibility, and warmth are allowed to exist together.
                </p>
                <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Button size="lg" asChild className="rounded-full px-7">
                    <Link href="/courses">
                      Explore our programs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="rounded-full border-primary/20 bg-background/60 px-7"
                  >
                    <Link href="/contact">Talk to TMP</Link>
                  </Button>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
                <div className="brand-panel relative overflow-hidden rounded-[2.4rem] p-8 text-center sm:p-10">
                  <Image
                    src="/tmp-botanical-logo.svg"
                    alt="The Mind Point botanical TMP logo"
                    width={220}
                    height={220}
                    className="mx-auto h-40 w-40 object-contain sm:h-48 sm:w-48"
                  />
                  <div className="mx-auto mt-7 h-px w-16 bg-[#b79755]" />
                  <p className="font-display text-primary mt-6 text-3xl font-medium italic">
                    Learn. Grow. Heal. Belong.
                  </p>
                  <p className="text-muted-foreground mt-3 text-sm leading-6">
                    A kinder, brighter tomorrow — through understanding.
                  </p>
                </div>
                <LeafAccent className="brand-soft-float pointer-events-none absolute -right-6 -bottom-5 hidden h-14 w-14 rotate-[20deg] opacity-20 lg:block" />
              </div>
            </div>
          </div>
        </section>

        <section className="home-section-md">
          <div className="container">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <span className="brand-kicker">Our mission</span>
                <h2 className="font-display text-foreground mt-4 text-4xl leading-tight font-medium sm:text-5xl">
                  Make psychology education easier to enter — and harder to forget.
                </h2>
                <p className="text-muted-foreground mt-5 text-lg leading-8">
                  TMP offers certificate courses, diploma programs, workshops, internships, supervised learning, recorded courses, and personal support through a fully online platform.
                </p>
              </div>

              <div className="space-y-7 text-lg leading-8 text-muted-foreground">
                <p>
                  The aim is not to turn learning into a pile of notes or credentials. It is to help learners understand ideas clearly enough that they can recognise, discuss, reflect on, and eventually apply them with greater confidence.
                </p>
                <p>
                  We also want the learning environment itself to feel different: thoughtful rather than intimidating, structured without becoming rigid, and professional without losing warmth.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3">
                  <div className="brand-card rounded-[1.5rem] p-6">
                    <p className="font-display text-primary text-4xl font-medium">2020</p>
                    <p className="text-muted-foreground mt-2 text-sm">Founded</p>
                  </div>
                  <div className="brand-card rounded-[1.5rem] p-6">
                    <p className="font-display text-primary text-4xl font-medium">10,000+</p>
                    <p className="text-muted-foreground mt-2 text-sm">Learners reached</p>
                  </div>
                  <div className="brand-card col-span-2 rounded-[1.5rem] p-6 sm:col-span-1">
                    <p className="font-display text-primary text-4xl font-medium">Online</p>
                    <p className="text-muted-foreground mt-2 text-sm">Built for access across locations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="brand-section-dark home-section-md relative overflow-hidden">
          <div className="container relative z-10">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 max-w-3xl">
                <div className="flex items-center gap-4">
                  <span className="h-px w-12 bg-[#c7a768]" aria-hidden="true" />
                  <span className="text-xs font-semibold tracking-[0.28em] text-[#9fd0cf] uppercase">
                    What we do
                  </span>
                </div>
                <h2 className="font-display mt-5 text-4xl font-medium text-[#faf8f3] sm:text-5xl">
                  One ecosystem, different ways to learn and grow.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#c9dbd8]">
                  TMP is intentionally broader than a single course format, so students can move between learning, practice, professional development, and personal support.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SERVICES.map((service) => (
                  <div
                    key={service.title}
                    className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-sm"
                  >
                    <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-[#b9dedd]">
                      <service.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-2xl font-medium text-[#faf8f3]">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#c9dbd8]">
                      {service.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-section-md">
          <div className="container">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <span className="brand-kicker">What guides us</span>
                <h2 className="font-display text-foreground mt-4 text-4xl font-medium sm:text-5xl">
                  Three ideas behind the way TMP teaches.
                </h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {BELIEFS.map((belief) => (
                  <div key={belief.number} className="brand-card rounded-[1.8rem] p-7 sm:p-8">
                    <span className="font-display text-primary/40 text-2xl italic">
                      {belief.number}
                    </span>
                    <h3 className="font-display text-foreground mt-6 text-3xl leading-tight font-medium">
                      {belief.title}
                    </h3>
                    <p className="text-muted-foreground mt-4 leading-7">
                      {belief.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="brand-section-tint home-section-md border-y border-primary/5">
          <div className="container">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <span className="brand-kicker">Recognition</span>
                <h2 className="font-display text-foreground mt-4 text-4xl font-medium sm:text-5xl">
                  Accreditations & registrations
                </h2>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                {[
                  { name: "MSME", image: "/accreditions/msme.avif" },
                  { name: "IAOTH", image: "/accreditions/iaoth.avif" },
                  { name: "ISO 9001:2015", image: "/accreditions/iso.avif" },
                ].map((accreditation) => (
                  <div
                    key={accreditation.name}
                    className="brand-card flex min-h-36 w-56 flex-col items-center justify-center rounded-[1.6rem] p-6"
                  >
                    <Image
                      src={accreditation.image}
                      alt={`${accreditation.name} Logo`}
                      width={150}
                      height={72}
                      className="max-h-16 object-contain"
                    />
                    <p className="text-primary mt-4 text-xs font-semibold tracking-[0.16em] uppercase">
                      {accreditation.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-section-md">
          <div className="container">
            <div className="brand-panel mx-auto max-w-6xl overflow-hidden rounded-[2.4rem]">
              <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
                <div className="bg-[#0f4d4d] p-8 text-[#faf8f3] sm:p-10 lg:p-12">
                  <span className="text-xs font-semibold tracking-[0.28em] text-[#9fd0cf] uppercase">
                    Why learners choose TMP
                  </span>
                  <h2 className="font-display mt-5 text-4xl leading-tight font-medium sm:text-5xl">
                    Professional learning without losing the person inside it.
                  </h2>
                  <p className="mt-5 text-base leading-8 text-[#d6e3e0]">
                    The details matter: structure, affordability, materials, practical application, and feeling seen while you learn.
                  </p>
                </div>

                <div className="grid gap-x-8 gap-y-7 bg-[#fffdf9] p-8 sm:grid-cols-2 sm:p-10 lg:p-12">
                  {WHY_CHOOSE.map((feature) => (
                    <div key={feature.text} className="flex items-start gap-4">
                      <span className="bg-primary/8 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                        <feature.icon className="h-4 w-4" />
                      </span>
                      <p className="text-foreground pt-2 text-sm font-medium leading-6">
                        {feature.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
