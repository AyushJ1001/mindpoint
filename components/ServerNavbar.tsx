import Link from "next/link";
import Image from "next/image";

const PRIMARY = [
  { href: "/courses", label: "Courses" },
  { href: "/programs", label: "Programs" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
];

export default function ServerNavbar() {
  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="border-border bg-background/90 sticky top-0 z-50 border-b backdrop-blur-md"
    >
      <div className="mx-auto flex h-[60px] w-full max-w-[1200px] items-center gap-3 px-4 sm:px-6">
        <span
          aria-hidden="true"
          className="text-foreground -ml-1 flex h-10 w-10 shrink-0 items-center justify-center"
        >
          <span className="grid grid-cols-3 grid-rows-3 gap-[3px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <i
                key={i}
                className="block h-[4px] w-[4px] rounded-full bg-current"
              />
            ))}
          </span>
        </span>

        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="The Mind Point, home"
        >
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="h-8 w-8"
            priority
          />
          <span className="font-display text-foreground text-base font-bold tracking-tight sm:text-lg">
            The Mind Point
          </span>
        </Link>

        <nav
          className="ml-6 hidden items-center gap-6 lg:flex"
          aria-label="Sections"
        >
          {PRIMARY.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 hover:text-primary text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <Link
            href="/january-2027"
            className="bg-primary text-primary-foreground hidden rounded-full px-4 py-2 text-[0.68rem] font-semibold tracking-[0.16em] uppercase sm:inline-flex"
          >
            Find your fit
          </Link>
          <Link
            href="/cart"
            className="text-foreground/80 hover:text-primary rounded-full p-2 transition-colors"
            aria-label="Cart"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9"
              />
            </svg>
          </Link>
          <Link
            href="/account"
            className="text-foreground/70 hover:text-primary text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors"
          >
            Account
          </Link>
        </div>
      </div>
    </nav>
  );
}
