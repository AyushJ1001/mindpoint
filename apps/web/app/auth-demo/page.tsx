import type { Metadata } from "next";
import Link from "next/link";
import { AuthDemoClient } from "./ui";

export const metadata: Metadata = {
  title: "Clerk auth demo | The Mind Point",
  robots: { index: false, follow: false },
};

export default function AuthDemoPage() {
  return (
    <div className="container max-w-lg py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Clerk auth demo</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Use this page on preview or staging hosts to confirm sign-in, session
        cookies, and redirects for the current deployment URL.
      </p>
      <div className="mt-8">
        <AuthDemoClient />
      </div>
      <p className="text-muted-foreground mt-8 text-xs">
        <Link
          href="/"
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </p>
    </div>
  );
}
