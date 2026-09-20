"use client";

import { useEffect, useState } from "react";
import FieldGuideNav from "@/components/field-guide/FieldGuideNav";
import ServerNavbar from "./ServerNavbar";

export default function ClientNavbar() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Server-render the static bar for the first paint, then mount the
  // interactive Field Guide nav (which handles Clerk presence internally).
  if (!isHydrated) {
    return <ServerNavbar />;
  }

  return <FieldGuideNav />;
}
