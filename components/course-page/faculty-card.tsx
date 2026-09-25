import { ContentPlaceholder } from "@/components/course-page/placeholder";
import { Section } from "@/components/course-page/section";
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

export function FacultySection({ faculty }: { faculty: FacultyMember[] }) {
  const confirmed = faculty.filter(
    (member) => member.name && member.name.trim(),
  );

  return (
    <Section
      id="faculty"
      eyebrow="Who teaches it"
      title="Practising psychologists, named."
      lead="You learn from people who do this work, not only people who describe it."
    >
      {confirmed.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {confirmed.map((member) => (
            <FacultyCard key={member.name} member={member} />
          ))}
        </div>
      ) : (
        <ContentPlaceholder label="Named faculty for this programme have not been confirmed yet. Add names, roles and qualifications in the admin." />
      )}
    </Section>
  );
}
