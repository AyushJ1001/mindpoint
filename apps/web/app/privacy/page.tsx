export const metadata = {
  title: "Privacy Policy - The Mind Point",
  description:
    "Read The Mind Point's privacy policy detailing how we collect, use, and protect your personal information on our mental health education platform.",
  keywords:
    "privacy policy, data protection, personal information, mental health education, The Mind Point",
  openGraph: {
    title: "Privacy Policy - The Mind Point",
    description: "Learn how we protect and handle your personal data.",
    type: "website",
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl bg-white p-6">
      {/* Privacy Policy Section */}
      <section className="mb-12">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Privacy Policy
        </h1>
        <p className="mb-6 leading-relaxed text-gray-700">
          This Privacy Policy (&quot;Policy&quot;) describes how The Mind Point
          collects, uses, discloses, and protects your personal information when
          you access our website at www.themindpoint.org (the
          &quot;Website&quot;) or use our Services, including courses,
          internships, diplomas, workshops, therapy sessions, supervised
          sessions, and related programs. By using the Website or Services, you
          consent to the practices described in this Policy. We are committed to
          protecting your privacy in compliance with applicable laws, including
          the Information Technology Act, 2000, and the Digital Personal Data
          Protection Act, 2023 (India).
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          1. Information We Collect
        </h2>
        <p className="mb-4 leading-relaxed text-gray-700">
          We collect the following types of information:
        </p>
        <ul className="mb-6 ml-4 list-inside list-disc text-gray-700">
          <li>
            <strong>Personal Information:</strong> Name, email address, phone
            number, billing details, and any other data you provide during
            registration, enrollment, or sessions (e.g., health-related details
            shared in therapy).
          </li>
          <li>
            <strong>Usage Data:</strong> IP address, browser type, device
            information, pages visited, and interaction data via cookies and
            analytics tools.
          </li>
          <li>
            <strong>Sensitive Information:</strong> In therapy or supervised
            sessions, we may collect health or psychological data with your
            explicit consent. This is handled with strict confidentiality.
          </li>
        </ul>
        <p className="mb-6 leading-relaxed text-gray-700">
          We do not collect information from individuals under 18 without
          parental consent.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          2. How We Use Your Information
        </h2>
        <p className="mb-4 leading-relaxed text-gray-700">
          Your information is used to:
        </p>
        <ul className="mb-6 ml-4 list-inside list-disc text-gray-700">
          <li>
            Provide and manage Services (e.g., enrollment confirmation, session
            scheduling, certificate issuance).
          </li>
          <li>
            Improve our Website and Services (e.g., analytics for user
            experience).
          </li>
          <li>
            Communicate with you (e.g., updates, newsletters, support
            responses).
          </li>
          <li>
            Comply with legal obligations (e.g., disclosing data if required by
            law or for safety reasons, such as imminent harm).
          </li>
          <li>Process payments and prevent fraud.</li>
        </ul>
        <p className="mb-6 leading-relaxed text-gray-700">
          We do not sell or rent your data to third parties. Sharing occurs only
          with affiliates, service providers (e.g., payment gateways), or as
          required by law.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          3. Cookies and Tracking Technologies
        </h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          We use cookies to enhance functionality, remember preferences, and
          analyze traffic. By using the Website, you consent to cookies. You can
          manage cookie settings via your browser, but this may limit features.
          Third-party tools (e.g., Google Analytics) may collect anonymized
          data.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          4. Data Security and Retention
        </h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          We implement reasonable security measures (e.g., encryption, access
          controls) to protect your data from unauthorized access, loss, or
          breach. However, no system is infallible, and we cannot guarantee
          absolute security. Data is retained as needed for Services (e.g., 3
          months for recordings) or legal requirements, then securely deleted.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          5. Your Rights
        </h2>
        <p className="mb-4 leading-relaxed text-gray-700">
          You have the right to:
        </p>
        <ul className="mb-6 ml-4 list-inside list-disc text-gray-700">
          <li>Access, update, or delete your personal information.</li>
          <li>
            Withdraw consent for data processing (may affect Service access).
          </li>
          <li>Opt out of marketing communications.</li>
        </ul>
        <p className="mb-6 leading-relaxed text-gray-700">
          Requests can be made via email at contact@themindpoint.org. We will
          respond within 30 days.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          6. Third-Party Links
        </h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          Our Website may contain links to external sites. We are not
          responsible for their privacy practices.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          7. International Transfers
        </h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          Data may be processed in India or other jurisdictions with adequate
          protections.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          8. Amendments
        </h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          We may update this Policy at any time. Changes will be posted here,
          and continued use constitutes acceptance. Review periodically.
        </p>

        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          Contact Information
        </h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          For questions or complaints, contact:
        </p>
        <div className="mb-6 ml-4 text-gray-700">
          <p>
            <strong>The Mind Point</strong>
          </p>
          <p>Email: contact@themindpoint.org</p>
          <p>Phone: +91 97707 80086</p>
          <p className="mt-4 leading-relaxed">
            If unresolved, you may approach relevant data protection authorities
            in India.
          </p>
        </div>
      </section>
    </div>
  );
}
