"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics";

/** Records one `programme_view` per programme page visit. */
export function TrackProgrammeView({ courseCode }: { courseCode?: string }) {
  useEffect(() => {
    if (courseCode) track("programme_view", { course_code: courseCode });
  }, [courseCode]);

  return null;
}
