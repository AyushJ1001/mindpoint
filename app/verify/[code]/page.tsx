import type { Metadata } from "next";
import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";
import { CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/backend/api";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify a certificate - The Mind Point",
  description:
    "Check the authenticity of a certificate issued by The Mind Point.",
};

async function getCertificate(code: string) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    return await convex.query(api.lms.getCertificateByCode, { code });
  } catch (error) {
    console.warn("Certificate verification failed:", error);
    return null;
  }
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const certificate = await getCertificate(code);

  return (
    <div className="container mx-auto max-w-2xl py-16 sm:py-24">
      <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
        Certificate verification
      </h1>
      <p className="text-muted-foreground mt-3">
        Code <span className="font-medium">{code.toUpperCase()}</span>
      </p>

      <div className="border-border bg-card mt-8 rounded-2xl border p-8">
        {certificate ? (
          <>
            <CheckCircle2 className="text-primary h-8 w-8" />
            <h2 className="font-display mt-4 text-2xl">This certificate is valid</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Recipient</dt>
                <dd className="font-medium">{certificate.userName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Course</dt>
                <dd className="text-right font-medium">
                  {certificate.courseName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Issued</dt>
                <dd className="font-medium">
                  {new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <XCircle className="text-muted-foreground h-8 w-8" />
            <h2 className="font-display mt-4 text-2xl">
              No certificate found
            </h2>
            <p className="text-muted-foreground mt-3 text-sm">
              We couldn&apos;t find a certificate with this code. Double-check
              the code, or contact us if you believe this is a mistake.
            </p>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/courses">Browse courses</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
