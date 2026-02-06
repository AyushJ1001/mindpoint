#!/usr/bin/env node

/*
 * Exports enrollments from Convex production and writes them to a new Google Sheet tab
 * using the same 12-column format as convex/googleSheets.ts.
 *
 * Usage:
 *   node scripts/backfill-enrollments-to-sheet.js --spreadsheet-id <id>
 *
 * Optional:
 *   --sheet-name <name>           Base tab name (default: Enrollments)
 *   --export-path <zipPath>       Export zip path (default: /tmp/mindpoint-prod-export.zip)
 *   --skip-export                 Reuse existing zip instead of exporting from prod
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const dotenv = require("dotenv");
const { google } = require("googleapis");

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: false, quiet: true });

const HEADERS = [
  "Enrollment Number",
  "Student Name",
  "Email",
  "Phone",
  "Course Name",
  "Course Type",
  "Session Type",
  "Internship Plan",
  "Sessions",
  "Guest User",
  "Enrollment Date",
  "Added to Sheet Date",
];

function parseArgs(argv) {
  const args = {
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "",
    sheetName: "Enrollments",
    exportPath: "/tmp/mindpoint-prod-export.zip",
    skipExport: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--spreadsheet-id") {
      args.spreadsheetId = argv[i + 1] || "";
      i += 1;
    } else if (token === "--sheet-name") {
      args.sheetName = argv[i + 1] || "Enrollments";
      i += 1;
    } else if (token === "--export-path") {
      args.exportPath = argv[i + 1] || args.exportPath;
      i += 1;
    } else if (token === "--skip-export") {
      args.skipExport = true;
    }
  }

  if (!args.spreadsheetId) {
    throw new Error(
      "Missing spreadsheet ID. Pass --spreadsheet-id or set GOOGLE_SHEETS_SPREADSHEET_ID.",
    );
  }

  return args;
}

function convexBin() {
  return path.resolve(process.cwd(), "node_modules/.bin/convex");
}

function exportProdSnapshot(exportPath) {
  const bin = convexBin();
  if (!fs.existsSync(bin)) {
    throw new Error(
      "Convex CLI not found at node_modules/.bin/convex. Run npm install first.",
    );
  }

  if (fs.existsSync(exportPath)) {
    fs.unlinkSync(exportPath);
  }

  console.log(`Exporting Convex prod snapshot to ${exportPath}...`);
  execFileSync(bin, ["export", "--prod", "--path", exportPath], {
    stdio: "inherit",
  });
}

function readJsonlFromZip(zipPath, innerPath) {
  const content = execFileSync("unzip", ["-p", zipPath, innerPath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}

function toIso(value) {
  if (typeof value !== "number") {
    return "";
  }
  return new Date(value).toISOString();
}

function buildRows(enrollments, coursesById) {
  const addedToSheetDate = new Date().toISOString();

  const sorted = [...enrollments].sort((a, b) => {
    const at = typeof a._creationTime === "number" ? a._creationTime : 0;
    const bt = typeof b._creationTime === "number" ? b._creationTime : 0;
    return at - bt;
  });

  return sorted.map((enrollment) => {
    const course = coursesById.get(enrollment.courseId);
    return [
      enrollment.enrollmentNumber || "",
      enrollment.userName || "",
      enrollment.userEmail || "",
      enrollment.userPhone || "",
      enrollment.courseName || course?.name || "",
      enrollment.courseType || course?.type || "",
      enrollment.sessionType || "",
      enrollment.internshipPlan || "",
      enrollment.sessions !== undefined ? String(enrollment.sessions) : "",
      enrollment.isGuestUser ? "Yes" : "No",
      toIso(enrollment._creationTime),
      addedToSheetDate,
    ];
  });
}

function sheetNameWithFallback(baseName, existingTitles) {
  if (!existingTitles.has(baseName)) {
    return baseName;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${baseName} ${stamp}`;
}

function tryParseCredentials(raw) {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readCredentialsFromEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return null;
  }

  const raw = fs.readFileSync(envPath, "utf8");
  const match = raw.match(
    /(?:^|\n)GOOGLE_APPLICATION_CREDENTIALS_JSON=(\{[\s\S]*?\})(?=\n[A-Z0-9_]+=|$)/,
  );

  if (!match) {
    return null;
  }

  const candidate = match[1];
  const parsed = tryParseCredentials(candidate);
  if (parsed) {
    return parsed;
  }

  const privateKeyMatch = candidate.match(
    /"private_key":"([\s\S]*?)","client_email":/,
  );

  if (!privateKeyMatch) {
    return null;
  }

  const escapedPrivateKey = privateKeyMatch[1].replace(/\r?\n/g, "\\n");
  const repaired = candidate.replace(privateKeyMatch[1], escapedPrivateKey);
  return tryParseCredentials(repaired);
}

function loadGoogleCredentials() {
  const fromEnv = tryParseCredentials(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "",
  );
  if (fromEnv) {
    return fromEnv;
  }

  const fromDotEnv = readCredentialsFromEnvFile(path.resolve(process.cwd(), ".env"));
  if (fromDotEnv) {
    return fromDotEnv;
  }

  const fromDotEnvLocal = readCredentialsFromEnvFile(
    path.resolve(process.cwd(), ".env.local"),
  );
  if (fromDotEnvLocal) {
    return fromDotEnvLocal;
  }

  throw new Error(
    "Could not parse GOOGLE_APPLICATION_CREDENTIALS_JSON from environment or .env files.",
  );
}

async function getSheetsClient() {
  const credentials = loadGoogleCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function createAndFillSheet({ spreadsheetId, sheetName, rows }) {
  const sheets = await getSheetsClient();

  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = new Set(
    (metadata.data.sheets || [])
      .map((s) => s.properties && s.properties.title)
      .filter(Boolean),
  );

  const finalSheetName = sheetNameWithFallback(sheetName, existingTitles);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: finalSheetName,
            },
          },
        },
      ],
    },
  });

  const values = [HEADERS, ...rows];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${finalSheetName}!A1:L${values.length}`,
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });

  const refresh = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = (refresh.data.sheets || []).find(
    (s) => s.properties && s.properties.title === finalSheetName,
  );

  const sheetId = sheet && sheet.properties ? sheet.properties.sheetId : undefined;

  if (sheetId !== undefined) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9,
                  },
                },
              },
              fields: "userEnteredFormat(textFormat,backgroundColor)",
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: "gridProperties.frozenRowCount",
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: HEADERS.length,
              },
            },
          },
        ],
      },
    });
  }

  return finalSheetName;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.skipExport) {
    exportProdSnapshot(args.exportPath);
  } else {
    console.log(`Skipping export; using existing zip at ${args.exportPath}`);
  }

  if (!fs.existsSync(args.exportPath)) {
    throw new Error(`Export zip not found at ${args.exportPath}`);
  }

  const enrollments = readJsonlFromZip(args.exportPath, "enrollments/documents.jsonl");
  const courses = readJsonlFromZip(args.exportPath, "courses/documents.jsonl");
  const coursesById = new Map(courses.map((course) => [course._id, course]));

  const rows = buildRows(enrollments, coursesById);

  if (rows.length === 0) {
    throw new Error("No enrollments found in export.");
  }

  const finalSheetName = await createAndFillSheet({
    spreadsheetId: args.spreadsheetId,
    sheetName: args.sheetName,
    rows,
  });

  console.log("Done.");
  console.log(`Spreadsheet ID: ${args.spreadsheetId}`);
  console.log(`Created sheet: ${finalSheetName}`);
  console.log(`Rows written (excluding header): ${rows.length}`);
}

main().catch((error) => {
  console.error("Failed:", error.message);
  process.exit(1);
});
