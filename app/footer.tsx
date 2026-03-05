import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-border z-10 mt-auto border-t bg-gradient-to-b from-blue-100/55 via-white/90 to-indigo-100/55 dark:from-slate-950 dark:via-blue-950/65 dark:to-slate-950"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="container py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-10 rounded-[1.6rem] border border-blue-200/70 bg-white/75 p-6 shadow-[0_24px_45px_-30px_rgba(37,99,235,0.9)] backdrop-blur sm:p-8 md:grid-cols-4 dark:border-blue-900/45 dark:bg-slate-950/65">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h3 className="mb-4 bg-gradient-to-r from-blue-950 via-blue-700 to-indigo-600 bg-clip-text text-3xl font-semibold tracking-tight text-transparent dark:from-blue-100 dark:via-blue-200 dark:to-indigo-200">
              The Mind Point
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg leading-relaxed">
              Empowering minds through comprehensive mental health education and
              professional development. Join our community of learners and
              professionals dedicated to mental wellness.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://instagram.com/themindpoint?igshid=YmMyMTA2M2Y="
                className="transition-smooth inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-200/80 bg-white/80 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800/80 dark:bg-blue-950/55 dark:hover:border-blue-700 dark:hover:bg-blue-900/55"
                aria-label="Follow us on Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="text-primary h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link
                href="https://www.facebook.com/themindpoint?mibextid=LQQJ4d"
                className="transition-smooth inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-200/80 bg-white/80 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800/80 dark:bg-blue-950/55 dark:hover:border-blue-700 dark:hover:bg-blue-900/55"
                aria-label="Follow us on Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="text-primary h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-[0.14em] text-blue-700 uppercase dark:text-blue-300">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Careers - Join Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-[0.14em] text-blue-700 uppercase dark:text-blue-300">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/toc"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border mt-8 border-t pt-8 text-center">
          <p className="text-muted-foreground">
            Copyright © {new Date().getFullYear()} The Mind Point. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
