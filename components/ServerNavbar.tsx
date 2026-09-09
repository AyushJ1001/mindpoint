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
          <img
            src="/tmp-wordmark-reference.svg"
            alt="The Mind Point"
            className="h-8 w-auto max-w-[10rem] object-contain sm:h-9 sm:max-w-[11rem]"
          />
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
