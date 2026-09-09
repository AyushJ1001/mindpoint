import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

export default function ServerNavbar() {
  return (
    <nav
      data-app-navbar
      className="sticky top-0 z-50 w-full border-b border-primary/10 bg-[#fffdf9]/95 backdrop-blur-xl"
    >
      <div className="container flex h-[4.75rem] items-center">
        <Link
          href="/"
          className="mr-6 flex min-w-0 items-center gap-3"
          aria-label="The Mind Point home"
        >
          <div className="flex h-14 w-[5.6rem] items-center justify-center overflow-hidden">
            <Image
              src="/tmp-botanical-logo.svg"
              alt="The Mind Point logo"
              width={110}
              height={70}
              className="h-[4.3rem] w-[6.7rem] max-w-none object-contain"
              priority
            />
          </div>
          <div className="hidden min-w-0 sm:block">
            <div className="font-display text-[1.55rem] leading-none font-medium tracking-[-0.03em] text-[#173f3d]">
              The Mind Point
            </div>
            <div className="mt-1 text-[0.58rem] font-semibold tracking-[0.21em] text-[#0f4d4d]/60 uppercase">
              Learn · Grow · Heal · Belong
            </div>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex">
            <nav className="flex items-center space-x-7 text-[0.82rem] font-semibold tracking-[0.06em] uppercase">
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

          <button className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/10 bg-white/70 text-[#173f3d] shadow-sm">
            <span className="sr-only">Shopping cart</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
            </svg>
          </button>

          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/10 bg-white/70 text-[#173f3d] md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
