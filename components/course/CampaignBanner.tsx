import type { OfferOccasion } from "@/lib/domain/pricing";
function formatINR(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

/**
 * Seasonal banner for a scheduled campaign.
 *
 * Each occasion gets a coordinated treatment built from the logo palette and a
 * soft water-inspired wash, rather than a separate page design. An admin can
 * supply `bannerImageUrl` to replace the wash with their own artwork; without
 * one the default treatment is used, so nothing ever renders empty.
 *
 * A general offer shows "Special Price" and never a campaign name.
 */
const THEME: Record<
  OfferOccasion,
  { label: string; wash: string; accent: string; ink: string }
> = {
  "early-bird": {
    label: "Early Bird",
    wash: "linear-gradient(120deg, #F7F2E6 0%, #EDF3EC 55%, #DCE9E3 100%)",
    accent: "#B98A4B",
    ink: "#2C4A3F",
  },
  diwali: {
    label: "Diwali Offer",
    wash: "linear-gradient(120deg, #FBF1DE 0%, #F4E3C6 55%, #EAD6B4 100%)",
    accent: "#A9701F",
    ink: "#5B3A12",
  },
  christmas: {
    label: "Christmas Offer",
    wash: "linear-gradient(120deg, #EEF4EE 0%, #E3EEE6 55%, #D6E6DB 100%)",
    accent: "#2F6B4A",
    ink: "#1F4632",
  },
  "new-year": {
    label: "New Year Offer",
    wash: "linear-gradient(120deg, #EAF2F3 0%, #DCEAEC 55%, #CFE2E5 100%)",
    accent: "#2A6E7A",
    ink: "#173F3A",
  },
  general: {
    label: "Special Price",
    wash: "linear-gradient(120deg, #F4F2EC 0%, #EDEFE9 55%, #E3EAE5 100%)",
    accent: "#527E73",
    ink: "#173F3A",
  },
};

export function CampaignBanner({
  occasion = "general",
  headline,
  lead,
  bannerImageUrl,
  standardPrice,
  offerPrice,
  endsOn,
}: {
  occasion?: OfferOccasion;
  headline?: string;
  lead?: string;
  bannerImageUrl?: string;
  standardPrice: number;
  offerPrice: number;
  endsOn?: string;
}) {
  if (offerPrice >= standardPrice) return null;
  const theme = THEME[occasion];

  return (
    <section
      aria-label={theme.label}
      data-occasion={occasion}
      className="relative isolate overflow-hidden rounded-2xl border"
      style={{
        borderColor: `${theme.accent}44`,
        background: theme.wash,
        boxShadow: `inset 4px 0 0 ${theme.accent}`,
      }}
    >
      {bannerImageUrl ? (
        // Admin-supplied artwork; the wash stays underneath for contrast.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bannerImageUrl}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `radial-gradient(60% 90% at 90% 10%, ${theme.accent}22 0%, transparent 60%), radial-gradient(50% 80% at 10% 90%, #ffffff88 0%, transparent 55%)`,
          }}
        />
      )}

      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-end justify-between gap-x-10 gap-y-5 px-6 py-8 sm:px-9">
        <div className="max-w-md">
          <span
            className="text-[0.68rem] font-semibold tracking-[0.16em] uppercase"
            style={{ color: theme.accent }}
          >
            {theme.label}
          </span>
          <p
            className="font-display mt-2 text-2xl leading-snug"
            style={{ color: theme.ink }}
          >
            {headline || "A quieter price for a considered decision."}
          </p>
          {lead ? (
            <p
              className="mt-1 text-sm leading-relaxed opacity-80"
              style={{ color: theme.ink }}
            >
              {lead}
            </p>
          ) : null}
          {endsOn ? (
            <p
              className="mt-2 text-xs tracking-[0.06em] uppercase opacity-70"
              style={{ color: theme.ink }}
            >
              Until {endsOn}
            </p>
          ) : null}
        </div>

        <div className="flex items-end gap-3">
          <span
            className="text-base line-through opacity-55"
            style={{ color: theme.ink }}
          >
            {formatINR(standardPrice)}
          </span>
          <span
            className="font-display text-4xl tracking-tight"
            style={{ color: theme.ink }}
          >
            {formatINR(offerPrice)}
          </span>
        </div>
      </div>
    </section>
  );
}
