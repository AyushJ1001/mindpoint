"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/backend/api";
import { Card, CardContent } from "@/components/ui/card";
import type { Id } from "@/lib/backend/data-model";

/**
 * Published faculty profiles. Renders nothing at all until the owner supplies
 * and publishes verified details, so the page keeps its neutral credential line
 * rather than showing placeholders.
 */
export function FacultyProfiles({
  courseId,
}: {
  courseId?: Id<"courses">;
}) {
  const profiles = useQuery(
    api.facultyProfiles.listPublished,
    courseId ? { courseId } : {},
  );

  if (!profiles || profiles.length === 0) return null;

  return (
    <section
      aria-labelledby="faculty-heading"
      className="py-16 sm:py-20"
    >
      <div className="container max-w-4xl">
        <span className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
          Faculty
        </span>
        <h2
          id="faculty-heading"
          className="font-display mt-4 text-3xl tracking-tight sm:text-4xl"
        >
          Who teaches you.
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {profiles.map((profile) => (
            <Card key={profile._id}>
              <CardContent className="flex gap-4 py-6">
                {profile.photoUrl ? (
                  // A plain image: the source is Convex storage, not an
                  // optimisable remote host.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoUrl}
                    alt=""
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : null}
                <div className="space-y-1">
                  <p className="font-display text-lg">{profile.name}</p>
                  {profile.role ? (
                    <p className="text-muted-foreground text-sm">
                      {profile.role}
                    </p>
                  ) : null}
                  <p className="text-sm">
                    {profile.qualifications.join(" · ")}
                  </p>
                  {profile.experience ? (
                    <p className="text-muted-foreground text-sm">
                      {profile.experience}
                    </p>
                  ) : null}
                  {profile.registrationBody && profile.registrationNumber ? (
                    <p className="text-muted-foreground text-xs">
                      {profile.registrationBody} · {profile.registrationNumber}
                    </p>
                  ) : null}
                  {profile.bio ? (
                    <p className="text-muted-foreground pt-2 text-sm leading-relaxed">
                      {profile.bio}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
