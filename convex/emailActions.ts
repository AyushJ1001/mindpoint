"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendEnrollmentConfirmation = action({
  args: {
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    courseName: v.string(),
    enrollmentNumber: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Send email
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
    userPhone: v.optional(v.string()),
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
    // Send email
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

export const sendTherapyEnrollmentConfirmation = action({
  args: {
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    therapyType: v.string(),
    sessionCount: v.number(),
    enrollmentNumber: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Send email
    await resend.emails.send({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Therapy Session Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Therapy Session Enrollment Confirmation</h2>
          <p>Dear Client,</p>
          <p>We are pleased to confirm your enrollment for <strong>${args.therapyType}</strong> therapy sessions.</p>

          <h3 style="margin-top: 20px;">Session Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 40%;">Therapy Type</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${args.therapyType}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Number of Sessions</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${args.sessionCount}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Enrollment No</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2E86C1;">${args.enrollmentNumber}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="margin-top: 24px;">Next Steps</h3>
          <ul>
            <li>Your assigned therapist will contact you within 24-48 hours to schedule your first session.</li>
            <li>Sessions will be conducted online via secure video conferencing platforms.</li>
            <li>Please ensure you have a quiet, private space for your sessions.</li>
            <li>Your therapist will provide you with session links and any preparation materials.</li>
          </ul>

          <p>If you have any questions or need to reschedule, please contact us at <strong>+91 9770780086</strong>.</p>
          <p>Thank you for choosing The Mind Point for your therapy journey.</p>
          <br>
          <p>Best regards,<br>The Mind Point Therapy Team</p>
        </div>
      `,
    });

    return null;
  },
});

export const sendSupervisedEnrollmentConfirmation = action({
  args: {
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    supervisionPackage: v.string(),
    sessionCount: v.number(),
    enrollmentNumber: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Send email
    await resend.emails.send({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Supervised Session Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Supervised Session Enrollment Confirmation</h2>
          <p>Dear Trainee,</p>
          <p>We are pleased to confirm your enrollment for <strong>${args.supervisionPackage}</strong> supervised sessions.</p>

          <h3 style="margin-top: 20px;">Supervision Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 40%;">Supervision Package</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${args.supervisionPackage}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Number of Sessions</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${args.sessionCount}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Enrollment No</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2E86C1;">${args.enrollmentNumber}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="margin-top: 24px;">Next Steps</h3>
          <ul>
            <li>Your supervisor will contact you within 24-48 hours to schedule your first session.</li>
            <li>All sessions will be conducted online via Google Meet.</li>
            <li>You will receive preparation materials and templates before your first session.</li>
            <li>Please ensure you have a quiet environment and necessary materials ready.</li>
          </ul>

          <p>If you have any questions or need to reschedule, please contact us at <strong>+91 9770780086</strong>.</p>
          <p>Thank you for choosing The Mind Point for your professional development.</p>
          <br>
          <p>Best regards,<br>The Mind Point Supervision Team</p>
        </div>
      `,
    });

    return null;
  },
});

export const sendSupervisedTherapyWelcomeEmail = action({
  args: {
    userEmail: v.string(),
    studentName: v.string(),
    sessionType: v.union(
      v.literal("focus"),
      v.literal("flow"),
      v.literal("elevate"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Send email with attachments
    await resend.emails.send({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Welcome to The Mind Point Supervised Sessions Program!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #4CAF50; margin-bottom: 20px;">Welcome to The Mind Point Supervised Sessions Program!</h2>
          
          <p>Dear <strong>${args.studentName}</strong>,</p>
          
          <p>Thank you for registering for The Mind Point's Supervised Sessions Program! We're excited to support your growth as a confident, skilled therapist.</p>
          
          <p>You have enrolled in the <strong>${args.sessionType.charAt(0).toUpperCase() + args.sessionType.slice(1)}</strong> session package.</p>
          
          <h3 style="color: #2E86C1; margin-top: 30px; margin-bottom: 15px;">Here's what happens next:</h3>
          
          <h4 style="color: #333; margin-top: 25px; margin-bottom: 10px;">Next Steps:</h4>
          <ul style="margin-left: 20px; margin-bottom: 20px;">
            <li>Please review and sign the attached Supervision Agreement and Consent Form.</li>
            <li>A member of our supervision team will contact you shortly to schedule your first session at a convenient time.</li>
            <li>Before your session, we will send you a Pre-Supervision Checklist and Session Preparation Templates to help you prepare.</li>
          </ul>
          
          <h4 style="color: #333; margin-top: 25px; margin-bottom: 10px;">Important Notes:</h4>
          <ul style="margin-left: 20px; margin-bottom: 20px;">
            <li>All sessions are conducted online via Google Meet, so please ensure you have a quiet, private space with a stable internet connection.</li>
            <li>For any questions or assistance, feel free to reply to this email or contact us at <strong>+91 97707 80086</strong>.</li>
          </ul>
          
          <p style="margin-top: 30px;">We look forward to supporting your journey toward becoming a skilled therapist!</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 0;"><strong>Warm regards,</strong><br>
            The Mind Point Team<br>
            <a href="https://www.themindpoint.org" style="color: #4CAF50; text-decoration: none;">www.themindpoint.org</a></p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "TMP Client Intake Form.pdf",
          path: "https://themindpoint.org/checklist/TMP%20Client%20Intake%20Form%20(1).pdf",
        },
        {
          filename: "TMP Consent Form for Live Client Session Observation.pdf",
          path: "https://themindpoint.org/checklist/TMP%20Consent%20Form%20for%20Live%20Client%20Session%20Observation%20(1).pdf",
        },
        {
          filename: "TMP Session Preparation Template.pdf",
          path: "https://themindpoint.org/checklist/TMP%20Session%20Preparation%20Template.pdf",
        },
        {
          filename: "TMP Supervised Session Self-Preparation Checklist.pdf",
          path: "https://themindpoint.org/checklist/TMP%20Supervised%20Session%20Self-Preparation%20Checklist.pdf",
        },
      ],
    });

    return null;
  },
});
