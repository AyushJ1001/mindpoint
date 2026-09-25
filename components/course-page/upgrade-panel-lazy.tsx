"use client";

import dynamic from "next/dynamic";

import type { ProgrammeUpgrade } from "@/lib/course-content/types";

// The upgrade panel reads the signed-in learner's enrollments (Convex + Clerk),
// so it must render on the client only. Rendering it during prerender would
// require the Convex auth provider, which the static programme page does not
// have at build time.
const UpgradePanel = dynamic(
  () => import("./upgrade-panel").then((mod) => mod.UpgradePanel),
  { ssr: false },
);

export function UpgradePanelLazy(props: {
  upgrade: ProgrammeUpgrade;
  fromCourseId?: string;
}) {
  return <UpgradePanel {...props} />;
}
