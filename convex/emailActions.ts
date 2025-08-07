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
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await resend.emails.send({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Enrollment Confirmation</h2>
          <p>Dear Learner,</p>
          <p>We are pleased to inform you that your payment for the course <strong>${args.courseName}</strong> has been successfully received.</p>

          <h3 style="margin-top: 20px;">Course Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 40%;">Course Name</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${args.courseName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Start Date</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${args.startDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">End Date</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${args.endDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Time</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${args.startTime} - ${args.endTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Enrollment No</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2E86C1;">${args.enrollmentNumber}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="margin-top: 24px;">Things to note</h3>
          <ul>
            <li>You will be added to the group a day prior to the course.</li>
            <li>Kindly check your email & WhatsApp for the group link (a week before the course start date).</li>
            <li>Please provide your WhatsApp number if not provided on <strong>+91 9770780086</strong>.</li>
          </ul>

          <p>If you need any help, please reach out to us at <strong>+91 9770780086</strong>.</p>
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
        startDate: v.string(),
        endDate: v.string(),
        startTime: v.string(),
        endTime: v.string(),
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
          <h2 style="color: #4CAF50;">Enrollment Confirmation</h2>
          <p>Dear Learner,</p>
          <p>We are happy to confirm that your payments for the following courses have been successfully received:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Course Name</th>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Start Date</th>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">End Date</th>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Time</th>
                <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Enrollment No</th>
              </tr>
            </thead>
            <tbody>
              ${args.enrollments
                .map(
                  (e) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${e.courseName}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${e.startDate}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${e.endDate}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${e.startTime} - ${e.endTime}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2E86C1;">${e.enrollmentNumber}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <h3 style="margin-top: 24px;">Things to note</h3>
          <ul>
            <li>You will be added to the group a day prior to the course.</li>
            <li>Kindly check your email & WhatsApp for the group link (a week before the course start date).</li>
            <li>Please provide your WhatsApp number if not provided on <strong>+91 9770780086</strong>.</li>
          </ul>

          <p>If you need any help, please reach out to us at <strong>+91 9770780086</strong>.</p>
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
