export const REFERRAL_COOKIE_KEY = "mp_ref";
export const REFERRAL_ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
export const MAX_REFERRAL_CODE_LENGTH = 64;

const REFERRAL_CODE_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function isValidReferralCode(referralCode: string): boolean {
  if (
    !referralCode ||
    referralCode.length === 0 ||
    referralCode.length > MAX_REFERRAL_CODE_LENGTH
  ) {
    return false;
  }

  return REFERRAL_CODE_PATTERN.test(referralCode);
}

export function normalizeReferralCode(
  referralCode?: string | null,
): string | null {
  const normalized = referralCode?.trim();
  if (!normalized || !isValidReferralCode(normalized)) {
    return null;
  }

  return normalized;
}
