"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { google } from "googleapis";

// Google Sheets API configuration
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// Function to get Google Sheets client
function getGoogleSheetsClient() {
  let auth;

  // Check if we have JSON credentials as environment variable (PRODUCTION)
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (credentialsJson) {
    // Use JSON string from environment variable (PRODUCTION)
    try {
      const credentials = JSON.parse(credentialsJson);
      auth = new google.auth.GoogleAuth({
        scopes: SCOPES,
        credentials: credentials,
      });
    } catch (error) {
      console.error("Error parsing Google credentials JSON:", error);
      throw new Error("Invalid Google credentials JSON format");
    }
  } else {
    // For local development, we need to read the file and parse it
    // This is a workaround for Convex's serverless environment
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is required. Please set it in your Convex dashboard or add the JSON content to your .env file.",
    );
  }

  return google.sheets({ version: "v4", auth });
}

// Action to add enrollment data to Google Sheets
export const addEnrollmentToSheet = action({
  args: {
    enrollmentData: v.object({
      userId: v.string(),
      userName: v.optional(v.string()),
      userEmail: v.optional(v.string()),
      userPhone: v.optional(v.string()),
      courseId: v.string(),
      courseName: v.optional(v.string()),
      enrollmentNumber: v.string(),
      isGuestUser: v.optional(v.boolean()),
      sessionType: v.optional(v.string()),
      courseType: v.optional(v.string()),
      internshipPlan: v.optional(v.string()),
      sessions: v.optional(v.number()),
      enrollmentDate: v.string(), // ISO string
    }),
    spreadsheetId: v.string(),
    sheetName: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const sheets = getGoogleSheetsClient();

      // Prepare the row data
      const rowData = [
        args.enrollmentData.enrollmentNumber,
        args.enrollmentData.userName || "",
        args.enrollmentData.userEmail || "",
        args.enrollmentData.userPhone || "",
        args.enrollmentData.courseName || "",
        args.enrollmentData.courseType || "",
        args.enrollmentData.sessionType || "",
        args.enrollmentData.internshipPlan || "",
        args.enrollmentData.sessions?.toString() || "",
        args.enrollmentData.isGuestUser ? "Yes" : "No",
        args.enrollmentData.enrollmentDate,
        new Date().toISOString(), // Timestamp when added to sheet
      ];

      // Append the row to the Google Sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId: args.spreadsheetId,
        range: `${args.sheetName}!A:L`, // Assuming columns A-L for the data
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [rowData],
        },
      });

      console.log(
        `Successfully added enrollment ${args.enrollmentData.enrollmentNumber} to Google Sheets`,
      );
      return null;
    } catch (error) {
      console.error("Error adding enrollment to Google Sheets:", error);
      throw error;
    }
  },
});

// Action to create or update the sheet headers
export const setupEnrollmentSheet = action({
  args: {
    spreadsheetId: v.string(),
    sheetName: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const sheets = getGoogleSheetsClient();

      // Define the headers
      const headers = [
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

      // First, check if the sheet exists, if not create it
      try {
        await sheets.spreadsheets.values.get({
          spreadsheetId: args.spreadsheetId,
          range: `${args.sheetName}!A1`,
        });
      } catch (error) {
        // Sheet doesn't exist, create it
        console.log(`Sheet "${args.sheetName}" doesn't exist, creating it...`);
        await sheets.spreadsheets.batchUpdate({
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

      // Clear existing content and add headers
      await sheets.spreadsheets.values.clear({
        spreadsheetId: args.spreadsheetId,
        range: `${args.sheetName}!A:L`,
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: args.spreadsheetId,
        range: `${args.sheetName}!A1:L1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [headers],
        },
      });

      // Format headers (make them bold)
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: args.spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: await getSheetId(
                    sheets,
                    args.spreadsheetId,
                    args.sheetName,
                  ),
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: headers.length,
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

      console.log(`Successfully set up enrollment sheet: ${args.sheetName}`);
      return null;
    } catch (error) {
      console.error("Error setting up enrollment sheet:", error);
      throw error;
    }
  },
});

// Helper function to get sheet ID
async function getSheetId(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
): Promise<number> {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
  });

  const sheet = response.data.sheets?.find(
    (s: any) => s.properties?.title === sheetName,
  );

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  return sheet.properties.sheetId;
}
