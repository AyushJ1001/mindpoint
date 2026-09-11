import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

export default function ServerNavbar() {
  return (
    <nav
      data-app-navbar
      className="border-border bg-background/95 text-foreground sticky top-0 z-50 w-full border-b backdrop-blur-xl"
    >
      <Link
        href="/learning-portal"
        className="bg-primary text-primary-foreground flex min-h-8 items-center justify-center px-4 py-2 text-center text-[0.62rem] font-bold tracking-[0.18em] uppercase"
      >
        The TMP Learning Portal · Courses, resources and progress in one
        place&nbsp; →
      </Link>
      <div className="container flex min-h-18 items-center py-2.5">
        <Link
          href="/"
          className="mr-6 flex min-w-0 items-center"
          aria-label="The Mind Point home"
        >
          <Image
            src="/tmp-botanical-mark.webp"
            alt="The Mind Point"
            width={80}
            height={60}
            priority
            className="h-12 w-16 shrink-0 object-contain mix-blend-multiply dark:mix-blend-screen dark:grayscale dark:invert"
          />
          <span className="text-foreground ml-2.5 hidden text-[0.65rem] font-semibold tracking-[0.2em] uppercase sm:block">
            The Mind Point
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex">
            <nav className="flex items-center space-x-7 text-[0.78rem] font-semibold tracking-[0.06em] uppercase">
              <Link
                href="/courses"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Programs
              </Link>
              <Link
                href="/learning-portal"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Learning Portal
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/careers"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Careers
              </Link>
            </nav>
          </div>

          <Link
            href="/courses"
            className="bg-primary text-primary-foreground hidden min-h-10 items-center rounded-full px-5 text-[0.68rem] font-bold tracking-[0.08em] uppercase xl:inline-flex"
          >
            Find your path
          </Link>

          <button className="border-border bg-card text-foreground ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm">
            <span className="sr-only">Shopping cart</span>
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
              />
            </svg>
          </button>

          <button className="border-border bg-card text-foreground inline-flex h-9 w-9 items-center justify-center rounded-full border md:hidden">
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
