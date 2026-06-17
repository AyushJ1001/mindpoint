"use node";

import { Resend } from "resend";
import {
  convexFailure,
  convexResultErrorCode,
  convexSuccess,
  type ConvexFailure,
  type ConvexSuccess,
} from "./result";

export type EmailAttachment = {
  content: Buffer;
  filename: string;
};

export type EmailDeliveryConfig = {
  attachments?: EmailAttachment[];
  from: string;
  html: string;
  replyTo?: string;
  subject: string;
  to: string | string[];
};

export type EmailDeliveryFailure = ConvexFailure<"EMAIL_DELIVERY_FAILED">;

export type EmailDeliveryResult = ConvexSuccess<{}> | EmailDeliveryFailure;

function emailDeliveryFailure(
  message: string,
  details?: EmailDeliveryFailure["error"]["details"],
): EmailDeliveryFailure {
  return convexFailure({
    code: convexResultErrorCode.EMAIL_DELIVERY_FAILED,
    ...(details !== undefined ? { details } : {}),
    message,
  });
}

function createResendClient(): EmailDeliveryFailure | Resend {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return emailDeliveryFailure(
      "RESEND_API_KEY environment variable is required",
    );
  }

  return new Resend(resendApiKey);
}

export async function sendEmailWithCopy(
  emailConfig: EmailDeliveryConfig,
): Promise<EmailDeliveryResult> {
  const resend = createResendClient();
  if ("_tag" in resend) {
    return resend;
  }

  const mainRecipients = Array.isArray(emailConfig.to)
    ? emailConfig.to
    : [emailConfig.to];
  const allRecipients = [...mainRecipients, "contact.themindpoint@gmail.com"];

  try {
    const result = await resend.emails.send({
      ...emailConfig,
      to: allRecipients,
    });

    if (result.error) {
      return emailDeliveryFailure(result.error.message, {
        recipientCount: allRecipients.length,
        subject: emailConfig.subject,
      });
    }

    return convexSuccess({});
  } catch (error) {
    return emailDeliveryFailure(
      error instanceof Error ? error.message : String(error),
      {
        recipientCount: allRecipients.length,
        subject: emailConfig.subject,
      },
    );
  }
}
