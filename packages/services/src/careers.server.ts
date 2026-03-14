import "server-only";

import { getResendEmailConfig } from "@mindpoint/config/server";
import { careerApplicationSchema } from "@mindpoint/domain/forms";
import { Resend } from "resend";

import type { CareersSubmissionResult } from "./careers";

export async function sendCareersApplication(
  formData: FormData,
): Promise<CareersSubmissionResult> {
  const { fromEmail, resendApiKey } = getResendEmailConfig();
  const toEmail = "contact.themindpoint@gmail.com";
  const resend = new Resend(resendApiKey);

  const fullName = String(formData.get("fullName") || "");
  const email = String(formData.get("email") || "");
  const phone = String(formData.get("phone") || "");
  const location = String(formData.get("location") || "");
  const linkedIn = String(formData.get("linkedIn") || "");
  const rolesRaw = String(formData.get("roles") || "[]");
  const coverLetter = String(formData.get("coverLetter") || "");
  const resume = formData.get("resume");

  const roles: string[] = (() => {
    try {
      const parsed = JSON.parse(rolesRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

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
    const arrayBuffer = await resume.arrayBuffer();
    attachments.push({
      filename: resume.name || "resume",
      content: Buffer.from(arrayBuffer),
      contentType: resume.type || undefined,
    });
  }

  const html = `
      <div>
        <h2>New Careers Application</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Location:</strong> ${location}</p>
        ${linkedIn ? `<p><strong>LinkedIn:</strong> <a href="${linkedIn}">${linkedIn}</a></p>` : ""}
        <p><strong>Roles of Interest:</strong> ${roles.join(", ") || "(none)"}</p>
        ${coverLetter ? `<p><strong>Cover Letter:</strong></p><p>${coverLetter.replace(/\n/g, "<br/>")}</p>` : ""}
      </div>
    `;

  const data = await resend.emails.send({
    from: `Careers Application <${fromEmail}>`,
    to: [toEmail, "contact.themindpoint@gmail.com"],
    subject: `New Careers Application: ${fullName}`,
    replyTo: email || undefined,
    html,
    attachments,
  });

  return { success: true, data };
}
