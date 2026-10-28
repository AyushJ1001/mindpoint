import { openGraphImage } from "@/lib/seo";
import { PageHero } from "@/components/coastal/PageHero";
import { ctaVariants } from "@/components/coastal/cta";
import { eyebrowVariants } from "@/components/coastal/eyebrow";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About The Mind Point",
  description:
    "The Mind Point is a psychology education company in India, founded in 2020. Live certificate courses, an internship and introduction courses, taught with warmth and rigour.",
  keywords:
    "about TheMind Point, psychology education India, psychology courses, mental health training",
  openGraph: {
    images: [openGraphImage],
    title: "About The Mind Point",
    description:
      "A space to learn, explore and grow — psychology education taught with warmth and rigour.",
    type: "website",
  },
  alternates: { canonical: "/about" },
};

const APPROACH = [
  {
    title: "Understanding before performance",
    copy: "We start with why an idea holds up, where it comes from and where it stops being useful, so the vocabulary means something once you use it.",
  },
  {
    title: "Live teaching, small groups",
    copy: "Classes are live and conversational. Questions are part of the session, not a support ticket afterwards.",
  },
  {
    title: "Practice in the room",
    copy: "The final two weeks of a certificate course are practical: faculty-curated exercises, case discussion and feedback on your reasoning.",
  },
  {
    title: "Materials worth keeping",
    copy: "Each week comes with reading notes written for the course, not a slide deck, and eligible new enrolments can revisit the recordings.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            A Space to Learn, <em className="italic">Explore and Grow.</em>
          </>
        }
        lead="The Mind Point is a psychology education company in India, founded in 2020, for students, career changers and practising professionals who want to understand the mind deeply."
        image="/coastal/shore.jpg"
        imageAlt="A quiet shoreline at sunrise, seen from the water's edge."
        caption="A quiet shoreline at sunrise."
      />

      {/* ── Our story ── */}
      <section className="container grid gap-12 pb-20 lg:grid-cols-2">
        <div>
          <span className={eyebrowVariants()}>Our story</span>
          <h2 className="font-display mt-4 text-3xl leading-tight tracking-tight sm:text-5xl">
            Founded in 2020, built around one idea.
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground text-lg leading-8">
            The Mind Point was founded with a simple vision: to make meaningful
            psychology education accessible, engaging and deeply connected to
            real understanding.
          </p>
          <p className="text-muted-foreground text-lg leading-8">
            We believe learning psychology should be more than memorising
            concepts. It should encourage curiosity, thoughtful reflection and
            the ability to connect knowledge with practical situations.
          </p>
          <p className="text-muted-foreground text-lg leading-8">
            Through our certificate courses, internships and learning
            experiences, we bring together students, aspiring professionals and
            lifelong learners who share a curiosity about the human mind.
          </p>
        </div>
      </section>

      <hr className="border-border container border-0 border-t border-dashed" />

      {/* ── Vision ── */}
      <section className="container py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded">
            <Image
              src="/coastal/wave.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <span className={eyebrowVariants()}>Our vision</span>
            <h2 className="font-display mt-4 text-3xl leading-tight tracking-tight sm:text-4xl">
              Teaching that stays with you, long after the eight weeks.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl leading-8">
              We want psychology education that feels calm rather than
              intimidating, rigorous rather than abstract, and useful in the
              room where you will actually sit with a person. Our courses are
              built for that moment: the point where a concept becomes something
              you can hold in practice.
            </p>
          </div>
        </div>
      </section>

      {/* ── Approach ── */}
      <section className="bg-secondary py-20 sm:py-24">
        <div className="container">
          <span className={eyebrowVariants()}>Our approach to learning</span>
          <h2 className="font-display mt-4 max-w-2xl text-3xl tracking-tight sm:text-5xl">
            Six weeks of understanding. Two weeks of application.
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {APPROACH.map((item) => (
              <div key={item.title} className="border-border border-t pt-4">
                <b className="font-display block text-lg leading-snug font-medium">
                  {item.title}
                </b>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-10 max-w-2xl text-sm leading-relaxed">
            Certificate courses run for eight weeks, live online, with a
            certificate of completion at the end. They document what you
            completed; they are not a degree, a licence or a statutory
            registration.
          </p>
        </div>
      </section>

      {/* ── Community ── */}
      <section className="container py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className={eyebrowVariants()}>Our learning community</span>
            <h2 className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
              Curious minds, from many starting points.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl leading-8">
              Our learners arrive from psychology degrees, allied fields and
              entirely different careers, and from institutions across India.
              What they share is an interest in understanding people well. Live,
              small-group teaching is what makes that mix work: it stays
              conversational, and questions are welcome.
            </p>
          </div>
          <ul className="text-muted-foreground space-y-3 self-end text-sm leading-relaxed">
            <li className="border-border border-t pt-3">
              Students and graduates of psychology
            </li>
            <li className="border-border border-t pt-3">
              Professionals moving toward mental-health work
            </li>
            <li className="border-border border-t pt-3">
              Practising counsellors refreshing their foundations
            </li>
            <li className="border-border border-t pt-3">
              Lifelong learners drawn to how the mind works
            </li>
          </ul>
        </div>
      </section>

      {/* ── Courses ── */}
      <section className="bg-section-ivory py-20 sm:py-24">
        <div className="container flex flex-col items-start gap-6 sm:items-center sm:text-center">
          <span className={eyebrowVariants()}>Explore our courses</span>
          <h2 className="font-display max-w-2xl text-3xl tracking-tight sm:text-4xl">
            Three live certificates start in January 2027.
          </h2>
          <p className="text-muted-foreground max-w-xl leading-relaxed">
            CBT, REBT and CBMT; Personality Disorders; and Inner Child Healing
            &amp; Therapy. Each runs eight weeks, live on Tuesdays and Thursdays,
            with introduction courses available at ₹999 if you would like to
            begin more gently.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/programs" className={ctaVariants()}>
              Explore certificate courses →
            </Link>
            <Link
              href="/courses/intro"
              className="border-primary/30 text-primary hover:bg-primary/5 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase"
            >
              ₹999 introduction courses
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="border-border flex flex-wrap items-center justify-between gap-4 border-t border-dashed pt-6 text-[0.72rem] font-semibold tracking-[0.2em] uppercase">
          <Link href="/programs" className="text-primary">
            Next · Programs →
          </Link>
          <Link href="/join" className="text-primary">
            Join us →
          </Link>
        </div>
      </section>
    </>
  );
}
