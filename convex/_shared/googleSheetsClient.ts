"use node";

import { google, type sheets_v4 } from "googleapis";
import {
  convexFailure,
  convexResultErrorCode,
  type ConvexFailure,
} from "./result";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"] as const;

type GoogleCredentials = {
  client_email?: string;
  private_key?: string;
  project_id?: string;
  [key: string]: string | undefined;
};

export type GoogleSheetsClient = sheets_v4.Sheets;

export type GoogleSheetsFailure = ConvexFailure<
  | "CONFIGURATION_ERROR"
  | "EXTERNAL_SERVICE_ERROR"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
>;

export function googleSheetsFailure(
  code: GoogleSheetsFailure["error"]["code"],
  message: string,
  details?: GoogleSheetsFailure["error"]["details"],
): GoogleSheetsFailure {
  return convexFailure({
    code,
    ...(details !== undefined ? { details } : {}),
    message,
  });
}

export function isGoogleSheetsFailure(
  result: GoogleSheetsClient | GoogleSheetsFailure,
): result is GoogleSheetsFailure {
  return "_tag" in result && result._tag === "Failure";
}

export function getGoogleSheetsClientResult():
  | GoogleSheetsClient
  | GoogleSheetsFailure {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!credentialsJson) {
    return googleSheetsFailure(
      convexResultErrorCode.CONFIGURATION_ERROR,
      "GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is required.",
    );
  }

  let credentials: GoogleCredentials;
  try {
    credentials = JSON.parse(credentialsJson) as GoogleCredentials;
  } catch (error) {
    return googleSheetsFailure(
      convexResultErrorCode.CONFIGURATION_ERROR,
      "Invalid Google credentials JSON format.",
      {
        parseError: error instanceof Error ? error.message : String(error),
      },
    );
  }

  if (!credentials.client_email || !credentials.private_key) {
    return googleSheetsFailure(
      convexResultErrorCode.CONFIGURATION_ERROR,
      "Google credentials JSON must include client_email and private_key.",
    );
  }

  const auth = new google.auth.GoogleAuth({
    scopes: [...SCOPES],
    credentials,
  });

  return google.sheets({ version: "v4", auth });
}
