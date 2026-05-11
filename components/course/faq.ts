export interface FaqItem {
  q: string;
  /** Short answer (one-liner) always visible when available. */
  shortAnswer: string;
  /** Full markdown answer shown when the reader expands the row. */
  a: string;
}

// Split a parsed answer into a {shortAnswer, full} pair. The CMS convention:
// either (a) the first line is the short answer and following lines are the
// long-form body, separated by a `|||` line; or (b) the entire answer is
// treated as both short and full (no separator) — in which case the row only
// expands if the answer is long enough to warrant it.
function splitShortLong(answer: string): { shortAnswer: string; full: string } {
  const normalized = answer.trim();
  if (!normalized) return { shortAnswer: "", full: "" };

  const separatorMatch = normalized.split(/\n\s*\|\|\|\s*\n?/);
  if (separatorMatch.length >= 2) {
    const shortAnswer = separatorMatch[0].trim();
    const full = separatorMatch.slice(1).join("\n").trim();
    return { shortAnswer, full };
  }

  return { shortAnswer: normalized, full: normalized };
}

export function parseFaqMarkdown(md: string): FaqItem[] {
  const normalized = md.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const tableItems: FaqItem[] = [];

  // Table format.
  for (let i = 0; i < lines.length - 1; i++) {
    const header = lines[i].trim();
    const separator = lines[i + 1]?.trim() ?? "";
    const isHeaderRow =
      header.includes("|") &&
      /question/i.test(header) &&
      /answer/i.test(header);
    const isSeparatorRow = /^\|?\s*-+\s*\|\s*-+/.test(separator);
    if (isHeaderRow && isSeparatorRow) {
      for (let j = i + 2; j < lines.length; j++) {
        const row = lines[j];
        if (!row.trim().startsWith("|")) break;
        const raw = row.trim().replace(/^\|/, "").replace(/\|$/, "");
        const cols = raw.split("|");
        if (cols.length >= 2) {
          const questionCol = cols[0].trim().replace(/\*\*/g, "");
          const answerCol = cols.slice(1).join("|").trim();
          if (questionCol) {
            const { shortAnswer, full } = splitShortLong(answerCol);
            tableItems.push({ q: questionCol, shortAnswer, a: full });
          }
        }
      }
      break;
    }
  }
  if (tableItems.length > 0) return tableItems;

  // Numbered list format.
  const numberedItems: FaqItem[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const numberedMatch = /^(\d+)\.\s+(.+)$/.exec(line);
    if (numberedMatch) {
      const question = numberedMatch[2].trim();
      let answer = "";
      let hasStartedAnswer = false;

      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];

        if (/^\d+\.\s+/.test(nextLine.trim())) {
          break;
        }

        if (nextLine.trim() !== "") {
          hasStartedAnswer = true;
          answer += (answer ? "\n" : "") + nextLine;
        } else if (hasStartedAnswer) {
          let k = j + 1;
          while (k < lines.length && lines[k].trim() === "") {
            k++;
          }
          if (k < lines.length && /^\d+\.\s+/.test(lines[k].trim())) {
            break;
          }
          answer += "\n";
        }
        j++;
      }

      if (question) {
        const { shortAnswer, full } = splitShortLong(answer.trim());
        numberedItems.push({ q: question, shortAnswer, a: full });
      }
    }
  }
  if (numberedItems.length > 0) return numberedItems;

  // Heading-based fallback.
  const items: FaqItem[] = [];
  let currentQuestion: string | null = null;
  let currentAnswerLines: string[] = [];
  for (const line of lines) {
    const headingMatch = /^(#{2,6})\s+(.+)$/.exec(line.trim());
    if (headingMatch) {
      if (
        currentQuestion &&
        !/^(additional information)$/i.test(currentQuestion.trim())
      ) {
        const { shortAnswer, full } = splitShortLong(
          currentAnswerLines.join("\n").trim(),
        );
        items.push({ q: currentQuestion, shortAnswer, a: full });
      }
      currentQuestion = headingMatch[2].trim();
      currentAnswerLines = [];
    } else {
      currentAnswerLines.push(line);
    }
  }
  if (
    currentQuestion &&
    !/^(additional information)$/i.test(currentQuestion.trim())
  ) {
    const { shortAnswer, full } = splitShortLong(
      currentAnswerLines.join("\n").trim(),
    );
    items.push({ q: currentQuestion, shortAnswer, a: full });
  }
  return items;
}
