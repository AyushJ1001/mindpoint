export const metadata = {
  title: "Refund Policy - The Mind Point",
  description:
    "Read The Mind Point's refund and payment policy for courses, therapy sessions, and other mental health education services.",
  keywords:
    "refund policy, payment policy, cancellation, mental health education, The Mind Point",
  openGraph: {
    title: "Refund Policy - The Mind Point",
    description: "Learn about our refund and payment terms.",
    type: "website",
  },
};

export default function RefundPolicy() {
  return (
    <div className="mx-auto max-w-4xl bg-white p-6">
      {/* Refund Policy Section */}
      <section className="mb-12">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Refund Policy</h1>
        <p className="mb-6 leading-relaxed text-gray-700">
          This Refund and Payment Policy (&quot;Policy&quot;) applies to all
          payments made for Services provided by The Mind Point, including
          courses, internships, diplomas, workshops, therapy sessions,
          supervised sessions, and related programs. By making a payment or
          enrolling in any Service, you agree to be bound by this Policy. All
          payments are processed securely through authorized payment gateways,
          and we do not store your payment details.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          1. General Refund Rules
        </h2>
        <div className="mb-6 border-l-4 border-yellow-400 bg-yellow-50 p-4">
          <p className="mb-4 leading-relaxed text-gray-700">
            All sales and enrollments are final. No refunds, partial refunds,
            cancellations, or credits will be issued for any Services once
            payment is confirmed and enrollment is processed, except in the
            limited circumstances explicitly outlined below. This includes
            payments for courses, sessions, materials, or any additional fees
            (e.g., for LORs or document remakes).
          </p>
          <p className="leading-relaxed text-gray-700">
            We encourage you to review all Service details, including
            descriptions, schedules, and prerequisites, before making a payment.
          </p>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          2. Eligible Refund Circumstances
        </h2>
        <p className="mb-4 leading-relaxed text-gray-700">
          Refunds may be considered only in the following extreme cases, at the
          sole discretion of The Mind Point:
        </p>
        <ul className="mb-6 ml-4 list-inside list-disc text-gray-700">
          <li>
            <strong>Duplicate Payment:</strong> If a technical error results in
            a duplicate charge for the same Service, a full refund for the
            duplicate amount will be processed upon verification.
          </li>
          <li>
            <strong>Service Cancellation by The Mind Point:</strong> If we
            cancel a Service before it begins (e.g., due to unforeseen
            circumstances like faculty unavailability), you will receive a full
            refund or the option to transfer to an equivalent Service, if
            available.
          </li>
          <li>
            <strong>Extreme Medical Emergencies:</strong> Refunds for unstarted
            Services may be granted if verifiable proof of a medical emergency
            (e.g., hospitalization records, doctor&apos;s certificates) is
            submitted in writing within 48 hours of the issue. Partial refunds
            may apply if any portion of the Service has been delivered. Approval
            is not guaranteed and is subject to review.
          </li>
        </ul>

        <div className="mb-6 border-l-4 border-red-400 bg-red-50 p-4">
          <p className="mb-2 font-semibold text-gray-800">
            No refunds will be provided for:
          </p>
          <ul className="ml-4 list-inside list-disc text-gray-700">
            <li>Missed sessions, non-attendance, or partial participation.</li>
            <li>
              Dissatisfaction with content, faculty, timings, or outcomes.
            </li>
            <li>Technical issues on your end (e.g., internet problems).</li>
            <li>
              Changes in personal circumstances, work commitments, or travel.
            </li>
            <li>Access revocation due to policy violations.</li>
          </ul>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          3. Refund Process
        </h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          To request a refund, contact us at contact@themindpoint.org with your
          order details, payment proof, and supporting documentation (if
          applicable). Requests must be submitted within 7 days of payment or
          the qualifying event. Eligible refunds will be processed within 14-21
          business days via the original payment method, minus any transaction
          fees (typically 2-5%). International payments may incur additional
          banking charges.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          4. Payment Terms
        </h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          Payments must be made in full at the time of enrollment. We accept
          major credit/debit cards, UPI, net banking, and other methods via our
          payment gateway. All prices are in Indian Rupees (INR) and inclusive
          of applicable taxes unless stated otherwise. Late payments or failed
          transactions may result in enrollment cancellation without refund.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          5. Amendments
        </h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          The Mind Point reserves the right to update this Policy at any time.
          Continued use of Services after changes constitutes acceptance. Review
          this Policy periodically.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          Contact Information
        </h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          For questions, contact:
        </p>
        <div className="mb-6 ml-4 text-gray-700">
          <p>
            <strong>The Mind Point</strong>
          </p>
          <p>Email: contact@themindpoint.org</p>
          <p>Phone: +91 97707 80086</p>
        </div>
      </section>
    </div>
  );
}
