"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendEnrollmentConfirmation = action({
  args: {
    userEmail: v.string(),
    courseName: v.string(),
    enrollmentNumber: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await resend.emails.send({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Payment Confirmation</h2>
          <p>Dear Learner,</p>
          <p>We are pleased to inform you that your payment for the course <strong>${args.courseName}</strong> has been successfully received.</p>
          <p>Your enrollment number is:</p>
          <div style="font-size: 18px; font-weight: bold; color: #2E86C1; margin: 10px 0;">
            ${args.enrollmentNumber}
          </div>
          <p>Please keep this enrollment number safe as it will be required to access your course materials and support.</p>
          <p>Thank you for choosing us. We wish you a great learning experience!</p>
          <br>
          <p>Best regards,<br>The Mind Point Team</p>
        </div>
      `,
    });
    return null;
  },
});

export const sendCartCheckoutConfirmation = action({
  args: {
    userEmail: v.string(),
    enrollments: v.array(
      v.object({
        enrollmentId: v.id("enrollments"),
        enrollmentNumber: v.string(),
        courseName: v.string(),
        courseId: v.id("courses"),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await resend.emails.send({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Payment Confirmation</h2>
          <p>Dear Learner,</p>
          <p>We are happy to confirm that your payments for the following courses have been successfully received:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Course Name</th>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Enrollment Number</th>
              </tr>
            </thead>
            <tbody>
              ${args.enrollments
                .map(
                  (e) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${e.courseName}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2E86C1;">${e.enrollmentNumber}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <p style="margin-top: 20px;">Please save these enrollment numbers for future reference and access to course materials.</p>
          <p>Thank you for learning with us!</p>
          <br>
          <p>Best regards,<br>The Mind Point Team</p>
        </div>
      `,
    });
    return null;
  },
});
