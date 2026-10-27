"use client";

import { useQuery } from "convex/react";

import { Section } from "@/components/course-page/section";
import { api } from "@/lib/backend/api";
import type { FacultyMember } from "@/lib/course-content/types";

export function FacultyCard({ member }: { member: FacultyMember }) {
  const hasName = Boolean(member.name && member.name.trim());

  return (
    <article className="border-foreground/10 bg-card rounded-2xl border p-6">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="bg-secondary text-foreground/60 font-display flex h-12 w-12 items-center justify-center rounded-full text-lg"
        >
          {hasName ? member.name!.charAt(0) : "?"}
        </span>
        <div>
          {hasName ? (
            <h3 className="font-display text-foreground text-lg">
              {member.name}
            </h3>
          ) : (
            <p className="text-foreground/45 text-[0.62rem] font-semibold tracking-[0.2em] uppercase">
              Faculty to be confirmed
            </p>
          )}
          {member.role ? (
            <p className="text-muted-foreground mt-0.5 text-sm">
              {member.role}
            </p>
          ) : null}
        </div>
      </div>

      {member.qualification ? (
        <p className="text-foreground/70 mt-4 text-sm">
          {member.qualification}
        </p>
      ) : null}
      {member.bio ? (
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {member.bio}
        </p>
      ) : null}
    </article>
  );
}

/** Shared, owner-approved description of every faculty member's credentials. */
const FACULTY_CREDENTIALS =
  "Every member of our teaching faculty holds a Master’s in psychology and a specialisation diploma or certificate.";

const FACULTY_ON_REQUEST =
  "We do not publish individual names here. The names and full credentials of the faculty teaching your cohort are shared with you on request.";

export function FacultySection({ faculty }: { faculty: FacultyMember[] }) {
  // Verified profiles, once the owner publishes them. Empty until then, and the
  // section falls back to the approved shared description rather than showing
  // empty cards.
  const profiles = useQuery(api.facultyProfiles.listPublished, {});

  const confirmed = faculty.filter(
    (member) => member.name && member.name.trim(),
  );

  // Still loading: render nothing rather than the shared fallback, so the page
  // never claims "we do not publish names" while published profiles exist.
  if (profiles === undefined) {
    return null;
  }

  if (profiles.length > 0) {
    return (
      <Section
        id="faculty"
        eyebrow="Who teaches it"
        title="The people who will teach you."
        width="narrow"
      >
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <article
              key={profile._id}
              className="border-foreground/10 bg-card rounded-2xl border p-6"
            >
              <div className="flex items-center gap-4">
                {profile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoUrl}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="bg-secondary text-foreground/60 font-display flex h-12 w-12 items-center justify-center rounded-full text-lg"
                  >
                    {profile.name.charAt(0)}
                  </span>
                )}
                <div>
                  <h3 className="font-display text-foreground text-lg">
                    {profile.name}
                  </h3>
                  {profile.role ? (
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {profile.role}
                    </p>
                  ) : null}
                </div>
              </div>
              {profile.qualifications.length > 0 ? (
                <p className="text-foreground/70 mt-4 text-sm">
                  {profile.qualifications.join(" · ")}
                </p>
              ) : null}
              {profile.experience ? (
                <p className="text-muted-foreground mt-2 text-sm">
                  {profile.experience}
                </p>
              ) : null}
              {profile.registrationBody && profile.registrationNumber ? (
                <p className="text-muted-foreground mt-2 text-xs">
                  {profile.registrationBody} · {profile.registrationNumber}
                </p>
              ) : null}
              {profile.bio ? (
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {profile.bio}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="faculty"
      eyebrow="Who teaches it"
      title="Qualified psychology faculty."
      lead={FACULTY_CREDENTIALS}
      width="narrow"
    >
      <p className="text-foreground/80 mt-2 max-w-[58ch] text-base leading-relaxed">
        {FACULTY_ON_REQUEST}
      </p>
      {confirmed.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {confirmed.map((member) => (
            <FacultyCard key={member.name} member={member} />
          ))}
        </div>
      ) : null}
    </Section>
  );
}
