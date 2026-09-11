import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "About The Mind Point",
  description:
    "Learn about The Mind Point's approach to accessible, practical, and human psychology education, professional development, and mental health support.",
};

const aboutStructuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "The Mind Point",
  description:
    "A platform for mental health education and support, offering courses in psychology, counseling, and professional development.",
  url: "https://themindpoint.org",
  foundingDate: "2020",
  address: { "@type": "PostalAddress", addressCountry: "IN" },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "contact.themindpoint@gmail.com",
    availableLanguage: "English",
  },
};

const beliefs = [
  {
    number: "01",
    title: "Safe enough to ask.",
    text: "Psychology becomes more meaningful when students can be curious, uncertain and reflective without feeling intimidated by the learning space.",
  },
  {
    number: "02",
    title: "Useful beyond the notes.",
    text: "Concepts should become easier to recognise in people, cases, relationships and everyday life — not stay trapped in definitions.",
  },
  {
    number: "03",
    title: "Professional can still feel human.",
    text: "Credibility and compassion do not have to compete. TMP is designed to hold both at the same time.",
  },
];

const work = [
  ["Certificate & diploma programmes", "Structured learning for depth, application and professional confidence."],
  ["Live online learning", "Interactive classes that make room for questions, discussion and reflection."],
  ["Self-paced courses", "Flexible recorded learning for students who need to move on their own schedule."],
  ["Internships & supervised practice", "Applied learning that helps bridge psychology theory and real-world work."],
  ["Workshops & masterclasses", "Focused learning around useful tools, topics and emerging areas."],
  ["Personal growth & support", "Spaces for healing, self-understanding, counselling and emotional growth."],
];

export default function About() {
  return (
    <div className="ss-page tmp-about-page">
      <Script
        id="about-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutStructuredData) }}
      />

      <section className="ss-hero">
        <div className="ss-wrap">
          <div className="ss-hero-grid">
            <div>
              <p className="ss-kicker">our story · since 2020</p>
              <h1 className="ss-heading-xl">Psychology education that feels serious and human.</h1>
              <p className="ss-lead ss-dropcap mt-7">
                The Mind Point is an online learning and support space built around
                one belief: people learn psychology best when depth, practical
                application, accessibility and warmth are allowed to exist together.
              </p>
              <div className="mt-7 flex flex-wrap gap-x-7 gap-y-4">
                <Link href="/courses" className="ss-link">
                  explore our programmes <span aria-hidden="true">›</span>
                </Link>
                <Link href="/contact" className="ss-link">
                  talk to TMP <span aria-hidden="true">›</span>
                </Link>
              </div>
            </div>

            <div className="ss-hero-image">
              <Image
                src="/illustrations/hope.jpg"
                alt="A calm space representing The Mind Point approach"
                fill
                className="object-cover"
                sizes="(max-width: 980px) 100vw, 42vw"
              />
            </div>
          </div>

          <div className="ss-stat-grid mt-12 lg:mt-16">
            <div className="ss-stat"><strong>2020</strong><span>founded</span></div>
            <div className="ss-stat"><strong>10,000+</strong><span>learners reached</span></div>
            <div className="ss-stat"><strong>Online</strong><span>built for access across locations</span></div>
            <div className="ss-stat"><strong>India</strong><span>psychology learning & support</span></div>
          </div>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <p className="ss-kicker">the idea</p>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <h2 className="ss-heading-lg">Make psychology easier to enter — and harder to forget.</h2>
            <div className="space-y-6 text-[1.05rem] leading-8 text-[#65736f]">
              <p>
                TMP offers certificate courses, diploma programmes, workshops,
                internships, supervised learning, recorded courses and personal
                support through a fully online platform.
              </p>
              <p>
                The aim is not to turn learning into a pile of notes or credentials.
                It is to help learners understand ideas clearly enough that they can
                recognise, discuss, reflect on and eventually apply them with greater
                confidence.
              </p>
              <p>
                We also want the learning environment itself to feel different:
                thoughtful rather than intimidating, structured without becoming
                rigid, and professional without losing warmth.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <p className="ss-kicker">what we do</p>
          <h2 className="ss-heading-lg">One ecosystem, different ways to learn and grow.</h2>
          <div className="ss-row-list mt-10">
            {work.map(([title, text], index) => (
              <div className="ss-row" key={title}>
                <span className="ss-row-date">0{index + 1}</span>
                <span className="ss-row-title">{title}</span>
                <span className="ss-row-meta">{text}</span>
                <span aria-hidden="true">·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ss-band ss-section">
        <div className="ss-wrap">
          <p className="ss-kicker">what guides us</p>
          <h2 className="ss-heading-lg">Three ideas behind the way TMP teaches.</h2>
          <div className="ss-steps">
            {beliefs.map((belief) => (
              <article className="ss-step" key={belief.number}>
                <span className="ss-step-label">{belief.number}</span>
                <h3>{belief.title}</h3>
                <p className="!text-[#dce8e5]">{belief.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <p className="ss-kicker">recognition</p>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
            <h2 className="ss-heading-lg">Registrations & accreditations.</h2>
            <p className="ss-lead">
              TMP maintains formal registrations and quality recognitions that sit
              alongside the learning experience itself.
            </p>
          </div>

          <div className="mt-10 grid border-y border-[#163f3d]/20 sm:grid-cols-3">
            {[
              { name: "MSME", image: "/accreditions/msme.avif" },
              { name: "IAOTH", image: "/accreditions/iaoth.avif" },
              { name: "ISO 9001:2015", image: "/accreditions/iso.avif" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex min-h-52 flex-col items-center justify-center border-b border-[#163f3d]/20 p-8 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
              >
                <Image
                  src={item.image}
                  alt={`${item.name} logo`}
                  width={160}
                  height={80}
                  className="max-h-16 object-contain"
                />
                <p className="mt-5 text-xs font-semibold tracking-[0.08em] text-[#0f4d4d]">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ss-section">
        <div className="ss-wrap">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="ss-kicker">where it leads</p>
              <h2 className="ss-heading-lg">Learn. Grow. Heal. Belong.</h2>
              <p className="ss-lead mt-5">
                Whether you arrive as a psychology student, a developing
                professional, or simply someone trying to understand yourself more
                clearly, there is a place to begin.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex border border-[#0f4d4d] bg-[#0f4d4d] px-6 py-4 text-sm font-semibold text-[#faf8f3]"
            >
              enter the Academy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
