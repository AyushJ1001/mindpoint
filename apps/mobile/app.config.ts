import type { ConfigContext, ExpoConfig } from "expo/config";
import { readPublicEnv } from "@mindpoint/config/env";

export default ({ config }: ConfigContext): ExpoConfig => {
  const publicEnv = readPublicEnv(process.env);

  if (!publicEnv.convexUrl || !publicEnv.clerkPublishableKey) {
    console.warn(
      "Mind Point mobile env is incomplete. Start Expo via the root mobile wrapper script so app.config.ts receives the root .env values.",
    );
  }

  return {
    ...config,
    name: "Mind Point",
    slug: "mindpoint-mobile",
    scheme: "mindpoint",
    extra: {
      ...config.extra,
      publicEnv,
    },
    plugins: ["expo-router", "expo-secure-store"],
  };
};
