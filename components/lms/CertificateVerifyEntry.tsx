"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

/**
 * The entry point for the public verification promise: a person reading a
 * certificate follows "verify at themindpoint.org/verify", lands here, and
 * enters the code printed on the sheet. The code is normalized server-side, so
 * this only needs to route to the lookup page.
 */
export function CertificateVerifyEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const trimmed = code.trim();

  return (
    <main className="certificate-verify-page">
      <section className="certificate-verify-card">
        <Image
          src="/brand/the-mind-point-logo.png"
          alt="The Mind Point"
          width={300}
          height={228}
          priority
        />
        <div className="certificate-verify-state">
          <ShieldCheck className="valid" />
          <p className="eyebrow">Certificate verification</p>
          <h1>Verify a Certificate.</h1>
          <p>
            Enter the verification code printed on the certificate to confirm it
            was issued by The Mind Point.
          </p>
          <form
            className="certificate-verify-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (trimmed.length === 0) return;
              router.push(`/verify/${encodeURIComponent(trimmed)}`);
            }}
          >
            <label htmlFor="verification-code">Verification code</label>
            <input
              id="verification-code"
              name="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. TMP-CERT-260916"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={120}
            />
            <button type="submit" disabled={trimmed.length === 0}>
              Check certificate
            </button>
          </form>
        </div>
        <Link href="/">Return to The Mind Point</Link>
      </section>
    </main>
  );
}
