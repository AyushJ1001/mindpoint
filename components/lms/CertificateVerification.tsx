"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ShieldCheck,
} from "lucide-react";
import { Certificate } from "@/components/lms/Certificate";
import { downloadCertificatePng } from "@/lib/certificate-image";
import { publicCertificateApi } from "@/lib/lms-api";

const configured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export function CertificateVerification({ code }: { code: string }) {
  const certificate = useQuery(
    publicCertificateApi.verify,
    configured ? { verificationCode: code } : "skip",
  );
  const loading = configured && certificate === undefined;
  const [downloadError, setDownloadError] = useState<string>();

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
        {loading ? (
          <div className="certificate-verify-state" aria-busy="true">
            <ShieldCheck />
            <h1>Checking Certificate…</h1>
          </div>
        ) : certificate ? (
          <div className="certificate-verify-state">
            {certificate.status === "issued" ? (
              <CheckCircle2 className="valid" />
            ) : (
              <AlertTriangle className="held" />
            )}
            <p className="eyebrow">Certificate verification</p>
            <h1>
              {certificate.status === "issued"
                ? "This Certificate is valid."
                : `This Certificate is ${certificate.status}.`}
            </h1>
            <dl>
              <div>
                <dt>Course</dt>
                <dd>{certificate.courseName}</dd>
              </div>
              <div>
                <dt>Recipient</dt>
                <dd>
                  {certificate.identityVisible
                    ? certificate.recipientName
                    : "Hidden by recipient preference"}
                </dd>
              </div>
              <div>
                <dt>Issued</dt>
                <dd>{new Date(certificate.issuedAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt>Verification code</dt>
                <dd>{certificate.verificationCode}</dd>
              </div>
            </dl>
            {certificate.status === "issued" ? (
              <>
                <div className="certificate-verify-sheet">
                  <Certificate
                    data={{
                      recipientName:
                        certificate.identityVisible && certificate.recipientName
                          ? certificate.recipientName
                          : "The Mind Point learner",
                      courseName: certificate.courseName,
                      verificationCode: certificate.verificationCode,
                      issuedAt: certificate.issuedAt,
                      courseType: certificate.courseType,
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="certificate-verify-download"
                  onClick={async () => {
                    setDownloadError(undefined);
                    try {
                      await downloadCertificatePng({
                        recipientName:
                          certificate.identityVisible &&
                          certificate.recipientName
                            ? certificate.recipientName
                            : "The Mind Point learner",
                        courseName: certificate.courseName,
                        verificationCode: certificate.verificationCode,
                        issuedAt: certificate.issuedAt,
                        courseType: certificate.courseType,
                      });
                    } catch {
                      setDownloadError(
                        "Could not prepare the download. Please try again.",
                      );
                    }
                  }}
                >
                  <Download aria-hidden="true" /> Download certificate
                </button>
                {downloadError ? (
                  <p className="certificate-verify-error" role="alert">
                    {downloadError}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        ) : (
          <div className="certificate-verify-state">
            <AlertTriangle className="held" />
            <p className="eyebrow">Certificate verification</p>
            <h1>We could not verify this code.</h1>
            <p>Check every character or contact The Mind Point for support.</p>
          </div>
        )}
        <Link href="/">Return to The Mind Point</Link>
      </section>
    </main>
  );
}
