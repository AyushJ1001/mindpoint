import { PropsWithChildren } from "react";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { publicEnv } from "@/lib/public-env";
import { tokenCache } from "@/lib/token-cache";
import { CartProvider } from "@/components/CartProvider";

const convexClient = publicEnv.convexUrl
  ? new ConvexReactClient(publicEnv.convexUrl)
  : null;

export function AppProviders({ children }: PropsWithChildren) {
  const inner = <CartProvider>{children}</CartProvider>;

  if (publicEnv.clerkPublishableKey && convexClient) {
    return (
      <ClerkProvider
        publishableKey={publicEnv.clerkPublishableKey}
        tokenCache={tokenCache}
      >
        <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
          {inner}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }

  if (publicEnv.clerkPublishableKey) {
    return (
      <ClerkProvider
        publishableKey={publicEnv.clerkPublishableKey}
        tokenCache={tokenCache}
      >
        {inner}
      </ClerkProvider>
    );
  }

  if (convexClient) {
    return <ConvexProvider client={convexClient}>{inner}</ConvexProvider>;
  }

  return <>{inner}</>;
}
