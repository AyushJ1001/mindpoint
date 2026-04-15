"use client";

import { ReactNode, useMemo } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { useClerkAppOrigin } from "@/lib/clerk-app-url";

type ClerkAppProviderProps = {
  children: ReactNode;
};

/**
 * Wraps children with Clerk when keys exist, wiring sign-in/up URLs and
 * redirect allowlists for preview and per-deployment hosts.
 */
export default function ClerkAppProvider({ children }: ClerkAppProviderProps) {
  const appOrigin = useClerkAppOrigin();

  const clerkOptions = useMemo(() => {
    const signInFromEnv = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
    const signUpFromEnv = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;
    const signInPath = signInFromEnv?.startsWith("http")
      ? signInFromEnv
      : "/sign-in";
    const signUpPath = signUpFromEnv?.startsWith("http")
      ? signUpFromEnv
      : "/sign-up";

    if (!appOrigin) {
      return {
        signInUrl: signInPath,
        signUpUrl: signUpPath,
      };
    }

    const signInUrl = signInPath.startsWith("http")
      ? signInPath
      : `${appOrigin}${signInPath.startsWith("/") ? signInPath : `/${signInPath}`}`;
    const signUpUrl = signUpPath.startsWith("http")
      ? signUpPath
      : `${appOrigin}${signUpPath.startsWith("/") ? signUpPath : `/${signUpPath}`}`;

    const origins: Array<string | RegExp> = [appOrigin];
    if (appOrigin.includes(".vercel.app")) {
      origins.push(/^https:\/\/[^/]+\.vercel\.app$/);
    }

    return {
      signInUrl,
      signUpUrl,
      allowedRedirectOrigins: origins,
    };
  }, [appOrigin]);

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return children;
  }

  return <ClerkProvider {...clerkOptions}>{children}</ClerkProvider>;
}
