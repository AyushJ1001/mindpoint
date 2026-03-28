import type { ConfigContext, ExpoConfig } from "expo/config";
import dotenv from "dotenv";
import path from "path";
import { readPublicEnv } from "@mindpoint/config/env";

export default ({ config }: ConfigContext): ExpoConfig => {
  const rootDir = path.resolve(__dirname, "../..");

  dotenv.config({ path: path.join(rootDir, ".env"), quiet: true });
  dotenv.config({
    path: path.join(rootDir, ".env.local"),
    override: true,
    quiet: true,
  });

  // Only NEXT_PUBLIC_* values are embedded into the mobile bundle. Razorpay's
  // key here is the publishable key ID; the secret remains server-only.
  const publicEnv = readPublicEnv(process.env);

  if (!publicEnv.convexUrl || !publicEnv.clerkPublishableKey) {
    console.warn(
      "Mind Point mobile env is incomplete after loading the root .env files.",
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
