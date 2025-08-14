import { contactFormSchema } from "@/lib/utils";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const { name, email, message } = contactFormSchema.parse(await req.json());

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const toEmail = process.env.TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Email service not configured. Please set RESEND_API_KEY, FROM_EMAIL, and TO_EMAIL.",
      },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: `"Contact Form" <${fromEmail}>`,
      to: [toEmail, "contact.themindpoint@gmail.com"],
      subject: `New Contact Message from ${name}`,
      replyTo: email,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
