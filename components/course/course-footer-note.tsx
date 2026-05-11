"use client";

const WHATSAPP_URL = "https://wa.me/917304111091";
const INSTAGRAM_URL = "https://www.instagram.com/themindpoint";

// A single quiet line. Sits at the very end of the course page, after FAQ.
// Replaces the former CommunitiesSection card.
export default function CourseFooterNote() {
  return (
    <section className="pb-20 pt-6 sm:pb-24">
      <div className="calm-container">
        <p className="text-sm text-foreground/55">
          Questions?{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="calm-link"
          >
            Reach us on WhatsApp
          </a>{" "}
          or{" "}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="calm-link"
          >
            Instagram
          </a>
          .
        </p>
      </div>
    </section>
  );
}
