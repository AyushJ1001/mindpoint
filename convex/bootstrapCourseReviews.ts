import { internalMutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// Course review import (owner request, September 2026).
//
// Sources are real reviews only:
//   - 55 course-feedback submissions from students (each carries the date it
//     was submitted), and
//   - course-specific reviews from The Mind Point's Google Business profile
//     (dated approximately, as Google shows relative times).
//
// Each review is published against a live course the student's work maps to,
// with the author reduced to initials and any faculty name removed. Nothing is
// invented and no date is falsified. Reviews whose only home is an archived
// course (which no longer has a page) are skipped and reported.
//
// Run once against a deployment:
//   npx convex run bootstrapCourseReviews:importCourseReviews --prod
//
// Idempotent: each seed carries a stable `key`, stored as `userId`
// ("import:<key>"), and is skipped when that review already exists — including
// the earlier `sheet-import:*` run, matched via `legacyUserId`.

const ACTOR = "bootstrap:course-reviews";

// A fixed date, for the feedback-form submissions (real submission dates).
function on(iso: string): number {
  return Date.parse(`${iso}T12:00:00Z`);
}

// An approximate date, for Google reviews shown as "N months ago".
function monthsAgo(months: number): number {
  const date = new Date(Date.now());
  date.setMonth(date.getMonth() - months);
  return date.getTime();
}

// Rating is derived from what the student actually wrote:
//   5   glowing, recommends, or clearly delighted
//   4.5 positive with no criticism, or a brief but happy response
//   4   positive with a specific improvement suggestion
//   3   mixed or notable criticism
type ReviewSeed = {
  key: string;
  code: string;
  match: string;
  author: string;
  rating: number;
  content: string;
  submittedAt: number;
  // Reviews already imported by the earlier `sheet-import:*` run. When that row
  // is present it is left alone rather than duplicated.
  legacyUserId?: string;
};

const FEEDBACK_REVIEWS: ReviewSeed[] = [
  // ── Boundary Setting & Assertive Communication ───────────────────────
  {
    key: "bsac-gg-1",
    code: "CCBSAC",
    match: "boundary",
    author: "G.G.",
    rating: 5,
    submittedAt: on("2026-03-19"),
    content:
      "The course was super informative and fun filled too. The major problem of boundary setting that every Indian woman faces was taught in a very easy and crisp way. I will say, do join the course.",
  },
  {
    key: "bsac-pa-1",
    code: "CCBSAC",
    match: "boundary",
    author: "P.A.",
    rating: 5,
    submittedAt: on("2026-03-20"),
    content:
      "The course was very insightful and thoughtfully prepared. I appreciate how it addressed communication patterns relevant to today's world and emphasised setting healthy boundaries at both home and the workplace. I especially liked learning how to maintain these boundaries without feeling guilt. The examples were practical and easy to relate to.",
  },
  {
    key: "bsac-am-1",
    code: "CCBSAC",
    match: "boundary",
    author: "A.M.",
    rating: 5,
    submittedAt: on("2026-03-20"),
    content:
      "The course has been informative and helpful. We learned a lot about setting boundaries and how to not people-please. It centred on teaching valuable skills that one needs in life, so I am grateful I got to attend these classes. The classes helped in deciding how to implement these skills in real-life scenarios as well.",
  },
  {
    key: "bsac-sn-1",
    code: "CCBSAC",
    match: "boundary",
    author: "S.N.",
    rating: 4.5,
    submittedAt: on("2026-03-20"),
    content:
      "The course was fabulous. I got clarity, and I really enjoyed doing the assignments and the project.",
  },
  {
    key: "bsac-n-1",
    code: "CCBSAC",
    match: "boundary",
    author: "N.",
    rating: 4.5,
    submittedAt: on("2026-03-20"),
    content: "Good course. Clear and useful.",
  },

  // ── Employee Assistance Program ──────────────────────────────────────
  {
    key: "eap-uk-1",
    code: "INEAPC",
    match: "employee assistance",
    author: "U.K.",
    rating: 4.5,
    submittedAt: on("2026-04-01"),
    content:
      "The faculty was very supportive all throughout the course and explained everything really well. She was very patient when I was not able to understand things. The content could be a little more structured and elaborate with a few more things added.",
  },
  {
    key: "eap-gg-1",
    code: "INEAPC",
    match: "employee assistance",
    author: "G.G.",
    rating: 5,
    submittedAt: on("2026-04-14"),
    content:
      "The faculty always does the best possible job of making us understand. Her teaching is extraordinarily excellent. I enjoy her classes. The course was good.",
  },

  // ── Neurodevelopmental Disorders Therapy ─────────────────────────────
  {
    key: "ndd-nh-1",
    code: "CCNDDT",
    match: "neurodevelopmental",
    author: "N.H.",
    rating: 5,
    submittedAt: on("2026-04-01"),
    content:
      "The classes were knowledgeable and so interesting. The faculty is kind, and her way of teaching is amazing. Very useful and interesting.",
  },
  {
    key: "ndd-nh-2",
    code: "CCNDDT",
    match: "neurodevelopmental",
    author: "N.H.",
    rating: 5,
    submittedAt: on("2026-04-01"),
    content:
      "NDD is an important and very knowledgeable area, and it was taught in an interesting way. It will be very useful for my career.",
  },
  {
    key: "ndd-sk-1",
    code: "CCNDDT",
    match: "neurodevelopmental",
    author: "S.K.",
    rating: 4.5,
    submittedAt: on("2026-04-05"),
    content:
      "Very informative and a cordial experience with the instructors and colleagues. I enjoyed it and look forward to enrolling in more courses for sure.",
  },

  // ── Mindfulness-Based Stress Reduction ───────────────────────────────
  {
    key: "mbsr-rg-1",
    code: "CCMBSR",
    match: "mindfulness",
    author: "R.G.",
    rating: 5,
    submittedAt: on("2026-04-19"),
    content:
      "The classes were conducted very well and were understandable. The faculty used practical real-life examples, which was so informative. This course is useful for both ourselves and our clients. Through it I have learned various techniques.",
  },
  {
    key: "mbsr-sk-1",
    code: "CCMBSR",
    match: "mindfulness",
    author: "S.K.",
    rating: 5,
    submittedAt: on("2026-04-19"),
    content:
      "The faculty were experts in teaching and had thorough knowledge of the subject. The course was very well structured. Looking forward to joining some more as well.",
  },
  {
    key: "mbsr-sb-1",
    code: "CCMBSR",
    match: "mindfulness",
    author: "S.B.",
    rating: 5,
    submittedAt: on("2026-04-19"),
    content:
      "A truly enriching experience learning mindfulness. The teaching is calm, practical and deeply insightful, and each session helped me understand my thoughts better, manage emotions and stay more present in daily life. The techniques are simple yet powerful and actually work when applied consistently. I have noticed more clarity, reduced stress and better focus. Highly recommended.",
  },
  {
    key: "mbsr-bh-1",
    code: "CCMBSR",
    match: "mindfulness",
    author: "B.H.",
    rating: 5,
    submittedAt: on("2026-04-19"),
    content:
      "The faculty has been very kind and supportive throughout the course, with a calm and encouraging approach. The MBSR course has been a wonderful experience. It helped me understand how mindfulness can be used in therapeutic interventions and in daily life, and equipped me with better skills as a psychologist. Learning the variety of techniques has been really helpful.",
  },
  {
    key: "mbsr-ss-1",
    code: "CCMBSR",
    match: "mindfulness",
    author: "S.S.",
    rating: 3,
    submittedAt: on("2026-04-19"),
    content:
      "The faculty is good at exploring the concept but could improve the involvement of everyone in the class, as it felt like she talked most of the time.",
  },
  {
    key: "mbsr-ds-1",
    code: "CCMBSR",
    match: "mindfulness",
    author: "D.S.",
    rating: 5,
    submittedAt: on("2026-04-22"),
    content:
      "The faculty was very helpful and supportive, clearing all the doubts. She explained everything clearly and had us do the activities so we could understand how each one works and how to use it with real clients. The course covered the maximum topics and techniques and was interactive and engaging, with everyone encouraged to share ideas openly and without judgement. I would definitely recommend it to my friends.",
  },

  // ── Counselling Internship ───────────────────────────────────────────
  {
    key: "intern-ll-1",
    legacyUserId: "sheet-import:16",
    code: "INCLP",
    match: "counselling psychology",
    author: "L.L.",
    rating: 5,
    submittedAt: on("2026-04-22"),
    content:
      "I had an amazing experience. I learned a lot about counselling and about myself too. The course was well structured and easy to understand.",
  },
  {
    key: "intern-k-1",
    legacyUserId: "sheet-import:17",
    code: "INCLP",
    match: "counselling psychology",
    author: "K.",
    rating: 4.5,
    submittedAt: on("2026-04-22"),
    content:
      "The faculty is nice and experienced and I enjoyed the learning; she is helpful and tries to solve problems in every possible way. The 120-hour course was good, though for depth of knowledge I feel one should enrol in the 240-hour course.",
  },
  {
    key: "intern-ds-1",
    legacyUserId: "sheet-import:18",
    code: "INCLP",
    match: "counselling psychology",
    author: "D.S.",
    rating: 5,
    submittedAt: on("2026-04-22"),
    content:
      "The faculty was very supportive and approachable throughout the internship. I felt comfortable learning and asking questions, and her guidance helped me understand counselling concepts in a simple and practical way. This was a meaningful learning experience: I am more aware of how to listen, understand and respond to others with empathy, and I feel more confident in my ability to support people.",
  },
  {
    key: "intern-tb-1",
    legacyUserId: "sheet-import:19",
    code: "INCLP",
    match: "counselling psychology",
    author: "T.B.",
    rating: 5,
    submittedAt: on("2026-04-22"),
    content:
      "It was an amazing course. The faculty is a very good teacher and helped me understand a lot of concepts. It is very informative and I gained a whole new set of skills.",
  },
  {
    key: "intern-na-1",
    legacyUserId: "sheet-import:20",
    code: "INCLP",
    match: "counselling psychology",
    author: "N.A.",
    rating: 4.5,
    submittedAt: on("2026-04-22"),
    content:
      "I had a great experience. She was cooperative and explained everything in detail. Overall my experience was good.",
  },
  {
    key: "intern-nc-1",
    legacyUserId: "sheet-import:21",
    code: "INCLP",
    match: "counselling psychology",
    author: "N.C.",
    rating: 5,
    submittedAt: on("2026-04-22"),
    content:
      "The faculty is very experienced and a good mentor. The way of guidance is very helpful and she is a good support for us to learn new skills. The course is very helpful in providing practical experience, and working as an intern felt like being given real scenarios to practise.",
  },
  {
    key: "intern-gg-1",
    legacyUserId: "sheet-import:22",
    code: "INCLP",
    match: "counselling psychology",
    author: "G.G.",
    rating: 5,
    submittedAt: on("2026-04-22"),
    content:
      "The faculty's explanations are very good and she takes the course very systematically. The course was very good, with all the practical sessions included.",
  },

  // ── Advanced Integrative Creative Healing Therapy ────────────────────
  {
    key: "aicht-gs-1",
    code: "CCAICHT",
    match: "creative healing",
    author: "G.S.",
    rating: 5,
    submittedAt: on("2026-05-02"),
    content:
      "The faculty is one of the nicest teachers I have come across. Her way of teaching and the assignments she gives all help us actually learn and apply our learning outside the classroom. This course truly changed me and made me realise how much I value creative expression in therapy. The final project made me reflect on what I have learned and what I would like to be in the future. Truly insightful.",
  },
  {
    key: "aicht-pa-1",
    code: "CCAICHT",
    match: "creative healing",
    author: "P.A.",
    rating: 5,
    submittedAt: on("2026-05-02"),
    content:
      "The faculty is an excellent teacher, very knowledgeable with a pleasant demeanour. She simplifies complex concepts and presents them in a meaningful and practical way, and has a unique ability to balance theory with embodied experience, allowing the learning to be felt rather than just understood. The course beautifully integrates art, music and dance, making learning deeply experiential and engaging.",
  },
  {
    key: "aicht-rl-1",
    code: "CCAICHT",
    match: "creative healing",
    author: "R.L.",
    rating: 5,
    submittedAt: on("2026-05-03"),
    content:
      "Absolutely knowledgeable faculty. The course was very useful for my practice and my purpose was fulfilled.",
  },
  {
    key: "aicht-pp-1",
    code: "CCAICHT",
    match: "creative healing",
    author: "P.P.",
    rating: 5,
    submittedAt: on("2026-05-04"),
    content:
      "The best experience, learning from the faculty. This course is the best way to use healing-therapy sessions for deep healing and to connect with yourself.",
  },

  // ── Applied Behaviour Analysis ───────────────────────────────────────
  {
    key: "aba-sm-1",
    code: "CCABA",
    match: "applied behav",
    author: "S.M.",
    rating: 5,
    submittedAt: on("2026-05-10"),
    content:
      "The faculty is so friendly and explained everything nicely until we understood the concept fully. I learned new techniques and ideas in this course to deal with children with special needs.",
  },
  {
    key: "aba-pc-1",
    code: "CCABA",
    match: "applied behav",
    author: "P.C.",
    rating: 5,
    submittedAt: on("2026-05-10"),
    content:
      "I would like to thank the faculty for supporting us throughout the ABA course. She conducted the course in a very practical, hands-on way which helped us understand and apply the concepts in real-life scenarios. The assignments and projects were also very practical and I learned a lot while doing them. All her classes were well interactive and she gave individual attention to each one of us.",
  },
  {
    key: "aba-sm-2",
    code: "CCABA",
    match: "applied behav",
    author: "S.M.",
    rating: 4.5,
    submittedAt: on("2026-05-10"),
    content:
      "The course facilitator was good in teaching and was very approachable. It was a really informative and useful set of sessions conducted in a friendly manner.",
  },
  {
    key: "aba-s-1",
    code: "CCABA",
    match: "applied behav",
    author: "S.",
    rating: 5,
    submittedAt: on("2026-05-10"),
    content:
      "The faculty is really supportive. The course structure is very organised and gives deeply structured knowledge.",
  },

  // ── Psycho-oncology ──────────────────────────────────────────────────
  {
    key: "psyony-k-1",
    code: "INPSYONY",
    match: "psycho-oncology",
    author: "K.",
    rating: 5,
    submittedAt: on("2026-06-09"),
    content:
      "The faculty was amazing throughout the course and tried to make it as real as possible; content delivery and support were top notch. The course gave me clarity on whether I can work with cancer patients, and much more.",
  },
  {
    key: "psyony-gg-1",
    code: "INPSYONY",
    match: "psycho-oncology",
    author: "G.G.",
    rating: 5,
    submittedAt: on("2026-06-09"),
    content:
      "The faculty is just amazing, especially the effort she puts into making the class and the course interesting. She is always cooking up something interesting to keep the class lively. The course was amazing too.",
  },
  {
    key: "psyony-gs-1",
    code: "INPSYONY",
    match: "psycho-oncology",
    author: "G.S.",
    rating: 5,
    submittedAt: on("2026-06-09"),
    content:
      "The faculty is one of the best teachers I have come across. Her classes are extremely interactive, with lots of questions and newer ways of teaching and learning. A wonderful experience: the assignments taught us a lot, and so did the interactive roleplays.",
  },
  {
    key: "psyony-hk-1",
    code: "INPSYONY",
    match: "psycho-oncology",
    author: "H.K.",
    rating: 5,
    submittedAt: on("2026-06-09"),
    content:
      "Really good teaching techniques and an engaging, curious environment created by the faculty. Genuinely a really good teacher and mentor. The classes were interactive, and because of the small batch the mentor was able to pay attention to all of us individually. The roleplay exercises were new and exciting, and I really liked the whole course overall.",
  },

  // ── Eating Disorders & Body Image Therapy ────────────────────────────
  {
    key: "edbit-gs-1",
    code: "CCEDBIT",
    match: "eating disorder",
    author: "G.S.",
    rating: 5,
    submittedAt: on("2026-06-09"),
    content:
      "The faculty is one of the best teachers I have come across. Her classes are always interactive, with lots of questions and different, newer ways of teaching and learning. I got to learn a lot, and the assignments helped a lot too.",
  },
  {
    key: "edbit-pc-1",
    code: "CCEDBIT",
    match: "eating disorder",
    author: "P.C.",
    rating: 5,
    submittedAt: on("2026-06-09"),
    content:
      "The faculty has been a great facilitator for the course. She conducted all the sessions in a unique manner which made them very interesting and engaging. A very innovative course: I learned many things about the various aspects related to eating disorders and body image issues. The course is going to help me in my professional practice.",
  },

  // ── OCD ──────────────────────────────────────────────────────────────
  {
    key: "ocd-ga-1",
    code: "CCOCDAT",
    match: "ocd",
    author: "G.A.",
    rating: 4,
    submittedAt: on("2026-06-15"),
    content:
      "Her explanation was simple and easily understandable. She patiently heard us and gave satisfying answers, and gave a recap if we missed anything. The course was good and satisfying at this price, though I want to learn more about intervention and treatment.",
  },
  {
    key: "ocd-gg-1",
    code: "CCOCDAT",
    match: "ocd",
    author: "G.G.",
    rating: 5,
    submittedAt: on("2026-06-17"),
    content:
      "The faculty is amazing in her teaching skills. She brings an active, lively and happy-to-learn kind of vibe to the class. The course was very well structured.",
  },

  // ── Inner Child Healing & Therapy ────────────────────────────────────
  {
    key: "ich-na-1",
    legacyUserId: "sheet-import:39",
    code: "CCICH",
    match: "inner child",
    author: "N.A.",
    rating: 4.5,
    submittedAt: on("2026-07-28"),
    content:
      "It was all good and I was happy to be part of this course. It was smooth and I learned a lot from it.",
  },
  {
    key: "ich-aj-1",
    legacyUserId: "sheet-import:40",
    code: "CCICH",
    match: "inner child",
    author: "A.J.",
    rating: 4.5,
    submittedAt: on("2026-07-28"),
    content:
      "The faculty is a good trainer, handles herself gracefully and knows her subject well. She treated all of us with due respect. The course is well designed and covers a good syllabus.",
  },
  {
    key: "ich-gg-1",
    code: "CCICH",
    match: "inner child",
    author: "G.G.",
    rating: 5,
    submittedAt: on("2026-07-28"),
    content:
      "Inner child healing is a very insightful course, especially for those who have learned about attachment styles and childhood experiences. The integration of modalities, and how the inner child helps in relationship issues, was a great blend. The faculty made the course so interesting; without that it would not have been the same experience.",
  },
  {
    key: "ich-sk-1",
    legacyUserId: "sheet-import:42",
    code: "CCICH",
    match: "inner child",
    author: "S.K.",
    rating: 5,
    submittedAt: on("2026-07-29"),
    content:
      "Very knowledgeable, hands-on and compassionate faculty. The course is inclusive, holistic and hands-on.",
  },
  {
    key: "ich-sk-2",
    legacyUserId: "sheet-import:46",
    code: "CCICH",
    match: "inner child",
    author: "S.K.",
    rating: 4,
    submittedAt: on("2026-08-03"),
    content:
      "A beautiful experience. It was nice understanding the concepts of inner child healing. I would have enjoyed some more theoretical concepts as well, but overall a nice, fun learning experience.",
  },
  {
    key: "ich-bc-1",
    legacyUserId: "sheet-import:47",
    code: "CCICH",
    match: "inner child",
    author: "B.C.",
    rating: 5,
    submittedAt: on("2026-08-03"),
    content:
      "The faculty is very approachable when it comes to helping us understand the course. They taught us with a lot of passion and interest, and there was always a comfort level in communicating with them. As therapists we all need to heal our inner self before healing others, so this is a very important course.",
  },
  {
    key: "ich-a-1",
    legacyUserId: "sheet-import:48",
    code: "CCICH",
    match: "inner child",
    author: "A.",
    rating: 5,
    submittedAt: on("2026-08-03"),
    content:
      "The faculty was highly knowledgeable and humble. She explained concepts with clarity and was always supportive in clearing doubts. Her guidance and practical approach made the learning experience very effective and motivating. The course was clear, practical and engaging, and I gained a lot of valuable insights.",
  },
  {
    key: "ich-qs-1",
    legacyUserId: "sheet-import:49",
    code: "CCICH",
    match: "inner child",
    author: "Q.S.",
    rating: 5,
    submittedAt: on("2026-08-10"),
    content:
      "The faculty is the sweetest and politest. She was very clear while teaching and focused on the practical side, which made the classes fun and the concepts easy to understand. The course was a blend of theoretical and practical learning and helped me realise a lot about myself. Loved it.",
  },

  // ── Acceptance & Forgiveness / Commitment Therapy ────────────────────
  {
    key: "aft-gs-1",
    code: "CCAFT",
    match: "acceptance",
    author: "G.S.",
    rating: 5,
    submittedAt: on("2026-08-02"),
    content:
      "The faculty is one of the best teachers I have met. She asks a lot of questions and makes the class very interactive and interesting. An absolute pleasure to be in her classes. The course was very nicely designed: I loved the assignments and the final project, which truly prepared us for the real world.",
  },
  {
    key: "aft-gg-1",
    code: "CCAFT",
    match: "acceptance",
    author: "G.G.",
    rating: 5,
    submittedAt: on("2026-08-03"),
    content:
      "The faculty's explanation of the subject is very innovative; she somehow finds a way to make the learning interesting and not a boring lecture. The course helps to understand the importance of forgiveness, which is actually very important in life.",
  },
  {
    key: "aft-ds-1",
    code: "CCAFT",
    match: "acceptance",
    author: "D.S.",
    rating: 5,
    submittedAt: on("2026-08-03"),
    content:
      "The faculty is full of patience. I really like her way of teaching, with so many examples and exercises, and she had us practise on ourselves to get more clarity and feel how the therapy works, so we learned a lot. This course is very helpful: acceptance and forgiveness play a key role in our mental health but many of us ignore them. I learned the real meaning of acceptance and forgiveness, and many techniques for when I feel stuck.",
  },

  // ── Art & Colour Therapy ─────────────────────────────────────────────
  {
    key: "art-sk-1",
    code: "DPARCOTH",
    match: "art",
    author: "S.K.",
    rating: 4,
    submittedAt: on("2026-09-10"),
    content:
      "The faculty was very professional and very good at delivering lectures and presentations; she felt like the appropriate person for the course. The course was very informative, though I would suggest a more structured curriculum involving more theoretical knowledge along with the activities.",
  },
  {
    key: "art-gm-1",
    code: "DPARCOTH",
    match: "art",
    author: "G.M.",
    rating: 5,
    submittedAt: on("2026-09-10"),
    content:
      "It was a great experience to join this class with the best faculty. She created a very comfortable atmosphere for us to openly share our views, and discussions were encouraged. The topics were supported by suitable examples and case studies. The modules are designed in a very clear way and are easy to understand, with hands-on case studies provided. I also loved the assignments, as they were very engaging and creative.",
  },

  // ── CBT, REBT & CBMT ─────────────────────────────────────────────────
  {
    key: "cbmt-ks-1",
    legacyUserId: "sheet-import:51",
    code: "CCCBT",
    match: "cbmt",
    author: "K.S.",
    rating: 4,
    submittedAt: on("2026-09-10"),
    content:
      "The faculty shared her practical experience with clients, which was very useful. How to deal with clients was taught well with clinical, real-life experience. Overall a good course, though a little more elaboration of the techniques would have been better.",
  },
  {
    key: "cbmt-ac-1",
    legacyUserId: "sheet-import:53",
    code: "CCCBT",
    match: "cbmt",
    author: "A.C.",
    rating: 5,
    submittedAt: on("2026-09-11"),
    content:
      "It was a good experience overall and I am now confident to apply these therapies with my clients. As I am already a counsellor, I felt I lacked skills; now I can apply these therapeutic approaches and feel more confident.",
  },
  {
    key: "cbmt-bb-1",
    legacyUserId: "sheet-import:54",
    code: "CCCBT",
    match: "cbmt",
    author: "B.B.",
    rating: 5,
    submittedAt: on("2026-09-13"),
    content:
      "The faculty was really kind and explained each point very nicely. She conducted activities which were very helpful to understand the concepts more. The course was insightful and I learned many new concepts and techniques.",
  },
];

// Course-specific reviews from The Mind Point's Google Business profile.
// Dates are approximate, matching the relative time Google displays.
const GOOGLE_REVIEWS: ReviewSeed[] = [
  // ── Dream Analysis ───────────────────────────────────────────────────
  {
    key: "g-dream-am-1",
    code: "PRDRMA",
    match: "dream",
    author: "A.M.",
    rating: 5,
    submittedAt: monthsAgo(6),
    content:
      "I recently finished my journey in the Dream Analysis course. The trainer very patiently addressed our queries and made sure the concepts were understood deeply.",
  },
  {
    key: "g-dream-ac-1",
    code: "PRDRMA",
    match: "dream",
    author: "A.C.",
    rating: 5,
    submittedAt: monthsAgo(12),
    content:
      "It was a very insightful experience. The dream analysis course was very engaging and knowledgeable, and very helpful for application in real life. The classes combined both theory and practical work.",
  },

  // ── Art & Colour Therapy ─────────────────────────────────────────────
  {
    key: "g-art-ss-1",
    code: "DPARCOTH",
    match: "art",
    author: "S.S.",
    rating: 5,
    submittedAt: monthsAgo(10),
    content:
      "It was a wonderful journey. The Art Therapy course was truly beautiful, amazing and very interesting. I felt so good while doing it. The teaching style and the engaging activities made the whole experience lovely.",
  },
  {
    key: "g-art-kj-1",
    code: "DPARCOTH",
    match: "art",
    author: "K.J.",
    rating: 5,
    submittedAt: monthsAgo(9),
    content:
      "It was such a great experience. I enrolled in the Art Therapy diploma program for six months. The teaching covered theoretical and practical knowledge with various activities.",
  },
  {
    key: "g-art-ap-1",
    code: "DPARCOTH",
    match: "art",
    author: "A.P.",
    rating: 5,
    submittedAt: monthsAgo(36),
    content:
      "It was a lovely experience as a beginner to art therapy. I would describe it as delightful and wonderful.",
  },

  // ── CBT, REBT & CBMT ─────────────────────────────────────────────────
  {
    key: "g-cbt-pt-1",
    code: "CCCBT",
    match: "cbmt",
    author: "P.T.",
    rating: 5,
    submittedAt: monthsAgo(11),
    content:
      "The CBT course was truly wonderful. The trainer has such a pleasant and engaging personality that keeps everyone attentive and involved throughout the sessions. The way each concept was explained made it easy to understand.",
  },
  {
    key: "g-cbt-dm-1",
    code: "CCCBT",
    match: "cbmt",
    author: "D.M.",
    rating: 5,
    submittedAt: monthsAgo(12),
    content:
      "The cognitive therapies course was amazing for anyone to learn the basics. The demo session was curated so that one could learn about a therapy session from both the client's and the therapist's perspectives.",
  },
  {
    key: "g-cbt-ak-1",
    code: "CCCBT",
    match: "cbmt",
    author: "A.K.",
    rating: 5,
    submittedAt: monthsAgo(12),
    content: "I did the CBT course and it was a wonderful journey.",
  },
  {
    key: "g-cbt-vs-1",
    code: "CCCBT",
    match: "cbmt",
    author: "V.S.",
    rating: 5,
    submittedAt: monthsAgo(12),
    content:
      "I took the CBT, REBT certificate course. The classes were good and interactive; I enjoyed them and learned a lot.",
  },

  // ── Inner Child Healing & Therapy ────────────────────────────────────
  {
    key: "g-ich-ss-1",
    code: "CCICH",
    match: "inner child",
    author: "S.S.",
    rating: 5,
    submittedAt: monthsAgo(11),
    content:
      "Amazing experience. I am really happy that I chose The Mind Point for the Inner Child Healing Certification course. The course is so well designed that you can immediately begin working after it.",
  },
  {
    key: "g-ich-pa-1",
    code: "CCICH",
    match: "inner child",
    author: "P.A.",
    rating: 5,
    submittedAt: monthsAgo(11),
    content:
      "I attended the Inner Child Healing workshop and absolutely loved the experience. The sessions online were so interesting and interactive.",
  },
  {
    key: "g-ich-rb-1",
    code: "CCICH",
    match: "inner child",
    author: "R.B.",
    rating: 5,
    submittedAt: monthsAgo(12),
    content:
      "This course feels like a beautiful gift to oneself: reconnecting with the little 'me' inside, releasing old wounds and embracing healing with compassion. Inner child work truly brings clarity, lightness and a deeper sense of self-love.",
  },
  {
    key: "g-ich-rc-1",
    code: "CCICH",
    match: "inner child",
    author: "R.C.",
    rating: 5,
    submittedAt: monthsAgo(12),
    content:
      "I just finished the Inner Child Healing course and it was such a beautiful and eye-opening experience. The trainer created a very safe space where we felt comfortable opening up and sharing our feelings without judgement.",
  },

  // ── Counselling Psychology ───────────────────────────────────────────
  {
    key: "g-clp-ry-1",
    code: "INCLP",
    match: "counselling psychology",
    author: "R.Y.",
    rating: 5,
    submittedAt: monthsAgo(12),
    content:
      "The online course for Counselling Psychology was really good and informative. The lessons were well-structured and easy to understand, making it perfect for beginners too. The mentor made the experience even better.",
  },
  {
    key: "g-clp-nc-1",
    code: "INCLP",
    match: "counselling psychology",
    author: "N.C.",
    rating: 5,
    submittedAt: monthsAgo(10),
    content:
      "It is a very helpful course for my journey of learning new skills in the field of counselling. The way of teaching is easy and simple and caters to the needs of everyone from any part of the country. The educators are very cooperative.",
  },
  {
    key: "g-clp-ss-1",
    code: "INCLP",
    match: "counselling psychology",
    author: "S.S.",
    rating: 5,
    submittedAt: monthsAgo(36),
    content:
      "It was an informative course. Everything you need to know is covered extensively and it helped me personally to gain more knowledge related to counselling. There was continuous encouragement from the trainer to finish our assignments on time.",
  },

  // ── Counselling Internship ───────────────────────────────────────────
  {
    key: "g-intern-rk-1",
    code: "INCLP",
    match: "counselling psychology",
    author: "R.K.",
    rating: 5,
    submittedAt: monthsAgo(24),
    content:
      "It was a great experience. I learned a lot from my internship and it was very useful. The teacher was also very patient and answered all our questions.",
  },

  // ── Relationship Counselling ─────────────────────────────────────────
  {
    key: "g-rel-pg-1",
    code: "CCRC",
    match: "relationship",
    author: "P.G.",
    rating: 5,
    submittedAt: monthsAgo(12),
    content:
      "It was such a pleasure to do this course. I gained a lot of insights about relationship counselling, family therapy techniques and more systematic approaches to helping people with their relationship issues. The course content was thoroughly enjoyable and the classes were interactive.",
  },
  {
    key: "g-rel-ms-1",
    code: "CCRC",
    match: "relationship",
    author: "M.S.",
    rating: 5,
    submittedAt: monthsAgo(36),
    content:
      "I took part in the extensive relationship psychology workshop and had a nice experience. I learned a lot, and we did interesting activities at the end of each session too.",
  },

  // ── Clinical Psychology ──────────────────────────────────────────────
  {
    key: "g-clin-rn-1",
    code: "PRCVCP",
    match: "clinical",
    author: "R.N.",
    rating: 5,
    submittedAt: monthsAgo(36),
    content:
      "It was a wonderful experience. I learned a lot about clinical psychology and how one might go about being a clinical psychologist. It was a very interactive and joyful experience.",
  },
];

const REVIEWS: ReviewSeed[] = [...FEEDBACK_REVIEWS, ...GOOGLE_REVIEWS];

function pickCourse(
  courses: Doc<"courses">[],
  seed: ReviewSeed,
): Doc<"courses"> | undefined {
  // Only courses that are actually on the website can carry a review. Archived
  // rows are removed from the storefront and their pages 404, so a review
  // attached to one would never be seen.
  const live = courses.filter(
    (course) => course.lifecycleStatus !== "archived",
  );
  const byCode = live.filter(
    (course) => course.code?.toLowerCase() === seed.code.toLowerCase(),
  );
  const byName = live.filter((course) =>
    course.name.toLowerCase().includes(seed.match.toLowerCase()),
  );
  return byCode[0] ?? byName[0];
}

export const importCourseReviews = internalMutation({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").take(2000);
    const imported: { key: string; course: string; courseId: Id<"courses"> }[] =
      [];
    const skipped: { key: string; reason: string }[] = [];

    for (const seed of REVIEWS) {
      const course = pickCourse(courses, seed);
      if (!course) {
        skipped.push({
          key: seed.key,
          reason: `No course matched code ${seed.code} or name ~"${seed.match}"`,
        });
        continue;
      }

      const userId = `import:${seed.key}`;
      if (seed.legacyUserId) {
        const legacy = await ctx.db
          .query("reviews")
          .withIndex("by_course_and_user", (q) =>
            q.eq("course", course._id).eq("userId", seed.legacyUserId!),
          )
          .first();
        if (legacy) {
          skipped.push({ key: seed.key, reason: "Already imported (legacy)" });
          continue;
        }
      }

      const existing = await ctx.db
        .query("reviews")
        .withIndex("by_course_and_user", (q) =>
          q.eq("course", course._id).eq("userId", userId),
        )
        .first();
      if (existing) {
        skipped.push({ key: seed.key, reason: "Already imported" });
        continue;
      }

      const reviewId = await ctx.db.insert("reviews", {
        course: course._id,
        userId,
        userName: seed.author,
        rating: seed.rating,
        content: seed.content.trim(),
        isEdited: false,
        submittedAt: seed.submittedAt,
      });

      await ctx.db.patch(course._id, {
        reviews: [...(course.reviews ?? []), reviewId],
      });

      imported.push({
        key: seed.key,
        course: course.name,
        courseId: course._id,
      });
    }

    return {
      actor: ACTOR,
      total: REVIEWS.length,
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped,
    };
  },
});

// Existing student submissions that named a faculty member. Rewritten to drop
// the name, leaving the rest of the review untouched. Matched by a phrase so
// this never hard-codes a document id, and a no-op once the phrase is gone.
//   npx convex run bootstrapCourseReviews:scrubFacultyNames --prod
const FACULTY_NAME_REMOVALS: { from: string; to: string }[] = [
  {
    from: "My teacher, Kiranjot, is extremely talented",
    to: "My teacher is extremely talented",
  },
  {
    from: "It was great learning experience from kiranjot mam.",
    to: "It was a great learning experience.",
  },
  {
    from: "the Mind Point team and Kiranjot mam.",
    to: "the Mind Point team.",
  },
  {
    from: "Art therapy and kiranjot mam teaching are just a magic....that you have to experience for sure!!",
    to: "Art therapy and the teaching are just magic — something you have to experience for sure.",
  },
];

export const scrubFacultyNames = internalMutation({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db.query("reviews").take(2000);
    const updated: string[] = [];

    for (const removal of FACULTY_NAME_REMOVALS) {
      const hit = reviews.find((review) =>
        review.content.includes(removal.from),
      );
      if (!hit) continue;
      await ctx.db.patch(hit._id, {
        content: hit.content.replace(removal.from, removal.to),
      });
      updated.push(hit._id);
    }

    return { updatedCount: updated.length, updated };
  },
});
