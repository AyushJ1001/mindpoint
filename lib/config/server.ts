import "server-only";

import { readPublicEnv, type EnvSource } from "./env";

export function isClerkServerConfigured(env: EnvSource = process.env): boolean {
  return Boolean(
    readPublicEnv(env).clerkPublishableKey && env.CLERK_SECRET_KEY,
  );
}

export function getResendEmailConfig(env: EnvSource = process.env): {
  fromEmail: string;
  resendApiKey: string;
} {
  const resendApiKey = env.RESEND_API_KEY;
  const fromEmail = env.FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    throw new Error(
      "Email service not configured. Please set RESEND_API_KEY and FROM_EMAIL.",
    );
  }

  return {
    fromEmail,
    resendApiKey,
  };
}

export function getContactEmailConfig(env: EnvSource = process.env): {
  fromEmail: string;
  resendApiKey: string;
  toEmail: string;
} {
  const { fromEmail, resendApiKey } = getResendEmailConfig(env);
  const toEmail = env.TO_EMAIL;

  if (!toEmail) {
    throw new Error(
      "Email service not configured. Please set RESEND_API_KEY, FROM_EMAIL, and TO_EMAIL.",
    );
  }

  return {
    fromEmail,
    resendApiKey,
    toEmail,
  };
}

export function getCareersEmailConfig(env: EnvSource = process.env): {
  fromEmail: string;
  resendApiKey: string;
  toEmail: string;
} {
  const { fromEmail, resendApiKey } = getResendEmailConfig(env);
  const toEmail = env.CAREERS_TO_EMAIL || env.TO_EMAIL;

  if (!toEmail) {
    throw new Error(
      "Email service not configured. Please set RESEND_API_KEY, FROM_EMAIL, and CAREERS_TO_EMAIL or TO_EMAIL.",
    );
  }

  return {
    fromEmail,
    resendApiKey,
    toEmail,
  };
}
