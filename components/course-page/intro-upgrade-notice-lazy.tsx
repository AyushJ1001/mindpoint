"use client";

import dynamic from "next/dynamic";

import type { ProgrammeCartTarget } from "@/lib/course-content/types";

// The intro-upgrade notice reads the signed-in learner's upgrade credit via
// `useConvexAuth`, which the static programme page has no auth provider for at
// build time. Render it on the client only, mirroring UpgradePanelLazy.
const IntroUpgradeNotice = dynamic(
  () =>
    import("./intro-upgrade-notice").then((mod) => mod.IntroUpgradeNotice),
  { ssr: false },
);

export function IntroUpgradeNoticeLazy({
  target,
}: {
  target?: ProgrammeCartTarget;
}) {
  return <IntroUpgradeNotice target={target} />;
}
