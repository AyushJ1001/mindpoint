import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="relative z-20 mt-auto bg-[#0f2a28] text-[#f1ece0]"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="The Mind Point"
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl"
              />
              <span className="font-display text-lg font-medium tracking-[0.06em]">
                THE MIND POINT
              </span>
            </div>
            <p className="max-w-xs text-sm text-[#f1ece0]/65">
              Practical tools. Compassionate guidance. A more mindful tomorrow.
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                href="https://instagram.com/themindpoint?igshid=YmMyMTA2M2Y="
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-1.5 text-[0.65rem] tracking-[0.2em] uppercase transition-colors hover:border-white/50"
              >
                Instagram
              </Link>
              <Link
                href="https://www.facebook.com/themindpoint?mibextid=LQQJ4d"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-4 py-1.5 text-[0.65rem] tracking-[0.2em] uppercase transition-colors hover:border-white/50"
              >
                Facebook
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-[0.66rem] tracking-[0.28em] text-[#f1ece0]/50 uppercase">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/programs" className="hover:text-[#bcd6dd]">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#bcd6dd]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#bcd6dd]">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#bcd6dd]">
                  All courses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[0.66rem] tracking-[0.28em] text-[#f1ece0]/50 uppercase">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/community" className="hover:text-[#bcd6dd]">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/join" className="hover:text-[#bcd6dd]">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#bcd6dd]">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded border border-dashed border-white/25 bg-white/5 p-5 text-sm">
            <b className="text-[#bcd6dd]">In crisis?</b> Please reach out to a
            local helpline or emergency service right away. This platform is
            education and support — not emergency care.
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-[#f1ece0]/55">
          <span>
            Copyright &copy; {new Date().getFullYear()} The Mind Point. All
            rights reserved.
          </span>
          <span className="flex gap-4">
            <Link href="/toc" className="hover:text-[#bcd6dd]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#bcd6dd]">
              Privacy
            </Link>
            <Link href="/refund" className="hover:text-[#bcd6dd]">
              Refunds
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
