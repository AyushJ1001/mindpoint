export function validateLmsQuestion(body: string) {
  const normalized = body.trim();
  if (!normalized) throw new Error("Question text is required");
  if (normalized.length > 2_000) {
    throw new Error("Questions must be 2,000 characters or fewer");
  }
  return normalized;
}

export function canViewLmsQuestion(args: {
  authorTokenIdentifier: string;
  viewerTokenIdentifier: string;
  visibility: "private" | "course" | "batch";
  questionBatchId?: string;
  viewerBatchId?: string;
}) {
  if (args.authorTokenIdentifier === args.viewerTokenIdentifier) return true;
  if (args.visibility === "course") return true;
  return (
    args.visibility === "batch" &&
    Boolean(args.viewerBatchId) &&
    args.questionBatchId === args.viewerBatchId
  );
}
