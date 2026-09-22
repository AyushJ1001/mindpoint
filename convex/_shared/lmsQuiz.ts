export function scoreLmsQuiz(
  questionCount: number,
  correctAnswerCount: number,
  passingScore: number,
) {
  if (!Number.isInteger(questionCount) || questionCount <= 0) {
    throw new Error("A Quiz needs at least one question");
  }
  if (
    !Number.isInteger(correctAnswerCount) ||
    correctAnswerCount < 0 ||
    correctAnswerCount > questionCount
  ) {
    throw new Error("Correct answer count is outside the Quiz range");
  }
  if (passingScore < 0 || passingScore > 100) {
    throw new Error("Passing score must be between 0 and 100");
  }

  const score = Math.round((correctAnswerCount / questionCount) * 100);
  return { score, passed: score >= passingScore };
}
