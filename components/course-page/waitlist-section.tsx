"use client";

import { useQuery } from "convex/react";

import {
  WaitlistForm,
  type WaitlistBatchOption,
} from "@/components/course-page/waitlist-form";
import { api } from "@/lib/backend/api";
import {
  waitlistDeliveriesForType,
  type WaitlistCourseType,
  type WaitlistDelivery,
} from "convex/_shared/waitlist";

/**
 * Early-bird pre-registration block shown while registration is paused.
 * Renders nothing when registration is open.
 */
export function WaitlistSection({
  courseTitle,
  courseType,
  courseId,
  batches = [],
  deliveries,
  source,
}: {
  courseTitle: string;
  courseType: WaitlistCourseType;
  courseId?: string;
  batches?: WaitlistBatchOption[];
  deliveries?: WaitlistDelivery[];
  source: string;
}) {
  const settings = useQuery(api.siteSettings.getPublic);

  if (settings?.registrationsOpen !== false) return null;

  return (
    <section id="waitlist" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <header className="mb-10 sm:mb-14">
          <p className="water-eyebrow text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
            Early-bird waitlist
          </p>
          <h2 className="font-display text-foreground mt-4 max-w-[24ch] text-3xl leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            {settings?.note ?? "Pre-register for this course"}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
            Registration has not opened yet. Leave your details and we&rsquo;ll
            share the early-bird discount for {courseTitle} by email and
            WhatsApp as soon as it does.
          </p>
        </header>
        <WaitlistForm
          courseTitle={courseTitle}
          courseType={courseType}
          courseId={courseId}
          batches={batches}
          deliveries={deliveries ?? waitlistDeliveriesForType(courseType)}
          source={source}
        />
      </div>
    </section>
  );
}
