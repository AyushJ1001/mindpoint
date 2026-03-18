export function getUserFacingErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const uncaughtMatch = error.message.match(
    /Uncaught (?:Convex)?Error:\s*([^\n]+)/,
  );
  if (uncaughtMatch?.[1]) {
    return uncaughtMatch[1].trim();
  }

  const validationMatch = error.message.match(
    /ArgumentValidationError:\s*([\s\S]+?)(?=\n\n|\[CONVEX|\[Request ID:|$)/,
  );
  if (validationMatch?.[1]) {
    return validationMatch[1].trim();
  }

  const cleaned = error.message
    .replace(/\[CONVEX [^\]]+\]\s*/g, "")
    .replace(/\[Request ID:[^\]]+\]\s*/g, "")
    .replace(/Server Error\s*/gi, "")
    .replace(/Called by client\s*/gi, "")
    .replace(/^Error:\s*/i, "")
    .trim();

  return cleaned || fallback;
}
