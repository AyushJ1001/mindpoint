import Link from "next/link";

const CATEGORIES = [
  {
    number: "01",
    title: "Certificate Courses",
    href: "/courses/certificate",
    desc: "Structured psychology learning with a credential you can build on.",
    note: "learn",
  },
  {
    number: "02",
    title: "Internship Programs",
    href: "/courses/internship",
    desc: "Hands-on practice with guidance, feedback, and real application.",
    note: "practise",
  },
  {
    number: "03",
    title: "Diploma Programs",
    href: "/courses/diploma",
    desc: "A deeper, longer learning journey for those ready to go further.",
    note: "advance",
  },
  {
    number: "04",
    title: "Pre-recorded Courses",
    href: "/courses/pre-recorded",
    desc: "Flexible self-paced modules you can return to whenever you need.",
    note: "self-paced",
  },
  {
    number: "05",
    title: "Masterclasses",
    href: "/courses/masterclass",
    desc: "Focused learning experiences built around one useful topic at a time.",
    note: "explore",
  },
  {
    number: "06",
    title: "Therapy Sessions",
    href: "/courses/therapy",
    desc: "A professional, supportive space to pause, understand, and move forward.",
    note: "support",
  },
  {
    number: "07",
    title: "Supervised Programs",
    href: "/courses/supervised",
    desc: "Guided feedback and structured practice for developing clinical confidence.",
    note: "supervision",
  },
  {
    number: "08",
    title: "Resume Studio",
    href: "/courses/resume-studio",
    desc: "Practical help presenting your psychology experience with clarity and confidence.",
    note: "career",
  },
];

export default function CoursesHero() {
  return (
    <>
      <section className="ss-hero">
        <div className="ss-wrap">
          <p className="ss-kicker">the academy · a field guide</p>
          <h1 className="ss-heading-xl">Learn it deeply. Use it confidently.</h1>
          <p className="ss-lead ss-dropcap mt-7 max-w-3xl">
            The Mind Point Academy brings courses, internships, diplomas,
            supervised learning and personal support into one organised place.
            Start with the depth and format that fit you now. You can always go
            further later.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-4">
            <a href="#all-programmes" className="ss-link">
              browse everything <span aria-hidden="true">›</span>
            </a>
            <Link href="/contact" className="ss-link">
              ask what fits you <span aria-hidden="true">›</span>
            </Link>
          </div>

          <div className="ss-stat-grid mt-12 lg:mt-16">
            <div className="ss-stat">
              <strong>8</strong>
              <span>ways to learn or get support</span>
            </div>
            <div className="ss-stat">
              <strong>Live</strong>
              <span>cohorts and guided learning</span>
            </div>
            <div className="ss-stat">
              <strong>Self-paced</strong>
              <span>for flexible schedules</span>
            </div>
            <div className="ss-stat">
              <strong>Online</strong>
              <span>accessible across locations</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ss-section" id="all-programmes">
        <div className="ss-wrap">
          <p className="ss-kicker">pick the depth that fits</p>
          <h2 className="ss-heading-lg">The ways in.</h2>
          <p className="ss-lead mt-5 max-w-3xl">
            Start with the format, goal or stage that feels most useful. Every
            path below leads into the same TMP learning ecosystem.
          </p>

          <div className="ss-row-list mt-10">
            {CATEGORIES.map((category) => (
              <Link href={category.href} key={category.href} className="ss-row group">
                <span className="ss-row-date">{category.number} · {category.note}</span>
                <span className="ss-row-title">{category.title}</span>
                <span className="ss-row-meta">{category.desc}</span>
                <span className="text-sm text-[#0f4d4d] transition-transform group-hover:translate-x-1" aria-hidden="true">
                  ›
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
