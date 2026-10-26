"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import {
  track,
  type AnalyticsEventName,
  type AnalyticsEventParams,
} from "@/lib/analytics";

type TrackedLinkProps<E extends AnalyticsEventName> = ComponentProps<
  typeof Link
> & {
  event: E;
  eventParams: AnalyticsEventParams[E];
};

/** A next/link that records an analytics event when clicked. */
export function TrackedLink<E extends AnalyticsEventName>({
  event,
  eventParams,
  onClick,
  ...props
}: TrackedLinkProps<E>) {
  return (
    <Link
      {...props}
      onClick={(clickEvent) => {
        track(event, eventParams);
        onClick?.(clickEvent);
      }}
    />
  );
}
