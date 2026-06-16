"use node";

import {
  convexResultErrorCode,
  convexSuccess,
  type ConvexSuccess,
} from "./result";
import {
  googleSheetsFailure,
  type GoogleSheetsClient,
  type GoogleSheetsFailure,
} from "./googleSheetsClient";

export type EnrollmentSheetData = {
  courseId: string;
  courseName?: string;
  courseType?: string;
  enrollmentDate: string;
  enrollmentNumber: string;
  internshipPlan?: string;
  isGuestUser?: boolean;
  sessionType?: string;
  sessions?: number;
  userEmail?: string;
  userId: string;
  userName?: string;
  userPhone?: string;
};

export type GoogleSheetsActionResult = ConvexSuccess<{}> | GoogleSheetsFailure;

const ENROLLMENT_HEADERS = [
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
] as const;

function validateSheetTarget(args: {
  sheetName: string;
  spreadsheetId: string;
}): GoogleSheetsFailure | null {
  if (!args.spreadsheetId.trim()) {
    return googleSheetsFailure(
      convexResultErrorCode.VALIDATION_ERROR,
      "Google Sheets spreadsheet ID is required.",
    );
  }

  if (!args.sheetName.trim()) {
    return googleSheetsFailure(
      convexResultErrorCode.VALIDATION_ERROR,
      "Google Sheets sheet name is required.",
    );
  }

  return null;
}

function quoteSheetName(sheetName: string): string {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

export function enrollmentSheetRange(sheetName: string, range: string): string {
  return `${quoteSheetName(sheetName)}!${range}`;
}

export function buildEnrollmentSheetRow(
  enrollmentData: EnrollmentSheetData,
): string[] {
  return [
    enrollmentData.enrollmentNumber,
    enrollmentData.userName || "",
    enrollmentData.userEmail || "",
    enrollmentData.userPhone || "",
    enrollmentData.courseName || "",
    enrollmentData.courseType || "",
    enrollmentData.sessionType || "",
    enrollmentData.internshipPlan || "",
    enrollmentData.sessions?.toString() || "",
    enrollmentData.isGuestUser ? "Yes" : "No",
    enrollmentData.enrollmentDate,
    new Date().toISOString(),
  ];
}

function externalFailure(
  message: string,
  details?: GoogleSheetsFailure["error"]["details"],
): GoogleSheetsFailure {
  return googleSheetsFailure(
    convexResultErrorCode.EXTERNAL_SERVICE_ERROR,
    message,
    details,
  );
}

function errorStatus(error: object | string): number | null {
  if (typeof error === "string") {
    return null;
  }

  const candidate = error as {
    code?: number | string;
    response?: { status?: number };
    status?: number;
  };
  const status = candidate.response?.status ?? candidate.status;
  if (typeof status === "number") {
    return status;
  }
  if (typeof candidate.code === "number") {
    return candidate.code;
  }
  if (typeof candidate.code === "string") {
    const parsed = Number.parseInt(candidate.code, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function errorMessage(error: object | string): string {
  return error instanceof Error ? error.message : String(error);
}

export async function appendEnrollmentToSheet(args: {
  enrollmentData: EnrollmentSheetData;
  sheetName: string;
  sheets: GoogleSheetsClient;
  spreadsheetId: string;
}): Promise<GoogleSheetsActionResult> {
  const targetFailure = validateSheetTarget(args);
  if (targetFailure) {
    return targetFailure;
  }

  try {
    await args.sheets.spreadsheets.values.append({
      spreadsheetId: args.spreadsheetId,
      range: enrollmentSheetRange(args.sheetName, "A:L"),
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [buildEnrollmentSheetRow(args.enrollmentData)],
      },
    });

    return convexSuccess({});
  } catch (error) {
    return externalFailure("Failed to append enrollment to Google Sheets.", {
      error: errorMessage(error as object | string),
      enrollmentNumber: args.enrollmentData.enrollmentNumber,
      sheetName: args.sheetName,
      spreadsheetId: args.spreadsheetId,
    });
  }
}

async function sheetExists(args: {
  sheetName: string;
  sheets: GoogleSheetsClient;
  spreadsheetId: string;
}): Promise<boolean | GoogleSheetsFailure> {
  try {
    await args.sheets.spreadsheets.values.get({
      spreadsheetId: args.spreadsheetId,
      range: enrollmentSheetRange(args.sheetName, "A1"),
    });
    return true;
  } catch (error) {
    const status = errorStatus(error as object | string);
    if (status === 404) {
      return false;
    }

    return externalFailure("Failed to inspect Google Sheet.", {
      error: errorMessage(error as object | string),
      sheetName: args.sheetName,
      spreadsheetId: args.spreadsheetId,
      status: status ?? undefined,
    });
  }
}

async function getSheetId(args: {
  sheetName: string;
  sheets: GoogleSheetsClient;
  spreadsheetId: string;
}): Promise<GoogleSheetsFailure | number> {
  try {
    const response = await args.sheets.spreadsheets.get({
      spreadsheetId: args.spreadsheetId,
    });

    const sheet = response.data.sheets?.find(
      (row) => row.properties?.title === args.sheetName,
    );
    const sheetId = sheet?.properties?.sheetId;

    if (sheetId === undefined || sheetId === null) {
      return googleSheetsFailure(
        convexResultErrorCode.NOT_FOUND,
        `Sheet "${args.sheetName}" not found.`,
        {
          sheetName: args.sheetName,
          spreadsheetId: args.spreadsheetId,
        },
      );
    }

    return sheetId;
  } catch (error) {
    return externalFailure("Failed to load Google Sheets metadata.", {
      error: errorMessage(error as object | string),
      sheetName: args.sheetName,
      spreadsheetId: args.spreadsheetId,
    });
  }
}

export async function setupEnrollmentSheetDocument(args: {
  sheetName: string;
  sheets: GoogleSheetsClient;
  spreadsheetId: string;
}): Promise<GoogleSheetsActionResult> {
  const targetFailure = validateSheetTarget(args);
  if (targetFailure) {
    return targetFailure;
  }

  try {
    const exists = await sheetExists(args);
    if (typeof exists !== "boolean") {
      return exists;
    }

    if (!exists) {
      await args.sheets.spreadsheets.batchUpdate({
        spreadsheetId: args.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: args.sheetName,
                },
              },
            },
          ],
        },
      });
    }

    await args.sheets.spreadsheets.values.clear({
      spreadsheetId: args.spreadsheetId,
      range: enrollmentSheetRange(args.sheetName, "A:L"),
    });

    await args.sheets.spreadsheets.values.update({
      spreadsheetId: args.spreadsheetId,
      range: enrollmentSheetRange(args.sheetName, "A1:L1"),
      valueInputOption: "RAW",
      requestBody: {
        values: [[...ENROLLMENT_HEADERS]],
      },
    });

    const sheetId = await getSheetId(args);
    if (typeof sheetId !== "number") {
      return sheetId;
    }

    await args.sheets.spreadsheets.batchUpdate({
      spreadsheetId: args.spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: ENROLLMENT_HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true,
                  },
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
        ],
      },
    });

    return convexSuccess({});
  } catch (error) {
    return externalFailure("Failed to set up Google Sheets enrollment sheet.", {
      error: errorMessage(error as object | string),
      sheetName: args.sheetName,
      spreadsheetId: args.spreadsheetId,
    });
  }
}
