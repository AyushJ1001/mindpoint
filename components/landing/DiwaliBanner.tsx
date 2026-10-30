"use client";

import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "@/lib/backend/api";

/**
 * Diwali banner, driven entirely by the offer engine.
 *
 * It renders only while a campaign with the `diwali` occasion is applied to a
 * course, and takes its end date and discount from that offer — so it appears
 * and disappears with the campaign, with no separate switch to forget.
 */
export function DiwaliBanner() {
  const courses = useQuery(api.courses.listCourses, {});
  if (!courses) return null;

  const discounted = courses.filter(
    (course) => course.offer?.occasion === "diwali" && course.offer.offerPrice,
  );
  if (discounted.length === 0) return null;

  const sample = discounted[0].offer!;
  const saving =
    (sample.standardPrice ?? discounted[0].price) - (sample.offerPrice ?? 0);
  const endsOn = sample.endDate
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(sample.endDate))
    : null;

  return (
    <section
      aria-labelledby="diwali-heading"
      className="relative isolate overflow-hidden border-b border-[#D7B88A]/40 bg-[linear-gradient(100deg,#FBF3E2_0%,#F7EEE0_45%,#EFE7D2_100%)]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_12%_20%,#D7B88A33_0_1px,transparent_1px_22px),radial-gradient(circle_at_88%_75%,#C77B3033_0_1px,transparent_1px_26px)]"
      />
      <div className="container flex flex-col items-start gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <div className="max-w-2xl">
          <p className="text-[0.66rem] font-semibold tracking-[0.22em] uppercase text-[#A9701F]">
            Diwali 2026
          </p>
          <h2
            id="diwali-heading"
            className="font-display mt-1 text-xl leading-snug text-[#173F3A] sm:text-2xl"
          >
            A Season of Light. A New Journey of Learning.
          </h2>
          <p className="mt-1 text-sm text-[#2C4A3F]/85">
            <b className="font-semibold">Flat ₹{saving.toLocaleString("en-IN")} off</b>{" "}
            all five upcoming programs
            {endsOn ? ` · Offer ends ${endsOn}` : ""}.
          </p>
        </div>
        <Link
          href="/programs"
          className="shrink-0 rounded border border-[#A9701F]/50 bg-[#173F3A] px-5 py-3 text-sm font-semibold text-[#FBF3E2] transition-colors hover:bg-[#1D4E4A]"
        >
          Explore Diwali Offers
        </Link>
      </div>
    </section>
  );
}
