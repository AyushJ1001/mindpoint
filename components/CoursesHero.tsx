import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function CoursesHero() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding from-primary/5 via-background to-accent/5 bg-gradient-to-br">
        <div className="container text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="from-primary to-primary/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              All Courses
            </h1>
            <p className="text-muted-foreground mb-8 text-xl leading-relaxed">
              Explore our complete range of courses and programs designed to
              help you grow and succeed
            </p>
          </div>
        </div>
      </section>

      {/* Course Types Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Course Categories
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Choose from our diverse range of course types to find the perfect
              learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Certificate Courses */}
            <Link
              href="/courses/certificate"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Certificate Courses
              </h3>
              <p className="text-muted-foreground text-sm">
                Professional certification programs to enhance your skills and
                credentials
              </p>
            </Link>

            {/* Internship Programs */}
            <Link
              href="/courses/internship"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Internship Programs
              </h3>
              <p className="text-muted-foreground text-sm">
                Hands-on experience through structured internship opportunities
              </p>
            </Link>

            {/* Diploma Programs */}
            <Link
              href="/courses/diploma"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Diploma Programs
              </h3>
              <p className="text-muted-foreground text-sm">
                Comprehensive diploma courses for in-depth knowledge and
                expertise
              </p>
            </Link>

            {/* Pre-recorded Courses */}
            <Link
              href="/courses/pre-recorded"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Pre-recorded Courses
              </h3>
              <p className="text-muted-foreground text-sm">
                Self-paced learning with pre-recorded video content
              </p>
            </Link>

            {/* Masterclasses */}
            <Link
              href="/courses/masterclass"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Masterclasses
              </h3>
              <p className="text-muted-foreground text-sm">
                Intensive sessions with industry experts and thought leaders
              </p>
            </Link>

            {/* Therapy Sessions */}
            <Link
              href="/courses/therapy"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Therapy Sessions
              </h3>
              <p className="text-muted-foreground text-sm">
                Professional therapy and counseling services for mental wellness
              </p>
            </Link>

            {/* Supervised Programs */}
            <Link
              href="/courses/supervised"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Supervised Programs
              </h3>
              <p className="text-muted-foreground text-sm">
                Guided learning programs with expert supervision and mentorship
              </p>
            </Link>

            {/* Resume Studio */}
            <Link
              href="/courses/resume-studio"
              className="group hover:border-primary cursor-pointer rounded-lg border p-6 transition-all hover:shadow-lg"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-primary h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                Resume Studio
              </h3>
              <p className="text-muted-foreground text-sm">
                Professional resume building and career development services
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* All Available Courses Section Header */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12 text-center">
            <div className="bg-primary/10 mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full">
              <BookOpen className="text-primary h-10 w-10" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              All Available Courses
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Browse our complete collection of courses across all categories
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
