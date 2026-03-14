"use client";

import { Button } from "@/components/ui/button";

export function AdminRetryButton() {
  return (
    <Button variant="outline" onClick={() => window.location.reload()}>
      Try Again
    </Button>
  );
}
