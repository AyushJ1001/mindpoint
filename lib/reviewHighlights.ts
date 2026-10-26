// Short quotes from verified course feedback (author = initials, course named),
// for the homepage. Google reviews live in `lib/googleReviews.ts` and are not
// repeated here, so each review appears on the page once. Nothing here is
// invented.

export interface ReviewHighlight {
  author: string;
  quote: string;
  /** The course the feedback was given for, shown as a small label. */
  source: string;
}

export const REVIEW_HIGHLIGHTS: ReviewHighlight[] = [
  {
    author: "Q.S.",
    quote:
      "A blend of theoretical and practical learning that helped me realise a lot about myself. Loved it.",
    source: "Inner Child Healing",
  },
  {
    author: "N.C.",
    quote:
      "Working as an intern felt like being given real scenarios to practise.",
    source: "Counselling Psychology",
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
      "It made me more aware of how to listen, understand and respond to others with empathy.",
    source: "Counselling Psychology",
  },
];
