export function normalizeCertificateName(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 120) {
    throw new Error("Certificate name must be between 2 and 120 characters");
  }
  if (!/[\p{L}\p{N}]/u.test(name)) {
    throw new Error("Certificate name must contain a letter or number");
  }
  return name;
}

export function normalizeVerificationCode(value: string) {
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9-]{8,80}$/.test(code)) {
    throw new Error("Certificate verification code is invalid");
  }
  return code;
}
