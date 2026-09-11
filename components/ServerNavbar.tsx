import Link from "next/link";
import { Menu } from "lucide-react";

function TmpWordmark() {
  return (
    <div
      className="flex items-center whitespace-nowrap text-[#123f3e]"
      aria-label="The Mind Point"
    >
      <div className="relative mr-4 flex h-12 items-center">
        <span
          className="font-display text-[2.75rem] font-medium leading-none tracking-[-0.075em]"
          style={{ fontFamily: "var(--font-syne), Georgia, serif" }}
        >
          TMP
        </span>
        <svg
          viewBox="0 0 48 46"
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-1 h-10 w-10"
        >
          <path
            d="M22 31 C23 23 24 15 25 5"
            fill="none"
            stroke="#667f74"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M25 12 C18 11 13 7 12 2 C19 2 24 5 28 10 C27 11 26 12 25 12 Z"
            fill="#90A49A"
          />
          <path
            d="M27 16 C34 13 39 9 40 4 C33 4 28 7 24 13 C25 14 26 15 27 16 Z"
            fill="#CDBB95"
          />
        </svg>
      </div>

      <span className="text-[0.88rem] font-medium tracking-[0.36em] text-[#163f3e] sm:text-[0.93rem]">
        THE MIND POINT
      </span>
    </div>
  );
}

export default function ServerNavbar() {
  return (
    <nav
      data-app-navbar
      className="sticky top-0 z-50 w-full border-b border-[#0f4d4d]/8 bg-[#fbfaf6]/96 backdrop-blur-xl"
    >
      <div className="container flex h-[4.65rem] items-center">
        <Link
          href="/"
          className="mr-8 flex min-w-0 items-center"
          aria-label="The Mind Point home"
        >
          <TmpWordmark />
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex">
            <nav className="flex items-center space-x-7 text-[0.78rem] font-semibold tracking-[0.06em] uppercase">
              <Link href="/courses" className="text-[#173f3d]/70 transition-colors hover:text-[#0f4d4d]">
                Programs
              </Link>
              <Link href="/about" className="text-[#173f3d]/70 transition-colors hover:text-[#0f4d4d]">
                About
              </Link>
              <Link href="/contact" className="text-[#173f3d]/70 transition-colors hover:text-[#0f4d4d]">
                Contact
              </Link>
              <Link href="/careers" className="text-[#173f3d]/70 transition-colors hover:text-[#0f4d4d]">
                Careers
              </Link>
            </nav>
          </div>

          <button className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#0f4d4d]/10 bg-white/70 text-[#173f3d] shadow-sm">
            <span className="sr-only">Shopping cart</span>
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
            </svg>
          </button>

          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#0f4d4d]/10 bg-white/70 text-[#173f3d] md:hidden">
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
