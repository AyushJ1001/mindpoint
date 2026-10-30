"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";

import { api } from "@/lib/backend/api";
import { isDiscountActive } from "@/lib/domain/pricing";

const LINE =
  "Diwali special · Flat ₹1,000 off all five programs · Extra ₹500 off with code EARLYBIRD500 · First 10 eligible students only · Offer ends 15 November 2026";

/**
 * Slim scrolling strip above the navigation, shown only while the Diwali
 * campaign is live. Client-side so the root layout never waits on a query and
 * so it can stay out of the LMS and admin, which are not marketing surfaces.
 */
export function DiwaliMarquee() {
  const pathname = usePathname();

  // Mount the querying strip only on public pages. It used to subscribe on
  // every route, including /admin, which put a campaign query underneath the
  // admin editor for no reason.
  if (pathname?.startsWith("/lms") || pathname?.startsWith("/admin")) {
    return null;
  }

  return <ActiveMarquee />;
}

function ActiveMarquee() {
  const courses = useQuery(api.courses.listCourses, {});

  const active = (courses ?? []).some(
    (course) =>
      course.offer?.occasion === "diwali" && isDiscountActive(course.offer),
  );
  if (!active) return null;

  return (
    <Link
      href="/programs"
      className="diwali-marquee block bg-[#173F3A] py-2 text-[0.72rem] font-medium tracking-[0.12em] text-[#E8C98F] uppercase"
      aria-label="Diwali offer details"
    >
      <span className="diwali-marquee-track inline-flex whitespace-nowrap">
        <span className="px-6">{LINE}</span>
        <span className="px-6" aria-hidden="true">
          {LINE}
        </span>
      </span>
    </Link>
  );
}
