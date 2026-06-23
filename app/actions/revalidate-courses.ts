"use server";

import { revalidatePath } from "next/cache";

/**
 * Drop the ISR cache for every page that lists courses.
 *
 * Course listing pages use a 30-minute ISR window (`export const revalidate`),
 * and the homepage's "upcoming courses" section uses a 1-hour window. Without
 * on-demand revalidation, a course created/edited/published via the admin only
 * appears on these listings once that window elapses — even though the dynamic
 * `/courses/[id]` detail page shows it immediately.
 *
 * Called after any admin mutation that affects what shows on the listings.
 */
export async function revalidateCourses() {
  // The "layout" type revalidates `/courses` and every nested route beneath
  // the shared app/courses/layout.tsx — i.e. all category listings and the
  // [id] detail page — in a single call, so new category pages are covered too.
  revalidatePath("/courses", "layout");
  // Homepage renders an upcoming-courses section.
  revalidatePath("/");
}
