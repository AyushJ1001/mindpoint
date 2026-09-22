"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Award, Printer } from "lucide-react";

import { api } from "@/lib/backend/api";
import type { Id } from "@/lib/backend/data-model";
import { Button } from "@/components/ui/button";

export default function CertificateView({ courseId }: { courseId: string }) {
  const id = courseId as Id<"courses">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const certificate = useQuery(
    api.lms.getMyCertificate,
    isAuthenticated ? { courseId: id } : "skip",
  );
  const quiz = useQuery(
    api.quizzes.getCourseQuiz,
    isAuthenticated ? { courseId: id } : "skip",
  );
  const ensure = useMutation(api.lms.ensureMyCertificate);

  useEffect(() => {
    if (certificate !== null) return;
    ensure({ courseId: id }).catch(() => {
      /* not complete yet, or not enrolled */
    });
  }, [certificate, ensure, id]);

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
        <h2 className="font-display text-2xl">Sign in to see your certificate</h2>
        <SignInButton mode="modal">
          <Button className="mt-6">Sign in</Button>
        </SignInButton>
      </div>
    );
  }

  if (certificate === undefined) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (certificate === null) {
    const quizBlocks = Boolean(quiz?.quiz && !quiz.passed);
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed p-10 text-center">
        <Award className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
        <h2 className="font-display text-2xl">Not quite yet</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          {quizBlocks
            ? "Pass the course quiz to unlock your certificate."
            : "Finish every lesson in this course to unlock your certificate."}
        </p>
        <Button asChild className="mt-6">
          <Link href={`/learn/${courseId}`}>Back to the course</Link>
        </Button>
      </div>
    );
  }

  const issued = new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="border-primary/25 bg-card rounded-2xl border-2 px-8 py-14 text-center sm:px-14">
        <p className="text-primary text-[0.7rem] font-semibold tracking-[0.32em] uppercase">
          The Mind Point
        </p>
        <h1 className="font-display mt-6 text-3xl tracking-tight sm:text-4xl">
          Certificate of Completion
        </h1>
        <p className="text-muted-foreground mt-10 text-sm">
          This certifies that
        </p>
        <p className="font-display mt-2 text-3xl">{certificate.userName}</p>
        <p className="text-muted-foreground mt-8 text-sm">
          has successfully completed
        </p>
        <p className="font-display mt-2 text-2xl">{certificate.courseName}</p>
        <p className="text-muted-foreground mt-10 text-sm">Issued {issued}</p>
        <p className="text-muted-foreground mt-2 text-xs tracking-[0.16em] uppercase">
          Verification code · {certificate.verificationCode}
        </p>
        {certificate.enrollmentNumber && (
          <p className="text-muted-foreground mt-1 text-xs">
            Enrollment {certificate.enrollmentNumber}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
        <Button type="button" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print / Save as PDF
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/verify/${certificate.verificationCode}`}>
            Public verification
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href={`/learn/${courseId}`}>Back to course</Link>
        </Button>
      </div>
    </div>
  );
}
