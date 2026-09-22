import type { Metadata } from "next";
import Link from "next/link";
import { isClerkServerConfigured } from "@/lib/clerk-env";
import LearnDashboard from "@/components/learn/learn-dashboard";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My learning - The Mind Point",
  description: "Your enrolled courses and lessons.",
  robots: { index: false, follow: false },
};

export default function LearnPage() {
  return (
    <div className="container py-12 sm:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          My learning
        </h1>
        <p className="text-muted-foreground mt-2">
          Your enrolled courses and the lessons inside them.
        </p>
      </div>

      {isClerkServerConfigured() ? (
        <LearnDashboard />
      ) : (
        <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
          <h2 className="font-display text-2xl">Sign-in isn&apos;t available</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Account access needs Clerk to be configured on this deployment.
            Browse courses in the meantime.
          </p>
          <Button asChild className="mt-6">
            <Link href="/courses">Browse courses</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
