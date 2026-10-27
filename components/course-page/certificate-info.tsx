import { Section } from "@/components/course-page/section";
import type { ProgrammeCertificate } from "@/lib/course-content/types";

/** Honest certificate wording for certificate programmes (brief layout). */
export function CertificateInfo({
  certificate,
  shortTitle,
}: {
  certificate: ProgrammeCertificate;
  shortTitle: string;
}) {
  return (
    <Section
      id="certificate"
      eyebrow={certificate.eyebrow ?? "Certificate"}
      title={certificate.title ?? "A certificate you earn, not collect."}
      width="narrow"
    >
      <p className="text-foreground/85 max-w-[62ch] text-[1.02rem] leading-relaxed">
        {certificate.body}
      </p>

      <div className="border-foreground/10 bg-card relative mt-8 aspect-[1.6/1] overflow-hidden rounded-2xl border p-8">
        <div className="border-foreground/15 flex h-full flex-col items-center justify-center rounded-xl border border-dashed text-center">
          <p className="text-foreground/45 text-[0.62rem] font-semibold tracking-[0.24em] uppercase">
            The Mind Point
          </p>
          <p className="font-display text-foreground mt-3 text-2xl">
            Certificate of completion
          </p>
          <p className="text-muted-foreground mt-2 max-w-[34ch] text-sm">
            {shortTitle}
          </p>
        </div>
        <span className="text-foreground/40 absolute right-4 bottom-3 text-[0.6rem] font-semibold tracking-[0.2em] uppercase">
          Preview
        </span>
      </div>

      {certificate.items && certificate.items.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {certificate.items.map((item) => (
            <li
              key={item}
              className="text-foreground/80 flex gap-3 text-sm leading-relaxed"
            >
              <span
                aria-hidden="true"
                className="bg-primary mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
