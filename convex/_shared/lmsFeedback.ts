export const LMS_ANONYMOUS_MINIMUM_GROUP_SIZE = 3;
export const LMS_ANONYMOUS_MAXIMUM_GROUP_SIZE = 50;
export const LMS_FEEDBACK_COMMENT_LIMIT = 1_500;

export function anonymousFeedbackDelayMs(seed: string) {
  const hash = Array.from(seed).reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  return 60_000 + (hash % 240_001);
}

export function validateLmsFeedbackInput(rating: number, comment: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Choose a rating from 1 to 5");
  }
  const normalizedComment = comment.trim();
  if (normalizedComment.length > LMS_FEEDBACK_COMMENT_LIMIT) {
    throw new Error(
      `Feedback comments must be ${LMS_FEEDBACK_COMMENT_LIMIT.toLocaleString("en-US")} characters or fewer`,
    );
  }
  return { rating, comment: normalizedComment || undefined };
}

export function validateAnonymousMinimumGroupSize(value: number) {
  if (
    !Number.isInteger(value) ||
    value < LMS_ANONYMOUS_MINIMUM_GROUP_SIZE ||
    value > LMS_ANONYMOUS_MAXIMUM_GROUP_SIZE
  ) {
    throw new Error(
      `Anonymous Feedback needs a reporting group between ${LMS_ANONYMOUS_MINIMUM_GROUP_SIZE} and ${LMS_ANONYMOUS_MAXIMUM_GROUP_SIZE}`,
    );
  }
  return value;
}

export function summarizeLmsFeedback(ratings: number[]) {
  if (ratings.length === 0) return { responseCount: 0, averageRating: null };
  const averageRating =
    Math.round(
      (ratings.reduce((total, rating) => total + rating, 0) / ratings.length) *
        10,
    ) / 10;
  return { responseCount: ratings.length, averageRating };
}
