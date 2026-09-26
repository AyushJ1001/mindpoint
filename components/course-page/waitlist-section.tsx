"use client";

import { useQuery } from "convex/react";

import { WaitlistForm } from "@/components/course-page/waitlist-form";
import { api } from "@/lib/backend/api";

/**
 * Pre-registration block shown on a programme page while registrations are
 * paused. Renders nothing when registration is open.
 */
export function WaitlistSection({
  courseTitle,
  slug,
}: {
  courseTitle: string;
  slug: string;
}) {
  const settings = useQuery(api.siteSettings.getPublic);

  if (settings?.registrationsOpen !== false) return null;

  return (
    <section id="waitlist" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <header className="mb-10 sm:mb-14">
          <p className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
            Registration paused
          </p>
          <h2 className="font-display text-foreground mt-4 max-w-[24ch] text-3xl leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            {settings?.note ?? "Pre-register for this course"}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
            Registration is paused while we finalise the course materials. Leave
            your details and we&rsquo;ll email you as soon as registration for{" "}
            {courseTitle} opens.
          </p>
        </header>
        <WaitlistForm courseTitle={courseTitle} slug={slug} />
      </div>
    </section>
  );
}
