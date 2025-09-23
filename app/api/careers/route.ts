import { NextResponse } from "next/server";
import { Resend } from "resend";
import { withRateLimit } from "@/lib/with-rate-limit";

async function handleCareersApplication(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const toEmail = "contact.themindpoint@gmail.com";

  if (!apiKey || !fromEmail) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Email service not configured. Please set RESEND_API_KEY and FROM_EMAIL.",
      },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const formData = await req.formData();

    const fullName = String(formData.get("fullName") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const location = String(formData.get("location") || "");
    const linkedIn = String(formData.get("linkedIn") || "");
    const rolesRaw = String(formData.get("roles") || "[]");
    const coverLetter = String(formData.get("coverLetter") || "");
    const resume = formData.get("resume");

    const roles: string[] = (() => {
      try {
        const parsed = JSON.parse(rolesRaw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();

    const attachments: {
      filename: string;
      content: Buffer;
      contentType?: string;
    }[] = [];

    if (resume && resume instanceof File) {
      const arrayBuffer = await resume.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      attachments.push({
        filename: resume.name || "resume",
        content: buffer,
      });
    }

    const html = `
      <div>
        <h2>New Careers Application</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Location:</strong> ${location}</p>
        ${linkedIn ? `<p><strong>LinkedIn:</strong> <a href="${linkedIn}">${linkedIn}</a></p>` : ""}
        <p><strong>Roles of Interest:</strong> ${roles.join(", ") || "(none)"}</p>
        ${coverLetter ? `<p><strong>Cover Letter:</strong></p><p>${coverLetter.replace(/\n/g, "<br/>")}</p>` : ""}
      </div>
    `;

    const data = await resend.emails.send({
      from: `Careers Application <${fromEmail}>`,
      to: [toEmail, "contact.themindpoint@gmail.com"],
      subject: `New Careers Application: ${fullName}`,
      replyTo: email || undefined,
      html,
      attachments,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

export const POST = withRateLimit(handleCareersApplication, {
  errorMessage:
    "Too many career applications. Please wait before submitting another.",
});
