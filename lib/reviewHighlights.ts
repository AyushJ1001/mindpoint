// Curated highlights from real reviews, for the homepage. Course quotes come
// from verified course feedback (author = initials, course named); the rest are
// from The Mind Point's Google Business profile. Nothing here is invented.

export interface ReviewHighlight {
  author: string;
  quote: string;
  /** Where the quote came from, shown as a small label. */
  source: string;
}

export const REVIEW_HIGHLIGHTS: ReviewHighlight[] = [
  {
    author: "H.V.",
    quote:
      "The course structure was well organised, blending theoretical concepts with interactive, practical sessions.",
    source: "Google",
  },
  {
    author: "Q.S.",
    quote:
      "A blend of theoretical and practical learning that helped me realise a lot about myself. Loved it.",
    source: "Inner Child Healing",
  },
  {
    author: "T.P.",
    quote:
      "Very interesting, interactive and fun classes. I learned more than factual knowledge.",
    source: "Google",
  },
  {
    author: "N.C.",
    quote:
      "Working as an intern felt like being given real scenarios to practise.",
    source: "Counselling Psychology",
  },
  {
    author: "S.P.",
    quote:
      "Amazing courses, amazing faculty. A very unique teaching method which is very enjoyable. 10/10 recommend.",
    source: "Google",
  },
  {
    author: "B.B.",
    quote:
      "The course was insightful and I learned many new concepts and techniques.",
    source: "CBT, REBT & CBMT",
  },
  {
    author: "D.S.",
    quote:
      "It made me more aware of how to listen, understand and respond to others with empathy. I feel more confident supporting people.",
    source: "Counselling Psychology",
  },
  {
    author: "G.N.",
    quote:
      "My experience with Mind Point has been quite insightful. The content is practical and easy to follow.",
    source: "Google",
  },
  {
    author: "A.C.",
    quote: "Now I am confident to apply these therapies with my clients.",
    source: "CBT, REBT & CBMT",
  },
];
