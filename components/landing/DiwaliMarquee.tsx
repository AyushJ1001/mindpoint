import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/lib/backend/api";
import { isDiscountActive } from "@/lib/domain/pricing";

const LINE =
  "Diwali special · Flat ₹1,000 off all five programs · Extra ₹500 off with code EARLYBIRD500 · First 10 eligible students only · Offer ends 15 November 2026";

async function diwaliIsLive(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return false;
  try {
    const courses = await new ConvexHttpClient(url).query(
      api.courses.listCourses,
      {},
    );
    return (courses ?? []).some(
      (course) =>
        course.offer?.occasion === "diwali" && isDiscountActive(course.offer),
    );
  } catch {
    return false;
  }
}

/** Slim scrolling strip above the navigation, shown only while Diwali runs. */
export async function DiwaliMarquee() {
  if (!(await diwaliIsLive())) return null;

  return (
    <Link
      href="/programs"
      className="diwali-marquee block overflow-hidden bg-[#173F3A] py-2 text-[0.72rem] font-medium tracking-[0.12em] text-[#E8C98F] uppercase"
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
