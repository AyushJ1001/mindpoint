import { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/backend/api";
import type { PublicCourse } from "@/lib/backend";
import { guideSlugs } from "@/lib/guides";
import { courseSlugs, programmeSlugForCode } from "@/lib/course-content";

// Catalogue category pages (path → course type), listed only while at least
// one course of that type is on sale so empty listings stay out of search.
const CATEGORY_PAGES: [string, PublicCourse["type"]][] = [
  ["certificate", "certificate"],
  ["diploma", "diploma"],
  ["internship", "internship"],
  ["masterclass", "masterclass"],
  ["intro", "pre-recorded"],
  ["resume-studio", "resume-studio"],
  ["supervised", "supervised"],
  ["worksheet", "worksheet"],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.themindpoint.org";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/programs`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/january-2027`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/masterclass`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/verify`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/toc`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/courses/therapy`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    // PTSD is a draft: its page 404s, so it must not be advertised.
    ...courseSlugs()
      .filter((slug) => slug !== "ptsd-complex-trauma")
      .map((slug) => ({
      url: `${baseUrl}/programs/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...guideSlugs().map((slug) => ({
      url: `${baseUrl}/resources/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  try {
    // Skip course fetching during build if CONVEX_URL is not available
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.warn(
        "NEXT_PUBLIC_CONVEX_URL not available, returning static pages only",
      );
      return staticPages;
    }

    // Create a Convex client for server-side data fetching
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Fetch all courses for dynamic sitemap entries
    const courses = await convex.query(api.courses.listCourses, {});

    const liveTypes = new Set(courses.map((course) => course.type));
    const categoryPages = CATEGORY_PAGES.filter(([, type]) =>
      liveTypes.has(type),
    ).map(([page]) => ({
      url: `${baseUrl}/courses/${page}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Programme and therapy detail URLs redirect elsewhere, so list only the
    // course pages that render themselves.
    const coursePages = courses
      .filter(
        (course) =>
          course.type !== "therapy" && !programmeSlugForCode(course.code),
      )
      .map((course) => ({
        url: `${baseUrl}/courses/${course._id}`,
        lastModified: new Date(course._creationTime),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    return [...staticPages, ...categoryPages, ...coursePages];
  } catch (error) {
    console.warn("Failed to fetch courses for sitemap:", error);
    // Return static pages only if there's an error fetching courses
    return staticPages;
  }
}
