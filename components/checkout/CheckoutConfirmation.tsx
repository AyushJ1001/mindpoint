import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Mail, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmedEnrollment = {
  courseName: string;
  courseType?: string;
  enrollmentNumber: string;
  isBogoFree?: boolean;
};

const lmsCourseTypes = new Set([
  "pre-recorded",
  "certificate",
  "diploma",
  "internship",
  "masterclass",
]);

export function CheckoutConfirmation({
  email,
  enrollments,
}: {
  email: string;
  enrollments: ConfirmedEnrollment[];
}) {
  const hasLearningWorkspace = enrollments.some((item) =>
    lmsCourseTypes.has(item.courseType ?? ""),
  );

  return (
    <main className="bg-background text-foreground min-h-[calc(100vh-5rem)] px-3 py-6 sm:px-6 sm:py-10">
      <section className="bg-card mx-auto max-w-4xl overflow-hidden rounded-3xl shadow-[0_20px_55px_-34px_rgba(19,46,43,0.45)]">
        <header className="water-band-deep flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <Image
            src="/brand/the-mind-point-logo.png"
            alt="The Mind Point"
            width={280}
            height={214}
            className="h-auto w-44 brightness-0 invert sm:w-52"
            priority
          />
          <div className="text-primary-foreground/70 flex items-center gap-3 text-sm">
            <span className="bg-primary-foreground text-primary flex h-10 w-10 items-center justify-center rounded-full">
              <Check className="h-5 w-5" aria-hidden="true" />
            </span>
            Enrollment confirmed
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="px-6 py-9 sm:px-10 sm:py-12">
            <h1 className="font-display text-foreground max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.03em] sm:text-5xl">
              Your learning space is ready to welcome you.
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-7">
              Your Enrollment is safely recorded. Start with My Learning, where
              each Course will open as its Curriculum and activities are
              released.
            </p>

            <div className="border-border mt-8 border-y">
              {enrollments.map((enrollment) => (
                <div
                  className="border-border flex items-start gap-4 border-b py-5 last:border-b-0"
                  key={`${enrollment.enrollmentNumber}-${enrollment.courseName}`}
                >
                  <Waves
                    className="text-primary mt-1 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm leading-6">
                      {enrollment.courseName}
                    </strong>
                    <span className="text-muted-foreground mt-1 block text-xs">
                      {enrollment.isBogoFree
                        ? "Included Enrollment"
                        : "Enrollment"}
                      {enrollment.enrollmentNumber !== "N/A"
                        ? ` · ${enrollment.enrollmentNumber}`
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-2xl px-6"
              >
                <Link
                  href={
                    hasLearningWorkspace ? "/lms" : "/account?tab=enrollments"
                  }
                >
                  {hasLearningWorkspace
                    ? "Go to My Learning"
                    : "View my Enrollment"}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-border text-primary hover:bg-secondary h-12 rounded-2xl bg-transparent px-6"
              >
                <Link href="/courses">Explore another Course</Link>
              </Button>
            </div>
          </div>

          <aside className="bg-secondary px-6 py-8 sm:px-10 lg:px-7 lg:py-12">
            <Mail className="text-primary h-5 w-5" aria-hidden="true" />
            <h2 className="font-display text-foreground mt-5 text-2xl font-semibold">
              Confirmation sent
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-6 break-words">
              We sent the Course details and your next step to {email}.
            </p>
            <p className="border-border text-muted-foreground mt-7 border-t pt-6 text-xs leading-5">
              Live and cohort Courses may release materials gradually. Your
              Enrollment stays visible while the Course team prepares each
              learning stage.
            </p>
            <Link
              className="text-primary decoration-primary/40 hover:decoration-primary mt-6 inline-flex text-sm font-semibold underline underline-offset-4"
              href="/contact"
            >
              Need help?
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
