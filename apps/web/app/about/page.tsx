import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Users,
  BookOpen,
  Award,
  Heart,
  Target,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { LeafAccent } from "@/components/illustrations";

export const metadata = {
  title: "About Us - The Mind Point",
  description:
    "Learn about The Mind Point's mission to transform mental health education through compassionate, evidence-based programs and professional development courses.",
  keywords:
    "about us, mental health education, psychology courses, professional development, The Mind Point mission",
  openGraph: {
    title: "About Us - The Mind Point",
    description:
      "Learn about The Mind Point's mission to transform mental health education.",
    type: "website",
  },
};

// Structured data for the organization
const aboutStructuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "The Mind Point",
  description:
    "A platform for mental health education and support, offering comprehensive courses in psychology, counseling, and professional development.",
  url: "https://themindpoint.org",
  logo: "https://themindpoint.org/logo.png",
  foundingDate: "2020",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "English",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Mental Health Education Courses",
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
  numberOfEmployees: "50+",
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
      "Comprehensive programs in counselling, therapy, and psychology-related disciplines",
  },
  {
    icon: Users,
    title: "Live Online Classes",
    description:
      "Interactive sessions led by trained mental health professionals",
  },
  {
    icon: BookOpen,
    title: "Self-Paced Courses",
    description:
      "Pre-recorded courses for flexible, independent learning",
  },
  {
    icon: Target,
    title: "Supervised Internships",
    description:
      "Practical experience to help students apply theory to practice",
  },
  {
    icon: Lightbulb,
    title: "Workshops & Masterclasses",
    description: "Explore therapeutic tools, trends, and innovations",
  },
  {
    icon: Heart,
    title: "Personal Growth",
    description:
      "Programs focused on healing and personal development",
  },
];

const WHY_CHOOSE = [
  { icon: Globe, text: "Certificates accepted globally" },
  { icon: BookOpen, text: "Practical Application along with Theory" },
  { icon: Users, text: "Personal Attention" },
  { icon: Target, text: "Job Opportunities" },
  { icon: Award, text: "Affordable Prices & Discount Offers" },
  { icon: Heart, text: "Case Studies" },
  { icon: Lightbulb, text: "Detailed Study Material" },
  { icon: CheckCircle, text: "Recording for the Lectures" },
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
      <div className="min-h-screen">
        {/* Hero Section – community.jpg as subtle backdrop */}
        <section className="section-padding relative overflow-hidden from-primary/5 via-background to-accent/5 bg-gradient-to-br">
          <Image
            src="/illustrations/community.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.08] mix-blend-multiply dark:mix-blend-screen dark:opacity-[0.05]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" aria-hidden="true" />
          <div className="relative z-10 container">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="from-primary to-primary/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                About The Mind Point
              </h1>
              <p className="text-muted-foreground text-xl leading-relaxed">
                We&apos;re more than just an organization — we&apos;re a
                compassionate, curious, and creative community committed to
                transforming the way mental health education is experienced.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="section-padding">
          <div className="container max-w-6xl">
            {/* Mission – text + illustration, no stat cards */}
            <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We specialize in online psychological education, offering a
                  rich blend of certificate courses, diploma programs,
                  workshops, internships, and training experiences that are
                  rooted in both scientific rigor and human warmth.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform is designed to be inclusive, accessible, and
                  deeply engaging — where learning feels like a meaningful
                  conversation over a cup of tea.
                </p>

                {/* Stats as simple inline items, not cards */}
                <div className="mt-8 flex flex-wrap gap-8">
                  <div>
                    <p className="text-foreground text-3xl font-bold">10000+</p>
                    <p className="text-muted-foreground text-sm">
                      Students enrolled
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground text-3xl font-bold">50+</p>
                    <p className="text-muted-foreground text-sm">
                      Courses Available
                    </p>
                  </div>
                </div>
              </div>
              <div />
              {/* Community illustration moved to hero backdrop */}
            </div>

            <Separator className="my-16" />

            {/* What We Do – alternating feature rows instead of card grid */}
            <div className="mb-16">
              <h2 className="mb-12 text-center text-3xl font-bold">
                What We Do
              </h2>
              <div className="mx-auto max-w-3xl space-y-8">
                {SERVICES.map((service, index) => {
                  const isReversed = index % 2 !== 0;
                  return (
                    <div
                      key={index}
                      className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6 ${
                        isReversed ? "sm:flex-row-reverse" : ""
                      }`}
                    >
                      <div className="bg-primary/8 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                        <service.icon className="text-primary h-6 w-6" />
                      </div>
                      <div className={isReversed ? "sm:text-right" : ""}>
                        <h3 className="text-foreground font-semibold">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator className="my-16" />

            {/* Core Beliefs */}
            <div className="mb-16">
              <h2 className="mb-12 text-center text-3xl font-bold">
                Our Core Beliefs
              </h2>
              <div className="mx-auto max-w-3xl space-y-6">
                {[
                  "Mental health education should be accessible and joyful",
                  "Learning should feel safe, engaging, and inspiring",
                  "Psychology isn't just something to study — it's something to live, explore, and celebrate",
                ].map((belief, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <CheckCircle className="text-primary mt-1 h-6 w-6 flex-shrink-0" />
                    <p className="text-muted-foreground">{belief}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-16" />

            {/* Accreditations – keep images but no card wrappers */}
            <div className="mb-16">
              <h2 className="mb-12 text-center text-3xl font-bold">
                Our Accreditations
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-12">
                {[
                  { name: "MSME", image: "/accreditions/msme.avif" },
                  { name: "IAOTH", image: "/accreditions/iaoth.avif" },
                  { name: "ISO 9001:2015", image: "/accreditions/iso.avif" },
                ].map((accreditation, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-4"
                  >
                    <Image
                      src={accreditation.image}
                      alt={`${accreditation.name} Logo`}
                      width={160}
                      height={80}
                      className="object-contain"
                    />
                    <p className="text-muted-foreground text-sm font-medium">
                      {accreditation.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Choose Us – icon items in clean grid, no cards */}
            <div className="relative rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:p-12">
              <h2 className="mb-12 text-center text-3xl font-bold">
                Why Choose The Mind Point?
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {WHY_CHOOSE.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-primary/8 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full">
                      <feature.icon className="text-primary h-7 w-7" />
                    </div>
                    <p className="text-foreground font-medium">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Decorative accents */}
              <LeafAccent className="pointer-events-none absolute top-4 right-6 hidden h-10 w-10 rotate-[20deg] opacity-40 lg:block" />
              <LeafAccent className="pointer-events-none absolute bottom-4 left-6 hidden h-8 w-8 -rotate-[30deg] opacity-30 lg:block" />
            </div>

          </div>
        </section>
      </div>
    </>
  );
}
