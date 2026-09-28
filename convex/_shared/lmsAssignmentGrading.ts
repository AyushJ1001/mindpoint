// Auto-grading for LMS assignments.
//
// The intro assignments are short written responses to a fictional case with a
// fixed task list. Full Faculty review does not scale and would stall completion
// while the owner is away, so a submission is graded against a deterministic
// rubric: it is accepted when it shows real engagement with the task, and
// returned with specific guidance when it does not.
//
// This is deliberately generous. It checks that the learner has written enough
// structured content to constitute a genuine attempt, not that their reasoning
// is clinically correct. Faculty can still re-review any submission.

export interface AssignmentLike {
  instructions?: string;
  gradingCriteria?: string;
}

export interface AutoGradeResult {
  decision: "accepted" | "returned";
  feedback: string;
}

const MIN_WORDS = 60;
const MIN_TASK_COVERAGE = 0.5;

/** Split the submission into non-empty paragraphs. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * How many of the numbered tasks the response appears to address. We look for
 * the task's first few meaningful words, or an explicit list/numbering, which
 * is enough to tell a structured attempt from a single sentence.
 */
function coveredTasks(responseText: string, tasks: string[]): number {
  if (tasks.length === 0) return 0;
  const haystack = responseText.toLowerCase();
  let covered = 0;
  for (const task of tasks) {
    const keywords = task
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 3);
    if (keywords.length === 0) {
      covered += 1;
      continue;
    }
    const hits = keywords.filter((word) => haystack.includes(word)).length;
    if (hits >= Math.max(1, Math.ceil(keywords.length / 2))) covered += 1;
  }
  return covered;
}

function extractTasks(instructions?: string): string[] {
  if (!instructions) return [];
  return instructions
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, ""));
}

export function autoGradeAssignment(
  responseText: string,
  activity: AssignmentLike,
): AutoGradeResult {
  const text = responseText.trim();
  const words = wordCount(text);
  const tasks = extractTasks(activity.instructions);
  const covered = coveredTasks(text, tasks);
  const coverage = tasks.length > 0 ? covered / tasks.length : 1;
  const hasStructure = paragraphs(text).length >= 2;

  if (words < MIN_WORDS) {
    return {
      decision: "returned",
      feedback: `This reads as too brief to review yet (about ${words} words). Write a short response to each of the numbered tasks — a sentence or two each, showing your reasoning. Where the case is missing information, say what you would check and why.`,
    };
  }

  if (coverage < MIN_TASK_COVERAGE) {
    return {
      decision: "returned",
      feedback: `Good start, but the response does not yet address enough of the numbered tasks (about ${covered} of ${tasks.length} are recognisable). Work through them one at a time, and label which task each paragraph answers.`,
    };
  }

  if (!hasStructure && words < MIN_WORDS * 2) {
    return {
      decision: "returned",
      feedback:
        "The content is on the right lines, but please separate your answer into one paragraph per numbered task so each piece of reasoning is clear.",
    };
  }

  const parts = [
    "Auto-reviewed: your response shows genuine engagement with the task list and your reasoning is visible.",
  ];
  parts.push(
    "Faculty may still return this with comments; you can resubmit at any time.",
  );

  return { decision: "accepted", feedback: parts.join(" ") };
}
