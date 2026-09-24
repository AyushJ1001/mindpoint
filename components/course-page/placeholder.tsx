import { cn } from "@/lib/utils";

/**
 * A clearly marked stand-in for content the CMS/owner has not supplied yet.
 * Never replaced with invented copy.
 */
export function ContentPlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-foreground/20 bg-secondary/30 rounded-xl border border-dashed p-4",
        className,
      )}
      role="note"
    >
      <p className="text-foreground/45 text-[0.66rem] font-semibold tracking-[0.2em] uppercase">
        Content needed
      </p>
      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
        {label}
      </p>
    </div>
  );
}
