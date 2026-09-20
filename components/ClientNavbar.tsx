"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import Navbar from "@/app/navbar";
import ServerNavbar from "./ServerNavbar";

export default function ClientNavbar() {
  const [isHydrated, setIsHydrated] = useState(false);
  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Without Clerk keys there is no ClerkProvider, so the interactive navbar
  // (which uses Clerk components) cannot mount. Keep the server navbar.
  if (!isHydrated || !clerkConfigured) {
    return <ServerNavbar />;
  }

  // Once hydrated, show the full interactive navbar with Suspense fallback
  return (
    <Suspense fallback={<ServerNavbar />}>
      <Navbar />
    </Suspense>
  );
}
