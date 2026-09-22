import type { Metadata } from "next";
import Link from "next/link";
import { isClerkServerConfigured } from "@/lib/clerk-env";
import CertificateView from "@/components/learn/certificate-view";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Certificate - The Mind Point",
  robots: { index: false, follow: false },
};

export default async function LearnCertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <div className="container py-12 sm:py-16">
      {isClerkServerConfigured() ? (
        <CertificateView courseId={courseId} />
      ) : (
        <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
          <h2 className="font-display text-2xl">Sign-in isn&apos;t available</h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
            Certificates need Clerk to be configured on this deployment.
          </p>
          <Button asChild className="mt-6">
            <Link href="/courses">Browse courses</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
