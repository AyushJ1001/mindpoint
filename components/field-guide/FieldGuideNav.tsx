"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "react-use-cart";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

const GROUPS: {
  label: string;
  links: { href: string; label: string; meta?: string }[];
}[] = [
  {
    label: "Begin",
    links: [
      { href: "/resources", label: "Free masterclass", meta: "free" },
      { href: "/courses/pre-recorded", label: "Intro courses", meta: "₹999" },
      { href: "/courses/certificate", label: "Certificates", meta: "live" },
    ],
  },
  {
    label: "Specialise",
    links: [
      { href: "/courses/certificate", label: "CBT, REBT, CBMT", meta: "live" },
      {
        href: "/courses/certificate",
        label: "Inner Child Healing",
        meta: "live",
      },
      {
        href: "/courses/certificate",
        label: "Personality Disorders",
        meta: "new",
      },
      { href: "/courses/diploma", label: "Diplomas", meta: "deep" },
    ],
  },
  {
    label: "Certify & train",
    links: [
      { href: "/courses/internship", label: "Internships", meta: "monthly" },
      {
        href: "/courses/therapy",
        label: "Therapy & counselling",
        meta: "in person",
      },
      {
        href: "/courses/supervised",
        label: "Supervised practice",
        meta: "for practitioners",
      },
      { href: "/account", label: "Your learning", meta: "profile" },
    ],
  },
];

const PRIMARY = [
  { href: "/courses", label: "Courses" },
  { href: "/programs", label: "Programs" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
];

function DotGrid({ className = "" }: { className?: string }) {
  return (
    <span
      className={`grid grid-cols-3 grid-rows-3 gap-[3px] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <i key={i} className="block h-[4px] w-[4px] rounded-full bg-current" />
      ))}
    </span>
  );
}

function AccountControls() {
  return (
    <>
      <Show when="signed-in">
        <UserButton userProfileMode="navigation" userProfileUrl="/account" />
      </Show>
      <Show when="signed-out">
        <SignInButton>
          <button
            type="button"
            className="text-foreground/70 hover:text-primary text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors"
          >
            Sign in
          </button>
        </SignInButton>
      </Show>
    </>
  );
}

export default function FieldGuideNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        data-app-navbar
        role="navigation"
        aria-label="Primary"
        className="border-border bg-background/90 sticky top-0 z-50 border-b backdrop-blur-md"
      >
        <div className="mx-auto flex h-[60px] w-full max-w-[1200px] items-center gap-3 px-4 sm:px-6">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Browse the academy"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="field-guide-menu"
            className="text-foreground hover:bg-accent -ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <DotGrid />
          </button>

          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="The Mind Point, home"
          >
            <Image
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              className="h-11 w-11"
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
                aria-current={pathname === link.href ? "page" : undefined}
                className="text-foreground/70 hover:text-primary text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <Link
              href="/january-2027"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hidden rounded-full px-4 py-2 text-[0.68rem] font-semibold tracking-[0.16em] uppercase transition-colors sm:inline-flex"
            >
              Find your fit
            </Link>
            <Link
              href="/cart"
              className="text-foreground/80 hover:text-primary relative rounded-full p-2 transition-colors"
              aria-label={`Cart${totalItems ? `, ${totalItems} items` : ""}`}
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
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>
            {clerkConfigured ? (
              <AccountControls />
            ) : (
              <Link
                href="/account"
                className="text-foreground/70 hover:text-primary text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors"
              >
                Account
              </Link>
            )}
          </div>
        </div>
      </nav>

      {open && (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          aria-label="Academy contents"
        >
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 h-full w-full cursor-default bg-[#0b1f1d]/45 backdrop-blur-sm motion-safe:animate-[fg-fade_.2s_ease-out]"
          />
          <div
            ref={panelRef}
            id="field-guide-menu"
            className="bg-background border-border absolute inset-y-0 left-0 flex w-[min(460px,92vw)] flex-col border-r shadow-[0_40px_80px_-40px_rgba(11,31,29,0.6)] motion-safe:animate-[fg-slide_.34s_cubic-bezier(0.22,1,0.36,1)]"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-muted-foreground text-[0.66rem] font-semibold tracking-[0.28em] uppercase">
                Contents
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="text-foreground hover:bg-accent flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth={1.8}
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
              <Link
                href="/january-2027"
                className="bg-primary text-primary-foreground mb-7 flex items-center justify-between gap-4 rounded-xl px-5 py-4"
              >
                <span>
                  <b className="font-display block text-lg font-medium">
                    January 2027 cohorts
                  </b>
                  <span className="text-primary-foreground/80 text-sm">
                    Three live certificates · early bird ₹1,999 until 15 Dec
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </Link>

              <div className="space-y-7">
                {GROUPS.map((group, gi) => (
                  <div key={group.label}>
                    <p className="text-muted-foreground mb-1 text-[0.66rem] font-semibold tracking-[0.24em] uppercase">
                      {group.label}
                    </p>
                    <ul>
                      {group.links.map((link, li) => (
                        <li key={`${link.href}-${link.label}`}>
                          <Link
                            href={link.href}
                            className="group hover:text-primary flex items-baseline gap-3 py-2.5 transition-colors motion-safe:animate-[fg-row_.4s_cubic-bezier(0.22,1,0.36,1)_both]"
                            style={{
                              animationDelay: `${80 + (gi * 4 + li) * 35}ms`,
                            }}
                          >
                            <span className="font-display text-foreground group-hover:text-primary text-lg leading-tight">
                              {link.label}
                            </span>
                            <span className="border-foreground/25 mb-[6px] flex-1 border-b border-dotted" />
                            <span className="text-muted-foreground shrink-0 text-xs tracking-wide">
                              {link.meta}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-border flex items-center justify-between gap-4 border-t px-5 py-4 text-sm">
              <Link
                href="/contact"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                Talk to us
              </Link>
              <a href="tel:14416" className="text-primary font-medium">
                In crisis? Call Tele-MANAS 14416 →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
