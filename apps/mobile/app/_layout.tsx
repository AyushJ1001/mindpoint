import "../global.css";

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import "react-native-reanimated";
import { AppProviders } from "@/components/AppProviders";
import { ErrorBoundary as AppErrorBoundary } from "@/components/ErrorBoundary";
import { storeReferralCode } from "@/lib/referral-storage";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const parsed = Linking.parse(event.url);
      if (parsed.queryParams?.ref) {
        storeReferralCode(parsed.queryParams.ref as string);
      }
      if (parsed.path?.startsWith("courses/")) {
        const id = parsed.path.replace("courses/", "");
        router.push(`/course/${id}` as never);
      }
    };

    const sub = Linking.addEventListener("url", handleUrl);

    // Handle cold start URL
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => sub.remove();
  }, [router]);

  return (
    <AppProviders>
      <AppErrorBoundary>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="course/[id]"
              options={{ title: "Course Details" }}
            />
            <Stack.Screen
              name="checkout"
              options={{ title: "Checkout", presentation: "modal" }}
            />
            <Stack.Screen name="contact" options={{ title: "Contact Us" }} />
            <Stack.Screen name="careers" options={{ title: "Careers" }} />
          </Stack>
        </ThemeProvider>
      </AppErrorBoundary>
    </AppProviders>
  );
}
