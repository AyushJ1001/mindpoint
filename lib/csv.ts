export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      for (const key of Object.keys(row)) {
        set.add(key);
      }
      return set;
    }, new Set<string>()),
  );

  const escapeCsvCell = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const normalized =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    const safe = /^[=+\-@\t]/.test(normalized) ? `'${normalized}` : normalized;
    const escaped = safe.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const lines = [headers.join(",")];

  for (const row of rows) {
    const line = headers.map((header) => escapeCsvCell(row[header])).join(",");
    lines.push(line);
  }

  return lines.join("\n");
}

export function downloadCsv(fileName: string, csv: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
