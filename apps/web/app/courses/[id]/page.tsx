import type { Metadata } from "next";
import { api } from "@mindpoint/backend/api";
import type { PublicCourse, PublicCourseBatch } from "@mindpoint/backend";
import CourseClient from "./CourseClient";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@mindpoint/backend/data-model";
import Script from "next/script";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

function buildLegacyFallbackBatch(
  course: PublicCourse,
  courseId: Id<"courses">,
): PublicCourseBatch {
  const capacity = course?.capacity ?? 0;
  const seatsFilled = Math.max(0, course?.enrolledCount ?? 0);
  const availableSeats = Math.max(0, capacity - seatsFilled);

  return {
    _id: `legacy-${String(courseId)}` as Id<"courseBatches">,
    _creationTime: Date.now(),
    courseId,
    batchCode: `${course?.code ?? "COURSE"}-LEGACY`,
    label: "Current schedule",
    timezone: "Asia/Kolkata",
    startDate: course?.startDate ?? "",
    endDate: course?.endDate ?? course?.startDate ?? "",
    startTime: course?.startTime ?? "",
    endTime: course?.endTime ?? "",
    daysOfWeek: [],
    enrollmentCutoffAt: undefined,
    capacity,
    seatsFilled,
    availableSeats,
    waitlistEnabled: false,
    lifecycleStatus: "open",
    isPurchasable: availableSeats > 0,
    isDefault: true,
  };
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    if (!convex) {
      return {
        title: "Course - The Mind Point",
        description:
          "Learn about our mental health courses and professional development programs.",
      };
    }

    const { id } = await params;
    const course = await convex.query(api.courses.getCourseById, {
      id: id as Id<"courses">,
    });

    if (!course) {
      return {
        title: "Course Not Found - The Mind Point",
        description: "The requested course could not be found.",
      };
    }

    const description = course.description
      ? course.description.substring(0, 160) +
        (course.description.length > 160 ? "..." : "")
      : `Learn about ${course.name} at The Mind Point. Professional mental health education and training.`;

    return {
      title: `${course.name} - The Mind Point`,
      description,
      keywords: [
        course.name,
        "mental health",
        "psychology",
        "counseling",
        "therapy",
        "professional development",
        "online courses",
        "The Mind Point",
      ].join(", "),
      openGraph: {
        title: `${course.name} - The Mind Point`,
        description,
        type: "website",
        url: `https://themindpoint.org/courses/${id}`,
        images:
          course.imageUrls && course.imageUrls.length > 0
            ? [
                {
                  url: course.imageUrls[0],
                  width: 1200,
                  height: 630,
                  alt: course.name,
                },
              ]
            : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${course.name} - The Mind Point`,
        description,
        images:
          course.imageUrls && course.imageUrls.length > 0
            ? [course.imageUrls[0]]
            : undefined,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Course - The Mind Point",
      description:
        "Learn about our mental health courses and professional development programs.",
    };
  }
}

export default async function CoursePage({ params }: Props) {
  try {
    if (!convex) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Course Unavailable</h1>
            <p className="text-muted-foreground">
              Course data is currently unavailable.
            </p>
          </div>
        </div>
      );
    }

    const { id } = await params;
    const course = await convex.query(api.courses.getCourseById, {
      id: id as Id<"courses">,
    });

    if (!course) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Course Not Found</h1>
            <p className="text-muted-foreground">
              The requested course could not be found.
            </p>
          </div>
        </div>
      );
    }

    // Prefetch related variants (same name & type) to enable instant switching
    const variants = await convex.query(api.courses.getRelatedVariants, {
      id: id as Id<"courses">,
    });
    const courseId = id as Id<"courses">;
    let batches: PublicCourseBatch[] = [];
    try {
      batches = await convex.query(api.courseBatches.listPublicBatchesForCourse, {
        courseId,
      });
    } catch (batchError) {
      console.error("Batch query unavailable, using legacy fallback:", batchError);
      batches = [buildLegacyFallbackBatch(course, courseId)];
    }

    // Generate structured data for the course
    const courseStructuredData = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.name,
      description:
        course.description || `Learn about ${course.name} at The Mind Point`,
      provider: {
        "@type": "Organization",
        name: "The Mind Point",
        url: "https://themindpoint.org",
      },
      url: `https://themindpoint.org/courses/${id}`,
      image:
        course.imageUrls && course.imageUrls.length > 0
          ? course.imageUrls[0]
          : undefined,
      courseMode: "online",
      educationalLevel: "professional",
      inLanguage: "en",
      isAccessibleForFree: false,
      offers: {
        "@type": "Offer",
        price: Math.round(course.price || 0),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: `https://themindpoint.org/courses/${id}`,
      },
      coursePrerequisites: course.prerequisites || "No prerequisites required",
      educationalCredentialAwarded:
        course.type === "certificate"
          ? "Certificate"
          : course.type === "diploma"
            ? "Diploma"
            : "Course Completion",
      timeRequired: course.duration || "Varies by course",
      teaches: course.content || course.description || course.name,
      about: [
        {
          "@type": "Thing",
          name: "Mental Health",
        },
        {
          "@type": "Thing",
          name: "Psychology",
        },
        {
          "@type": "Thing",
          name: "Professional Development",
        },
      ],
    };

    return (
      <>
        <Script
          id="course-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(courseStructuredData),
          }}
        />
        <CourseClient
          course={course}
          variants={variants ?? []}
          batches={batches ?? []}
        />
      </>
    );
  } catch (error) {
    console.error("Error loading course:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Error Loading Course</h1>
          <p className="text-muted-foreground">
            There was an error loading the course. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
