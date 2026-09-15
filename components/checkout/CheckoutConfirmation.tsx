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
    <main className="min-h-[calc(100vh-5rem)] bg-[#eef5f1] px-3 py-6 text-[#123f40] sm:px-6 sm:py-10">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-[#fffaf0] shadow-[0_20px_55px_rgba(0,62,65,0.11)]">
        <header className="flex flex-col gap-5 bg-[#003f43] px-6 py-7 text-[#fffaf0] sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <Image
            src="/brand/the-mind-point-logo.png"
            alt="The Mind Point"
            width={220}
            height={168}
            className="h-auto w-36 brightness-0 invert sm:w-44"
            priority
          />
          <div className="flex items-center gap-3 text-sm text-[#bcd8d3]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dcecea] text-[#07575b]">
              <Check className="h-5 w-5" aria-hidden="true" />
            </span>
            Enrollment confirmed
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="px-6 py-9 sm:px-10 sm:py-12">
            <h1 className="font-display max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.03em] text-[#003f43] sm:text-5xl">
              Your learning space is ready to welcome you.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#58706d]">
              Your Enrollment is safely recorded. Start with My Learning, where
              each Course will open as its Curriculum and activities are
              released.
            </p>

            <div className="mt-8 border-y border-[rgba(7,77,79,0.15)]">
              {enrollments.map((enrollment) => (
                <div
                  className="flex items-start gap-4 border-b border-[rgba(7,77,79,0.15)] py-5 last:border-b-0"
                  key={`${enrollment.enrollmentNumber}-${enrollment.courseName}`}
                >
                  <Waves
                    className="mt-1 h-5 w-5 shrink-0 text-[#0c6f73]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm leading-6">
                      {enrollment.courseName}
                    </strong>
                    <span className="mt-1 block text-xs text-[#58706d]">
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
                className="h-12 rounded-2xl bg-[#0c6f73] px-6 text-[#fffaf0] hover:bg-[#07575b]"
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
                className="h-12 rounded-2xl border-[rgba(7,77,79,0.2)] bg-transparent px-6 text-[#07575b] hover:bg-[#dcecea]"
              >
                <Link href="/courses">Explore another Course</Link>
              </Button>
            </div>
          </div>

          <aside className="bg-[#e7f0eb] px-6 py-8 sm:px-10 lg:px-7 lg:py-12">
            <Mail className="h-5 w-5 text-[#0c6f73]" aria-hidden="true" />
            <h2 className="font-display mt-5 text-2xl font-semibold text-[#003f43]">
              Confirmation sent
            </h2>
            <p className="mt-3 text-sm leading-6 break-words text-[#58706d]">
              We sent the Course details and your next step to {email}.
            </p>
            <p className="mt-7 border-t border-[rgba(7,77,79,0.15)] pt-6 text-xs leading-5 text-[#58706d]">
              Live and cohort Courses may release materials gradually. Your
              Enrollment stays visible while the Course team prepares each
              learning stage.
            </p>
            <Link
              className="mt-6 inline-flex text-sm font-semibold text-[#07575b] underline decoration-[rgba(7,77,79,0.3)] underline-offset-4"
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
