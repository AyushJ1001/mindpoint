import Constants from "expo-constants";
import { readExpoPublicEnv } from "@mindpoint/config/mobile";

export const publicEnv = readExpoPublicEnv(Constants.expoConfig?.extra);
