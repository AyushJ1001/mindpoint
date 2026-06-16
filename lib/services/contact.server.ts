import "server-only";

import { getContactEmailConfig } from "@/lib/config/server";
import { contactFormSchema } from "@/lib/domain/forms";
import {
  BoundaryExternalServiceError,
  configEffect,
  parseWithSchemaEffect,
} from "@/lib/effect";
import { Effect } from "effect";
import { Resend } from "resend";
import type { z } from "zod";

import type { ContactSubmissionResult } from "./contact";
import { escapeHtml, sanitizeHeaderValue } from "./html";

type ContactMessageInput = z.input<typeof contactFormSchema>;

export function sendContactMessageEffect(input: ContactMessageInput) {
  return Effect.gen(function* () {
    const { name, email, message } = yield* parseWithSchemaEffect(
      contactFormSchema,
      input,
    );
    const { fromEmail, resendApiKey, toEmail } = yield* configEffect(
      getContactEmailConfig,
    );
    const resend = new Resend(resendApiKey);
    const escapedName = escapeHtml(name);
    const escapedEmail = escapeHtml(email);
    const escapedMessage = escapeHtml(message).replace(/\n/g, "<br/>");
    const sanitizedName = sanitizeHeaderValue(name);
    const data = yield* Effect.tryPromise({
      try: () =>
        resend.emails.send({
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
        }),
      catch: (cause) =>
        new BoundaryExternalServiceError({
          ...(cause instanceof Error ? { cause } : {}),
          message:
            cause instanceof Error ? cause.message : "Error sending message.",
        }),
    });

    return { success: true, data } satisfies ContactSubmissionResult;
  });
}

export async function sendContactMessage(
  input: ContactMessageInput,
): Promise<ContactSubmissionResult> {
  return Effect.runPromise(sendContactMessageEffect(input));
}
