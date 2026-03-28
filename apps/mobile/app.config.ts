import type { ConfigContext, ExpoConfig } from "expo/config";
import dotenv from "dotenv";
import path from "path";
import { readPublicEnv } from "@mindpoint/config/env";

function loadEnvFile(rootDir: string, envFile: string, override = false) {
  dotenv.config({
    path: path.join(rootDir, envFile),
    override,
    quiet: true,
  });
}

function getBuildProfile() {
  return (
    process.env.APP_ENV ||
    process.env.EAS_BUILD_PROFILE ||
    process.env.BUILD_PROFILE ||
    process.env.CONFIGURATION ||
    process.env.NODE_ENV ||
    "development"
  );
}

function isReleaseProfile(buildProfile: string) {
  return ["production", "preview", "release", "testflight"].includes(
    buildProfile.toLowerCase(),
  );
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const rootDir = path.resolve(__dirname, "../..");
  const buildProfile = getBuildProfile();
  const releaseProfile = isReleaseProfile(buildProfile);

  if (releaseProfile) {
    // Release/TestFlight builds must resolve production values from CI/EAS or
    // production-scoped env files, never from developer-local overrides.
    loadEnvFile(rootDir, ".env.production");
    loadEnvFile(rootDir, ".env.production.local", true);
  } else {
    loadEnvFile(rootDir, ".env");
    loadEnvFile(rootDir, ".env.local", true);
  }

  // Only NEXT_PUBLIC_* values are embedded into the mobile bundle. Razorpay's
  // key here is the publishable key ID; the secret remains server-only.
  const publicEnv = readPublicEnv(process.env);

  if (!publicEnv.convexUrl || !publicEnv.clerkPublishableKey) {
    const envSource = releaseProfile
      ? ".env.production/.env.production.local or CI env"
      : ".env/.env.local";
    throw new Error(
      `Mind Point mobile env is incomplete for the ${buildProfile} build. Set NEXT_PUBLIC_CONVEX_URL and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY via ${envSource}.`,
    );
  }

  if (releaseProfile && publicEnv.clerkPublishableKey.startsWith("pk_test_")) {
    throw new Error(
      `Mind Point mobile ${buildProfile} build is using a Clerk test publishable key. Set a production NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY before shipping this build.`,
    );
  }

  return {
    ...config,
    name: "The Mind Point",
    slug: "mindpoint-mobile",
    scheme: "mindpoint",
    ios: {
      ...config.ios,
      bundleIdentifier: "com.anonymous.mindpoint-mobile",
      infoPlist: {
        ...config.ios?.infoPlist,
        CFBundleDisplayName: "The Mind Point",
        // Apple validation requires these because a linked dependency references
        // photo-library APIs, even though the current app flow does not present
        // an image picker directly.
        NSPhotoLibraryUsageDescription:
          "The Mind Point needs photo library access so you can attach and upload images from your library.",
        NSPhotoLibraryAddUsageDescription:
          "The Mind Point needs permission to save images to your photo library when you choose to export or download them.",
      },
    },
    extra: {
      ...config.extra,
      publicEnv,
    },
    plugins: [
      "expo-dev-client",
      "expo-router",
      "expo-secure-store",
      "expo-document-picker",
    ],
  };
};
