import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

export default function ServerNavbar() {
  return (
    <nav className="bg-background/95 border-border sticky top-0 z-50 w-full border-b bg-gradient-to-br from-10% via-blue-100 to-blue-300 shadow-sm backdrop-blur-sm dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 dark:shadow-lg dark:shadow-black/20">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="The Mind Point"
              width={36}
              height={36}
              className="h-8 w-8 rounded-xl ring-1 ring-blue-200/70 sm:h-9 sm:w-9 dark:ring-blue-800/70"
            />
            <span className="bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-700 bg-clip-text text-base font-extrabold tracking-tight text-transparent sm:text-xl dark:from-blue-100 dark:via-blue-200 dark:to-indigo-200">
              The Mind Point
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="hidden md:flex">
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link
                  href="/courses"
                  className="text-foreground/70 transition-colors hover:text-blue-700 dark:hover:text-blue-200"
                >
                  Courses
                </Link>
                <Link
                  href="/about"
                  className="text-foreground/70 transition-colors hover:text-blue-700 dark:hover:text-blue-200"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-foreground/70 transition-colors hover:text-blue-700 dark:hover:text-blue-200"
                >
                  Contact
                </Link>
                <Link
                  href="/careers"
                  className="text-foreground/70 transition-colors hover:text-blue-700 dark:hover:text-blue-200"
                >
                  Careers
                </Link>
              </nav>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Placeholder for cart and auth - will be hydrated client-side */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button className="p-2">
                  <span className="sr-only">Shopping cart</span>
                  <svg
                    className="h-5 w-5"
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
              </div>

              <div className="bg-muted h-8 w-8 rounded-full"></div>
            </div>

            <button className="p-2 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
