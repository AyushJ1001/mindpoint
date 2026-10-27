import { cn } from "@/lib/utils";
import type { OfferOccasion } from "@/lib/domain/pricing";

/**
 * Seasonal treatment for a scheduled offer. Deliberately quiet: a small tinted
 * label beside the price, drawn from the TMP palette rather than a full page
 * restyle. A general offer shows "Special Price" and no campaign name.
 */
const THEME: Record<OfferOccasion, string> = {
  "early-bird": "border-[#E2C9A2] bg-[#F6ECDA] text-[#7A5426]",
  diwali: "border-[#E3C08A] bg-[#F8EAD1] text-[#8A5A16]",
  christmas: "border-[#C3D8C9] bg-[#E8F1EA] text-[#25543C]",
  "new-year": "border-[#BFD8DD] bg-[#E5EFF1] text-[#1D5560]",
  general: "border-[#D7D0C2] bg-[#EFECE4] text-[#173F3A]",
};

export function OfferBadge({
  occasion,
  label,
  className,
}: {
  occasion?: OfferOccasion;
  label: string;
  className?: string;
}) {
  if (!label) return null;
  return (
    <span
      data-occasion={occasion ?? "general"}
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[0.68rem] font-semibold tracking-[0.08em] uppercase",
        THEME[occasion ?? "general"],
        className,
      )}
    >
      {label}
    </span>
  );
}
