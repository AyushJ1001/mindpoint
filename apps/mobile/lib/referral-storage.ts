import AsyncStorage from "@react-native-async-storage/async-storage";

const REFERRAL_KEY = "mindpoint_referral";
const REFERRAL_TIMESTAMP_KEY = "mindpoint_referral_ts";

/**
 * 30-day attribution window (matches web's REFERRAL_ATTRIBUTION_WINDOW_MS).
 */
const ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Store a referral code with timestamp. Only stores if no existing valid referral.
 */
export async function storeReferralCode(code: string): Promise<void> {
  try {
    const existing = await getReferralCode();
    if (existing) return; // first-click wins

    await AsyncStorage.setItem(REFERRAL_KEY, code);
    await AsyncStorage.setItem(REFERRAL_TIMESTAMP_KEY, String(Date.now()));
  } catch (error) {
    console.error("Failed to store referral code:", error);
  }
}

/**
 * Get the stored referral code if it's within the attribution window.
 */
export async function getReferralCode(): Promise<string | null> {
  try {
    const code = await AsyncStorage.getItem(REFERRAL_KEY);
    const timestamp = await AsyncStorage.getItem(REFERRAL_TIMESTAMP_KEY);

    if (!code || !timestamp) return null;

    const storedAt = parseInt(timestamp, 10);
    if (Date.now() - storedAt > ATTRIBUTION_WINDOW_MS) {
      // Expired - clean up
      await clearReferralCode();
      return null;
    }

    return code;
  } catch (error) {
    console.error("Failed to get referral code:", error);
    return null;
  }
}

/**
 * Clear the stored referral code (e.g. after successful attribution).
 */
export async function clearReferralCode(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([REFERRAL_KEY, REFERRAL_TIMESTAMP_KEY]);
  } catch (error) {
    console.error("Failed to clear referral code:", error);
  }
}
