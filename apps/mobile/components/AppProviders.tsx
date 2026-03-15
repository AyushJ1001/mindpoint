import { PropsWithChildren } from "react";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { publicEnv } from "@/lib/public-env";
import { tokenCache } from "@/lib/token-cache";

const convexClient = publicEnv.convexUrl
  ? new ConvexReactClient(publicEnv.convexUrl)
  : null;

export function AppProviders({ children }: PropsWithChildren) {
  if (publicEnv.clerkPublishableKey && convexClient) {
    return (
      <ClerkProvider
        publishableKey={publicEnv.clerkPublishableKey}
        tokenCache={tokenCache}
      >
        <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
          {children}
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
        {children}
      </ClerkProvider>
    );
  }

  if (convexClient) {
    return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
  }

  return children;
}
