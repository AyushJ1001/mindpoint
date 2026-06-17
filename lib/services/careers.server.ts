import "server-only";

import { getCareersEmailConfig } from "@/lib/config/server";
import { careerApplicationSchema } from "@/lib/domain/forms";
import {
  BoundaryExternalServiceError,
  BoundaryValidationError,
  configEffect,
  parseWithSchemaEffect,
} from "@/lib/effect";
import { Effect } from "effect";
import { Resend } from "resend";

import type { CareersSubmissionResult } from "./careers";
import { escapeHtml, sanitizeHeaderValue } from "./html";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export class ResumeTooLargeError extends Error {
  constructor() {
    super("Resume file must be 5 MB or smaller.");
    this.name = "ResumeTooLargeError";
  }
}

export class InvalidRolesPayloadError extends Error {
  constructor() {
    super("The 'roles' field must be a valid JSON array.");
    this.name = "InvalidRolesPayloadError";
  }
}

function getSafeLinkedInUrl(linkedIn: string): string | null {
  if (!linkedIn) {
    return null;
  }

  try {
    const url = new URL(linkedIn);
    const isLinkedInHost =
      url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com");

    if (url.protocol !== "https:" || !isLinkedInHost) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function parseRolesEffect(rolesRaw: string) {
  return Effect.try({
    try: () => {
      const parsed = JSON.parse(rolesRaw);
      return Array.isArray(parsed) ? parsed : [];
    },
    catch: (cause) =>
      new BoundaryValidationError({
        ...(cause instanceof Error ? { cause } : {}),
        message: "The 'roles' field must be a valid JSON array.",
      }),
  });
}

export function sendCareersApplicationEffect(formData: FormData) {
  return Effect.gen(function* () {
    const fullName = String(formData.get("fullName") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const location = String(formData.get("location") || "");
    const linkedIn = String(formData.get("linkedIn") || "");
    const rolesRaw = String(formData.get("roles") || "[]");
    const coverLetter = String(formData.get("coverLetter") || "");
    const resume = formData.get("resume");

    const roles = yield* parseRolesEffect(rolesRaw);

    yield* parseWithSchemaEffect(careerApplicationSchema, {
      coverLetter,
      email,
      fullName,
      linkedIn,
      location,
      phone,
      roles,
    });

    const attachments: {
      filename: string;
      content: Buffer;
      contentType?: string;
    }[] = [];

    if (resume && resume instanceof File) {
      if (resume.size > MAX_RESUME_BYTES) {
        return yield* Effect.fail(
          new BoundaryValidationError({
            message: "Resume file must be 5 MB or smaller.",
          }),
        );
      }

      const arrayBuffer = yield* Effect.tryPromise({
        try: () => resume.arrayBuffer(),
        catch: (cause) =>
          new BoundaryValidationError({
            ...(cause instanceof Error ? { cause } : {}),
            message: "Resume file could not be read.",
          }),
      });
      attachments.push({
        filename: resume.name || "resume",
        content: Buffer.from(arrayBuffer),
        contentType: resume.type || undefined,
      });
    }

    const escapedFullName = escapeHtml(fullName);
    const escapedEmail = escapeHtml(email);
    const escapedPhone = escapeHtml(phone);
    const escapedLocation = escapeHtml(location);
    const safeLinkedIn = getSafeLinkedInUrl(linkedIn);
    const escapedLinkedIn = safeLinkedIn ? escapeHtml(safeLinkedIn) : "";
    const escapedRoles = roles.map((role) => escapeHtml(role));
    const escapedCoverLetter = escapeHtml(coverLetter).replace(/\n/g, "<br/>");
    const sanitizedFullName = sanitizeHeaderValue(fullName);

    const html = `
      <div>
        <h2>New Careers Application</h2>
        <p><strong>Name:</strong> ${escapedFullName}</p>
        <p><strong>Email:</strong> ${escapedEmail}</p>
        <p><strong>Phone:</strong> ${escapedPhone}</p>
        <p><strong>Location:</strong> ${escapedLocation}</p>
        ${safeLinkedIn ? `<p><strong>LinkedIn:</strong> <a href="${escapedLinkedIn}">${escapedLinkedIn}</a></p>` : ""}
        <p><strong>Roles of Interest:</strong> ${escapedRoles.join(", ") || "(none)"}</p>
        ${coverLetter ? `<p><strong>Cover Letter:</strong></p><p>${escapedCoverLetter}</p>` : ""}
      </div>
    `;

    const { fromEmail, resendApiKey, toEmail } = yield* configEffect(
      getCareersEmailConfig,
    );
    const resend = new Resend(resendApiKey);
    yield* Effect.tryPromise({
      try: () =>
        resend.emails.send({
          from: `Careers Application <${fromEmail}>`,
          to: [toEmail],
          subject: `New Careers Application: ${sanitizedFullName}`,
          replyTo: email || undefined,
          html,
          attachments,
        }),
      catch: (cause) =>
        new BoundaryExternalServiceError({
          ...(cause instanceof Error ? { cause } : {}),
          message:
            cause instanceof Error
              ? cause.message
              : "Failed to submit application",
        }),
    });

    return { success: true } satisfies CareersSubmissionResult;
  });
}

export async function sendCareersApplication(
  formData: FormData,
): Promise<CareersSubmissionResult> {
  return Effect.runPromise(sendCareersApplicationEffect(formData));
}
