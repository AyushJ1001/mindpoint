// Real reviews from The Mind Point's Google Business profile (September 2026).
//
// Only reviews with no per-course home live here; the ones that name a specific
// course are attached to that course instead. Authors are reduced to initials
// and faculty names are removed. Dates are approximate, matching the relative
// time Google shows ("6 months ago").

export const GOOGLE_RATING = { average: 4.8, count: 248 } as const;

export interface GoogleReview {
  author: string;
  /** Approximate age of the review, in months, as shown on Google. */
  monthsAgo: number;
  content: string;
}

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    author: "S.D.",
    monthsAgo: 6,
    content:
      "I recently completed a course with The Mind Point and it has been an amazing experience. The teaching was wonderful throughout, and I finished with a wealth of knowledge and insight. I am grateful for the clarity and depth brought to every session.",
  },
  {
    author: "G.N.",
    monthsAgo: 7,
    content:
      "My experience with Mind Point has been quite insightful, especially in understanding emotional healing and relationship patterns. The content is practical and easy to follow. Loved the experience.",
  },
  {
    author: "S.P.",
    monthsAgo: 12,
    content:
      "Amazing courses, amazing faculty! Thoroughly enjoyed the activities and lessons. The Mind Point has a very unique teaching method which is very enjoyable. 10/10 recommend.",
  },
  {
    author: "T.P.",
    monthsAgo: 12,
    content:
      "Very interesting, interactive and fun classes. The course was very informative and all of us created a good bond. I learned more than factual knowledge — we shared experiences and had intellectual conversations.",
  },
  {
    author: "H.V.",
    monthsAgo: 12,
    content:
      "This has been an incredibly enriching experience. The course structure was well organised, blending theoretical concepts with interactive, practical sessions. The instructors were experienced professionals, always approachable.",
  },
  {
    author: "P.G.",
    monthsAgo: 36,
    content:
      "My experience at Mind Point was very insightful. The course was taught very well. Our mentor was very understanding and friendly and made sure we understood every topic.",
  },
];
