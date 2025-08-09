export function parseFaqMarkdown(md: string): Array<{ q: string; a: string }> {
  const normalized = md.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const tableItems: Array<{ q: string; a: string }> = [];

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
          if (questionCol) tableItems.push({ q: questionCol, a: answerCol });
        }
      }
      break;
    }
  }
  if (tableItems.length > 0) return tableItems;

  const items: Array<{ q: string; a: string }> = [];
  let currentQuestion: string | null = null;
  let currentAnswerLines: string[] = [];
  for (const line of lines) {
    const headingMatch = /^(#{2,6})\s+(.+)$/.exec(line.trim());
    if (headingMatch) {
      if (
        currentQuestion &&
        !/^(additional information)$/i.test(currentQuestion.trim())
      ) {
        items.push({
          q: currentQuestion,
          a: currentAnswerLines.join("\n").trim(),
        });
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
    items.push({ q: currentQuestion, a: currentAnswerLines.join("\n").trim() });
  }
  return items;
}
