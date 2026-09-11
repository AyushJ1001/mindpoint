import Link from "next/link";

export default function Footer() {
  return (
    <footer className="ss-footer mt-auto" role="contentinfo" aria-label="Footer">
      <div className="ss-footer-newsletter">
        <div className="ss-wrap">
          <p className="ss-kicker">not sure where to start?</p>
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2>Find the part of psychology that feels useful right now.</h2>
              <p className="ss-lead mt-5 max-w-2xl">
                Browse the Academy, ask us about a programme, or begin with the
                learning format that fits your life today.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 lg:justify-end">
              <Link href="/courses" className="ss-link">
                explore the Academy <span aria-hidden="true">›</span>
              </Link>
              <Link href="/contact" className="ss-link">
                talk to TMP <span aria-hidden="true">›</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="ss-wrap">
        <div className="ss-footer-grid">
          <div>
            <h3 className="text-3xl">The Mind Point</h3>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#65736f]">
              Psychology education, practical training and personal support built
              to make serious learning feel clearer, warmer and more accessible.
            </p>
            <p className="mt-5 text-sm font-medium">Learn · Grow · Heal · Belong.</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a
                href="https://instagram.com/themindpoint?igshid=YmMyMTA2M2Y="
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/themindpoint?mibextid=LQQJ4d"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            </div>
          </div>

          <div>
            <h4>learn</h4>
            <ul>
              <li><Link href="/courses">The Academy</Link></li>
              <li><Link href="/courses/certificate">Certificate Courses</Link></li>
              <li><Link href="/courses/diploma">Diploma Programs</Link></li>
              <li><Link href="/courses/internship">Internships</Link></li>
              <li><Link href="/courses/masterclass">Masterclasses</Link></li>
              <li><Link href="/courses/pre-recorded">Self-paced Learning</Link></li>
            </ul>
          </div>

          <div>
            <h4>support & practise</h4>
            <ul>
              <li><Link href="/courses/supervised">Supervised Programs</Link></li>
              <li><Link href="/courses/therapy">Therapy & Counselling</Link></li>
              <li><Link href="/courses/resume-studio">Resume Studio</Link></li>
              <li><Link href="/account">Your Registrations</Link></li>
              <li><Link href="/contact">Contact TMP</Link></li>
            </ul>
          </div>

          <div>
            <h4>company</h4>
            <ul>
              <li><Link href="/about">Our Story</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/toc">Terms & Conditions</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/refund">Refund Policy</Link></li>
            </ul>
            <a
              href="mailto:contact.themindpoint@gmail.com"
              className="mt-6 inline-block text-sm"
            >
              contact.themindpoint@gmail.com
            </a>
          </div>
        </div>

        <div className="ss-footer-legal">
          <p>
            © {new Date().getFullYear()} The Mind Point. All rights reserved.
          </p>
          <p className="max-w-3xl">
            TMP courses and trainings are educational programmes. They build
            knowledge and skills but do not replace statutory degrees, licences,
            registrations, or other legal requirements that may apply to independent
            professional practice.
          </p>
        </div>
      </div>
    </footer>
  );
}
