"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RouteBodyClass() {
  const pathname = usePathname();

  useEffect(() => {
    const routeMode = pathname.startsWith("/admin") ? "admin" : "site";
    document.body.setAttribute("data-route-mode", routeMode);

    return () => {
      document.body.removeAttribute("data-route-mode");
    };
  }, [pathname]);

  return null;
}
