import type { ConfigContext, ExpoConfig } from "expo/config";
import { readPublicEnv } from "@mindpoint/config/env";

export default ({ config }: ConfigContext): ExpoConfig => {
  const publicEnv = readPublicEnv(process.env);

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
