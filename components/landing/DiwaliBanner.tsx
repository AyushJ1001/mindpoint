"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@/lib/backend/api";
import { isDiscountActive } from "@/lib/domain/pricing";

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

  // The window is checked here too: a stale course.offer left behind by a
  // missed reconciliation must not keep promoting an expired discount.
  const discounted = courses.filter(
    (course) =>
      course.offer?.occasion === "diwali" &&
      Boolean(course.offer.offerPrice) &&
      isDiscountActive(course.offer),
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
      <div className="container grid gap-6 py-7 sm:grid-cols-[1.35fr_0.65fr] sm:items-center sm:py-9">
        <div>
          <p className="text-[0.62rem] font-semibold tracking-[0.28em] uppercase text-[#A9701F]">
            The Mind Point presents
          </p>
          <p className="font-display mt-1 text-[1.6rem] leading-none tracking-[0.02em] text-[#173F3A] sm:text-3xl">
            Diwali Celebration
          </p>
          <h2
            id="diwali-heading"
            className="font-display mt-2 text-xl leading-snug text-[#2C4A3F] sm:text-2xl"
          >
            A Season of Light. A New Journey of Learning.
          </h2>
          <p className="mt-3 text-sm text-[#2C4A3F]/85">
            <b className="text-[#A9701F]">Flat ₹{saving.toLocaleString("en-IN")} off</b>{" "}
            on all five upcoming programs.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#A9701F]/25 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <div>
            <p className="text-[0.62rem] font-semibold tracking-[0.2em] uppercase text-[#A9701F]">
              Extra ₹500 off
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <code className="rounded border border-[#A9701F]/45 bg-[#FBF3E2] px-2.5 py-1 text-sm font-semibold tracking-[0.08em] text-[#173F3A]">
                EARLYBIRD500
              </code>
              <CopyCode code="EARLYBIRD500" />
            </div>
            <p className="mt-1 text-[0.7rem] text-[#2C4A3F]/75">
              First 10 eligible students · applied at checkout
            </p>
          </div>

          {endsOn ? (
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-[#2C4A3F]/80">
              Offer ends {endsOn}
            </p>
          ) : null}

          <Link
            href="/programs"
            className="inline-flex items-center justify-center rounded border border-[#A9701F]/50 bg-[#173F3A] px-5 py-2.5 text-sm font-semibold text-[#FBF3E2] transition-colors hover:bg-[#1D4E4A]"
          >
            Explore Diwali Offers
          </Link>
        </div>
      </div>
    </section>
  );
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className="rounded border border-[#173F3A]/25 px-2 py-1 text-[0.7rem] font-semibold text-[#173F3A] transition-colors hover:bg-[#173F3A]/5"
    >
      {copied ? "Copied" : "Copy code"}
    </button>
  );
}
