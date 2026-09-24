"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import FieldGuideNav from "@/components/field-guide/FieldGuideNav";
import ServerNavbar from "./ServerNavbar";

export default function ClientNavbar() {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // The LMS has its own full-screen shell; hide the marketing navbar there.
  if (pathname.startsWith("/lms")) return null;

  // Server-render the static bar for the first paint, then mount the
  // interactive Field Guide nav (which handles Clerk presence internally).
  if (!isHydrated) {
    return <ServerNavbar />;
  }

  return <FieldGuideNav />;
}
