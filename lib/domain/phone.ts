import { parsePhoneNumberFromString } from "libphonenumber-js/max";

/**
 * Normalise a phone number to E.164, defaulting to India when no country code
 * is given. Returns null when the number is not valid for that country, so a
 * caller can reject it rather than store something unusable.
 *
 * This proves the number is well-formed, not that the student owns it.
 */
export function normalizePhoneNumber(
  raw: string | undefined | null,
  defaultCountry: "IN" = "IN",
): string | null {
  const value = raw?.trim();
  if (!value) return null;

  const parsed = parsePhoneNumberFromString(
    value.startsWith("+") ? value : `+${value.replace(/^0+/, "")}`,
    defaultCountry,
  );
  if (parsed?.isValid()) return parsed.number;

  const withCountry = parsePhoneNumberFromString(value, defaultCountry);
  return withCountry?.isValid() ? withCountry.number : null;
}
