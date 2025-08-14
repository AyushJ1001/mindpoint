import type { Metadata } from "next";
import { api } from "@/convex/_generated/api";
import CourseClient from "./CourseClient";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import Script from "next/script";

// Create a Convex client for server-side data fetching
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const course = await convex.query(api.courses.getCourseById, {
      id: params.id as Id<"courses">,
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
        url: `https://themindpoint.org/courses/${params.id}`,
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
    const course = await convex.query(api.courses.getCourseById, {
      id: params.id as Id<"courses">,
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
      id: params.id as Id<"courses">,
    });

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
      url: `https://themindpoint.org/courses/${params.id}`,
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
        price: course.price || 0,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: `https://themindpoint.org/courses/${params.id}`,
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
        <CourseClient course={course} variants={variants ?? []} />
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
