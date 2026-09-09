import Link from "next/link";
import { Menu } from "lucide-react";

export default function ServerNavbar() {
  return (
    <nav
      data-app-navbar
      className="sticky top-0 z-50 w-full border-b border-[#0f4d4d]/8 bg-[#fbfaf6]/96 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center">
        <Link
          href="/"
          className="mr-6 flex min-w-0 items-center"
          aria-label="The Mind Point home"
        >
          <svg
            viewBox="0 0 260 64"
            role="img"
            aria-label="The Mind Point logo"
            className="h-11 w-[11.5rem] shrink-0"
          >
            <g fill="#0F4D4D">
              <text
                x="0"
                y="38"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize="40"
                fontWeight="500"
                letterSpacing="-3"
              >
                TMP
              </text>
              <path d="M79 10 C89 1 101 2 108 9 C98 13 89 18 82 25 C82 19 81 14 79 10 Z" />
              <path
                d="M102 9 C110 3 119 5 124 12 C116 14 109 18 103 24 C103 18 103 13 102 9 Z"
                fill="#D9C6AE"
              />
              <path
                d="M93 11 C95 18 95 24 93 31"
                fill="none"
                stroke="#0F4D4D"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </g>
            <text
              x="78"
              y="47"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="10"
              letterSpacing="3.1"
              fill="#173F3D"
            >
              THE MIND POINT
            </text>
          </svg>
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
