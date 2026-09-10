"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import Navbar from "@/app/navbar";
import ServerNavbar from "./ServerNavbar";

export default function ClientNavbar() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Always show server navbar during SSR and initial hydration
  if (!isHydrated) {
    return <ServerNavbar />;
  }

  // Once hydrated, show the full interactive navbar with Suspense fallback
  return (
    <Suspense fallback={<ServerNavbar />}>
      <Navbar />
    </Suspense>
  );
}
