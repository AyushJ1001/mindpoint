"use client";

export default function StructuredContent({ text }: { text: string }) {
  const blocks = text.replace(/\r\n?/g, "\n").split(/\n{2,}/);
  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        const lines = block
          .split(/\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        const isBulleted = lines.every((l) => /^[-*•]\s+/.test(l));
        const isNumbered = lines.every((l) => /^\d+[\.)]\s+/.test(l));
        if (isBulleted) {
          return (
            <ul
              key={idx}
              className="marker:text-muted-foreground list-disc space-y-1 pl-6"
            >
              {lines.map((l, i) => (
                <li key={i}>{l.replace(/^[-*•]\s+/, "")}</li>
              ))}
            </ul>
          );
        }
        if (isNumbered) {
          return (
            <ol
              key={idx}
              className="marker:text-muted-foreground list-decimal space-y-1 pl-6"
            >
              {lines.map((l, i) => (
                <li key={i}>{l.replace(/^\d+[\.)]\s+/, "")}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="leading-relaxed whitespace-pre-wrap">
            {block}
          </p>
        );
      })}
    </div>
  );
}
