import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="relative z-20 mt-auto overflow-hidden border-t border-[#315d5a] bg-[#0f4d4d] text-[#faf8f3]"
      role="contentinfo"
      aria-label="Footer"
    >
      <div
        className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full border border-[#9fd0cf]/10"
        aria-hidden="true"
      />
      <div className="relative container py-16 sm:py-20">
        <div className="mb-16 border-b border-white/10 pb-14">
          <p className="text-[0.66rem] font-bold tracking-[0.26em] text-[#9fd0cf] uppercase">
            Begin where you are
          </p>
          <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="font-display max-w-4xl text-5xl leading-[0.9] font-medium tracking-[-0.045em] text-[#faf8f3] sm:text-6xl lg:text-7xl">
              A kinder, brighter way to
              <span className="block text-[#b9dedd] italic">
                learn, grow and heal.
              </span>
            </p>
            <Link
              href="/courses"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#faf8f3] px-7 text-xs font-bold tracking-[0.08em] text-[#0f4d4d] uppercase hover:bg-white"
            >
              Find your path&nbsp; →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-[#c7a768]" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-[0.24em] text-[#9fd0cf] uppercase">
                Learn · Grow · Heal · Belong
              </span>
            </div>
            <h3 className="font-display mt-5 text-5xl font-medium tracking-tight text-[#faf8f3]">
              The Mind Point
            </h3>
            <p className="mt-4 max-w-xl leading-7 text-[#cfddda]">
              Psychology education, practical training, and personal support
              designed to make learning feel serious, accessible, and human.
            </p>
            <a
              href="mailto:contact.themindpoint@gmail.com"
              className="mt-5 inline-block text-sm font-semibold text-[#f0d9a8] hover:text-white"
            >
              contact.themindpoint@gmail.com
            </a>
            <div className="mt-7 flex gap-3">
              <Link
                href="https://instagram.com/themindpoint?igshid=YmMyMTA2M2Y="
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:-translate-y-0.5 hover:bg-white/10"
                aria-label="Follow us on Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="h-5 w-5 text-[#faf8f3]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link
                href="https://www.facebook.com/themindpoint?mibextid=LQQJ4d"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:-translate-y-0.5 hover:bg-white/10"
                aria-label="Follow us on Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="h-5 w-5 text-[#faf8f3]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold tracking-[0.2em] text-[#9fd0cf] uppercase">
              Explore
            </h4>
            <ul className="space-y-3 text-[#d8e4e1]">
              <li>
                <Link href="/courses" className="hover:text-white">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/learning-portal" className="hover:text-white">
                  Learning Portal
                </Link>
              </li>
              <li>
                <Link href="/courses/therapy" className="hover:text-white">
                  Personal Support
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white">
                  About TMP
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold tracking-[0.2em] text-[#9fd0cf] uppercase">
              Policies
            </h4>
            <ul className="space-y-3 text-[#d8e4e1]">
              <li>
                <Link href="/toc" className="hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-sm text-[#afc8c4] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright &copy; {new Date().getFullYear()} The Mind Point. All
            rights reserved.
          </p>
          <p>A kinder, brighter tomorrow.</p>
        </div>
      </div>
    </footer>
  );
}
