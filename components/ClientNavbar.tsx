"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/navbar";
import ServerNavbar from "./ServerNavbar";

export default function ClientNavbar() {
  const pathname = usePathname();

  // On the homepage preview, keep the branded server navbar mounted instead of
  // swapping to the legacy interactive navbar after hydration. This guarantees
  // the TMP wordmark remains visible while we finalize the new homepage header.
  if (pathname === "/") {
    return <ServerNavbar />;
  }

  return <Navbar />;
}
