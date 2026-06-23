"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import type { FunctionReference } from "convex/server";
import { revalidateCourses } from "@/app/actions/revalidate-courses";

/**
 * Wraps a Convex mutation so that, after it resolves successfully, the course
 * listing pages' ISR caches are revalidated on demand.
 *
 * Use this for admin mutations that change what appears on the public course
 * listings (create/update/delete/publish/etc.). If the mutation throws, the
 * await rejects and revalidation is skipped. The revalidation call is
 * fire-and-forget so it never blocks the caller's success handling.
 */
export function useRevalidatingCourseMutation<
  Mutation extends FunctionReference<"mutation">,
>(mutation: Mutation): ReturnType<typeof useMutation<Mutation>> {
  const mutate = useMutation(mutation);

  const wrapped = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args: any) => {
      const result = await mutate(args);
      void revalidateCourses();
      return result;
    },
    [mutate],
  );

  return wrapped as ReturnType<typeof useMutation<Mutation>>;
}
