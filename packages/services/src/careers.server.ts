import "server-only";

import { getCareersEmailConfig } from "@mindpoint/config/server";
import { careerApplicationSchema } from "@mindpoint/domain/forms";
import { Resend } from "resend";

import type { CareersSubmissionResult } from "./careers";
import { escapeHtml } from "./html";

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

export async function sendCareersApplication(
  formData: FormData,
): Promise<CareersSubmissionResult> {
  const { fromEmail, resendApiKey, toEmail } = getCareersEmailConfig();
  const resend = new Resend(resendApiKey);

  const fullName = String(formData.get("fullName") || "");
  const email = String(formData.get("email") || "");
  const phone = String(formData.get("phone") || "");
  const location = String(formData.get("location") || "");
  const linkedIn = String(formData.get("linkedIn") || "");
  const rolesRaw = String(formData.get("roles") || "[]");
  const coverLetter = String(formData.get("coverLetter") || "");
  const resume = formData.get("resume");

  let roles: string[];
  try {
    const parsed = JSON.parse(rolesRaw);
    roles = Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new InvalidRolesPayloadError();
  }

  careerApplicationSchema.parse({
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
      throw new ResumeTooLargeError();
    }

    const arrayBuffer = await resume.arrayBuffer();
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

  const data = await resend.emails.send({
    from: `Careers Application <${fromEmail}>`,
    to: [toEmail],
    subject: `New Careers Application: ${fullName}`,
    replyTo: email || undefined,
    html,
    attachments,
  });

  return { success: true, data };
}
