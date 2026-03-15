import "server-only";

import { getContactEmailConfig } from "@mindpoint/config/server";
import { contactFormSchema } from "@mindpoint/domain/forms";
import { Resend } from "resend";

import type { ContactSubmissionResult } from "./contact";
import { escapeHtml, sanitizeHeaderValue } from "./html";

export async function sendContactMessage(
  input: unknown,
): Promise<ContactSubmissionResult> {
  const { name, email, message } = contactFormSchema.parse(input);
  const { fromEmail, resendApiKey, toEmail } = getContactEmailConfig();
  const resend = new Resend(resendApiKey);
  const escapedName = escapeHtml(name);
  const escapedEmail = escapeHtml(email);
  const escapedMessage = escapeHtml(message).replace(/\n/g, "<br/>");
  const sanitizedName = sanitizeHeaderValue(name);
  const data = await resend.emails.send({
    from: `"Contact Form" <${fromEmail}>`,
    to: [toEmail],
    subject: `New Contact Message from ${sanitizedName}`,
    replyTo: email,
    html: `
        <p><strong>Name:</strong> ${escapedName}</p>
        <p><strong>Email:</strong> ${escapedEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${escapedMessage}</p>
      `,
  });

  return { success: true, data };
}
