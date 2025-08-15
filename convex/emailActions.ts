"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { Resend } from "resend";
import { api } from "./_generated/api";

const resendApiKey = process.env.RESEND_API_KEY;
console.log("Resend API Key configured:", !!resendApiKey);

if (!resendApiKey) {
  console.error("RESEND_API_KEY is not configured!");
  throw new Error("RESEND_API_KEY environment variable is required");
}

const resend = new Resend(resendApiKey);

// Helper function to ensure all emails are also sent to contact.themindpoint@gmail.com
const sendEmailWithCopy = async (emailConfig: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: any[];
}) => {
  // Ensure the main recipient gets the email
  const mainRecipients = Array.isArray(emailConfig.to)
    ? emailConfig.to
    : [emailConfig.to];

  // Add contact.themindpoint@gmail.com to the recipients
  const allRecipients = [...mainRecipients, "contact.themindpoint@gmail.com"];

  return await resend.emails.send({
    ...emailConfig,
    to: allRecipients,
  });
};

// Test email action for debugging
export const sendTestEmail = action({
  args: {
    userEmail: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      console.log("Attempting to send test email to:", args.userEmail);

      const result = await sendEmailWithCopy({
        from: "The Mind Point <no-reply@themindpoint.org>",
        to: args.userEmail,
        subject: "Test Email from The Mind Point",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4CAF50;">Test Email</h2>
            <p>This is a test email to verify that the email system is working correctly.</p>
            <p>If you received this email, the email configuration is working properly.</p>
            <br>
            <p>Best regards,<br>The Mind Point Team</p>
          </div>
        `,
      });

      console.log("Test email sent successfully:", result);
    } catch (error) {
      console.error("Failed to send test email:", error);
      throw error;
    }

    return null;
  },
});

// Test supervised email action for debugging
export const sendTestSupervisedEmail = action({
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
    try {
      console.log("Testing supervised email with attachments...");

      // Call the actual supervised email function
      await ctx.runAction(api.emailActions.sendSupervisedTherapyWelcomeEmail, {
        userEmail: args.userEmail,
        studentName: args.studentName,
        sessionType: args.sessionType,
      });

      console.log("Test supervised email sent successfully!");
    } catch (error) {
      console.error("Test supervised email failed:", error);
      throw error;
    }

    return null;
  },
});

export const sendCertificateEnrollmentConfirmation = action({
  args: {
    userEmail: v.string(),
    userName: v.string(),
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
    await sendEmailWithCopy({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Certificate Course Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Certificate Course Enrollment Confirmation</h2>
          <p>Dear ${args.userName},</p>
          <p>We are pleased to inform you that your payment for the certificate course <strong>${args.courseName}</strong> has been successfully received.</p>

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

          <h3 style="margin-top: 24px;">Please Note</h3>
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

export const sendInternshipEnrollmentConfirmation = action({
  args: {
    userEmail: v.string(),
    userName: v.string(),
    userPhone: v.optional(v.string()),
    courseName: v.string(),
    enrollmentNumber: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    internshipPlan: v.union(v.literal("120"), v.literal("240")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const planText =
      args.internshipPlan === "120"
        ? "2 week (120 hours)"
        : "4 week (240 hours)";

    // Send email
    await sendEmailWithCopy({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Internship Program Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Internship Program Enrollment Confirmation</h2>
          <p>Dear ${args.userName},</p>
          <p>We are pleased to inform you that your payment for the internship program <strong>${args.courseName}</strong> has been successfully received.</p>

          <h3 style="margin-top: 20px;">Program Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 40%;">Program Name</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${args.courseName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Program Plan</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2E86C1;">${planText}</td>
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

          <h3 style="margin-top: 24px;">Please Note</h3>
          <ul>
            <li>You will be added to the group a day prior to the program.</li>
            <li>Kindly check your email & WhatsApp for the group link (a week before the program start date).</li>
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

export const sendDiplomaEnrollmentConfirmation = action({
  args: {
    userEmail: v.string(),
    userName: v.string(),
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
    await sendEmailWithCopy({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Diploma Course Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Diploma Course Enrollment Confirmation</h2>
          <p>Dear ${args.userName},</p>
          <p>We are pleased to inform you that your payment for the diploma course <strong>${args.courseName}</strong> has been successfully received.</p>

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

          <h3 style="margin-top: 24px;">Please Note</h3>
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

export const sendPreRecordedEnrollmentConfirmation = action({
  args: {
    userEmail: v.string(),
    userName: v.string(),
    userPhone: v.optional(v.string()),
    courseName: v.string(),
    enrollmentNumber: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Send email
    await sendEmailWithCopy({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Pre-Recorded Course Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Pre-Recorded Course Enrollment Confirmation</h2>
          <p>Dear ${args.userName},</p>
          <p>We are pleased to inform you that your payment for the pre-recorded course <strong>${args.courseName}</strong> has been successfully received.</p>

          <h3 style="margin-top: 20px;">Course Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 40%;">Course Name</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${args.courseName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;">Enrollment No</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2E86C1;">${args.enrollmentNumber}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="margin-top: 24px;">Please Note</h3>
          <ul>
            <li>Course content material and videos will be sent to you in 2-3 business days of the date of purchase.</li>
            <li>You can access the course at your own pace once you receive the materials.</li>
            <li>For technical support, please contact us at <strong>+91 9770780086</strong>.</li>
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

export const sendMasterclassEnrollmentConfirmation = action({
  args: {
    userEmail: v.string(),
    userName: v.string(),
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
    await sendEmailWithCopy({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Masterclass Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Masterclass Enrollment Confirmation</h2>
          <p>Dear ${args.userName},</p>
          <p>We are pleased to inform you that your payment for the masterclass <strong>${args.courseName}</strong> has been successfully received.</p>

          <h3 style="margin-top: 20px;">Masterclass Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 40%;">Masterclass Name</td>
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

          <h3 style="margin-top: 24px;">Please Note</h3>
          <ul>
            <li>You will be added to the group a day prior to the masterclass.</li>
            <li>Kindly check your email & WhatsApp for the group link (a week before the masterclass start date).</li>
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

// Legacy function for backward compatibility
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
    await sendEmailWithCopy({
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

          <h3 style="margin-top: 24px;">Please Note</h3>
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
    userName: v.string(),
    userPhone: v.optional(v.string()),
    enrollments: v.array(
      v.object({
        enrollmentId: v.id("enrollments"),
        enrollmentNumber: v.string(),
        courseName: v.string(),
        courseId: v.id("courses"),
        courseType: v.optional(v.string()),
        startDate: v.string(),
        endDate: v.string(),
        startTime: v.string(),
        endTime: v.string(),
        internshipPlan: v.optional(v.union(v.literal("120"), v.literal("240"))),
        sessions: v.optional(v.number()),
        sessionType: v.optional(
          v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
        ),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Send email
      await sendEmailWithCopy({
        from: "The Mind Point <no-reply@themindpoint.org>",
        to: args.userEmail,
        subject: "Enrollment Confirmation",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4CAF50;">Enrollment Confirmation</h2>
            <p>Dear ${args.userName},</p>
            <p>We are happy to confirm that your payments for the following courses have been successfully received:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Course Name</th>
                  <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Course Type</th>
                  <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Start Date</th>
                  <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">End Date</th>
                  <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Time</th>
                  <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Enrollment No</th>
                </tr>
              </thead>
              <tbody>
                ${args.enrollments
                  .map((e) => {
                    const courseType = e.courseType
                      ? e.courseType.charAt(0).toUpperCase() +
                        e.courseType.slice(1)
                      : "Course";
                    const planInfo = e.internshipPlan
                      ? ` (${e.internshipPlan === "120" ? "2 week" : "4 week"} plan)`
                      : "";
                    const sessionInfo =
                      e.sessions && e.courseType === "therapy"
                        ? ` (${e.sessions} session${e.sessions > 1 ? "s" : ""})`
                        : "";

                    // Add therapy type or session type information
                    let typeInfo = "";
                    if (e.courseType === "therapy") {
                      // Extract therapy type from course name (Spark, Express, Connection)
                      const therapyType = e.courseName.includes("Spark")
                        ? "Spark"
                        : e.courseName.includes("Express")
                          ? "Express"
                          : e.courseName.includes("Connection")
                            ? "Connection"
                            : e.courseName;
                      typeInfo = ` - ${therapyType}`;
                    } else if (e.courseType === "supervised" && e.sessionType) {
                      typeInfo = ` - ${e.sessionType.charAt(0).toUpperCase() + e.sessionType.slice(1)}`;
                    }

                    // Only show enrollment number for non-therapy and non-supervised courses
                    const showEnrollmentNumber =
                      e.courseType !== "therapy" &&
                      e.courseType !== "supervised";

                    return `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${e.courseName}${planInfo}${sessionInfo}${typeInfo}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${courseType}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${e.startDate}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${e.endDate}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${e.startTime} - ${e.endTime}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #2E86C1;">${showEnrollmentNumber ? e.enrollmentNumber : "-"}</td>
                  </tr>
                `;
                  })
                  .join("")}
              </tbody>
            </table>

            <h3 style="margin-top: 24px;">Please Note</h3>
            <ul>
              ${
                args.enrollments.some((e) => e.courseType === "pre-recorded")
                  ? `<li>For pre-recorded courses: Course content material and videos will be sent to you in 2-3 business days of the date of purchase.</li>`
                  : ""
              }
              ${
                args.enrollments.some(
                  (e) =>
                    e.courseType !== "pre-recorded" &&
                    e.courseType !== "therapy" &&
                    e.courseType !== "supervised",
                )
                  ? `<li>For live courses: You will be added to the group a day prior to the course.</li>
              <li>Kindly check your email & WhatsApp for the group link (a week before the course start date).</li>`
                  : ""
              }
              <li>Please provide your WhatsApp number if not provided on <strong>+91 9770780086</strong>.</li>
            </ul>

            <p>If you need any help, please reach out to us at <strong>+91 9770780086</strong>.</p>
            ${
              args.enrollments.some(
                (e) =>
                  e.courseType !== "therapy" && e.courseType !== "supervised",
              )
                ? '<p style="margin-top: 20px;">Please save these enrollment numbers for future reference and access to course materials.</p>'
                : ""
            }
            <p>Thank you for learning with us!</p>
            <br>
            <p>Best regards,<br>The Mind Point Team</p>
          </div>
        `,
      });

      console.log(
        `Cart checkout confirmation email sent successfully to ${args.userEmail}`,
      );
    } catch (error) {
      console.error(
        `Failed to send cart checkout confirmation email to ${args.userEmail}:`,
        error,
      );
      // Don't throw the error to avoid breaking the enrollment process
    }

    return null;
  },
});

export const sendTherapyEnrollmentConfirmation = action({
  args: {
    userEmail: v.string(),
    userName: v.string(),
    userPhone: v.optional(v.string()),
    therapyType: v.string(),
    sessionCount: v.number(),
    enrollmentNumber: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Send email
    await sendEmailWithCopy({
      from: "The Mind Point <no-reply@themindpoint.org>",
      to: args.userEmail,
      subject: "Therapy Session Enrollment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Therapy Session Enrollment Confirmation</h2>
          <p>Dear ${args.userName},</p>
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

// Note: sendSupervisedEnrollmentConfirmation function removed as it was unused
// All supervised enrollments now use sendSupervisedTherapyWelcomeEmail which includes the required checklist PDFs

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
    try {
      // Get the base URL for attachments - use environment variable or fallback to production URL
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://www.themindpoint.org";

      console.log(
        "Sending supervised therapy welcome email to:",
        args.userEmail,
      );
      console.log("Using base URL for attachments:", baseUrl);

      // Fetch the PDF files and convert them to buffers for attachments
      const fetchFile = async (url: string): Promise<Buffer> => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch file from ${url}: ${response.statusText}`,
          );
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      };

      const attachments = await Promise.all([
        {
          filename: "TMP Client Intake Form (1).pdf",
          content: await fetchFile(
            `${baseUrl}/checklist/TMP%20Client%20Intake%20Form%20(1).pdf`,
          ),
        },
        {
          filename:
            "TMP Consent Form for Live Client Session Observation (1).pdf",
          content: await fetchFile(
            `${baseUrl}/checklist/TMP%20Consent%20Form%20for%20Live%20Client%20Session%20Observation%20(1).pdf`,
          ),
        },
        {
          filename: "TMP Session Preparation Template.pdf",
          content: await fetchFile(
            `${baseUrl}/checklist/TMP%20Session%20Preparation%20Template.pdf`,
          ),
        },
        {
          filename: "TMP Supervised Session Self-Preparation Checklist.pdf",
          content: await fetchFile(
            `${baseUrl}/checklist/TMP%20Supervised%20Session%20Self-Preparation%20Checklist.pdf`,
          ),
        },
      ]);

      console.log("Successfully fetched all PDF files for attachments");

      // Send email with attachments
      await sendEmailWithCopy({
        from: "The Mind Point <no-reply@themindpoint.org>",
        to: args.userEmail,
        subject:
          "Supervised Therapy Sessions & Training - Payment Confirmation",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #4CAF50; margin-bottom: 20px;">Supervised Therapy Sessions & Training - Payment Confirmation</h2>
          
          <p>Dear <strong>${args.studentName}</strong>,</p>
          
          <p>We are happy to confirm that your payment for the following supervised session has been successfully received:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Course Name:</strong> Supervised Therapy Sessions & Training</p>
            <p style="margin: 5px 0;"><strong>Course Type:</strong> Supervised</p>
          </div>
          
          <h3 style="color: #2E86C1; margin-top: 30px; margin-bottom: 15px;">Please Note:</h3>
          
          <ul style="margin-left: 20px; margin-bottom: 20px;">
            <li>You will be contacted within 24 to 48 hours by one of our team members to book a convenient slot with you.</li>
            <li>We only work on business days; hence, if you have registered on a Friday or weekend, we will contact you on the next business day.</li>
            <li>Please do not expect any communication on weekends as per our policy.</li>
            <li>Please provide your WhatsApp number for further communication easily on <strong>+91 9770780086</strong>.</li>
          </ul>
          
          <p>If you need any help, please reach out to us at <strong>+91 9770780086</strong>.</p>
          
          <p>Thank you for choosing The Mind Point!</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 0;"><strong>Best regards,</strong><br>
            The Mind Point Team</p>
          </div>
        </div>
      `,
        attachments,
      });

      console.log(
        "Supervised therapy welcome email sent successfully to:",
        args.userEmail,
      );
    } catch (error) {
      console.error("Failed to send supervised therapy welcome email:", error);
      throw error;
    }

    return null;
  },
});

export const sendAlreadyEnrolledNotification = action({
  args: {
    userEmail: v.string(),
    userName: v.string(),
    alreadyEnrolledCourses: v.array(
      v.object({
        courseName: v.string(),
        courseType: v.optional(v.string()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Send email
      await sendEmailWithCopy({
        from: "The Mind Point <no-reply@themindpoint.org>",
        to: args.userEmail,
        subject: "Course Enrollment Status - Already Enrolled",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #FFA500;">Course Enrollment Status</h2>
            <p>Dear ${args.userName},</p>
            <p>Thank you for your interest in our courses! We noticed that you attempted to enroll in the following courses, but you are already enrolled in them:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Course Name</th>
                  <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Course Type</th>
                  <th style="text-align: left; padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${args.alreadyEnrolledCourses
                  .map((course) => {
                    const courseType = course.courseType
                      ? course.courseType.charAt(0).toUpperCase() +
                        course.courseType.slice(1)
                      : "Course";
                    return `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${course.courseName}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${courseType}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; color: #4CAF50; font-weight: bold;">Already Enrolled</td>
                  </tr>
                `;
                  })
                  .join("")}
              </tbody>
            </table>

            <h3 style="margin-top: 24px;">What This Means</h3>
            <ul>
              <li>You are already enrolled in these courses and have access to all course materials.</li>
              <li>No additional charges were made for these courses.</li>
              <li>You can continue with your learning journey as usual.</li>
            </ul>

            <h3 style="margin-top: 24px;">Need Help?</h3>
            <p>If you have any questions about your enrollment status or need assistance with your courses, please contact us at <strong>+91 9770780086</strong>.</p>
            
            <p>Thank you for being part of The Mind Point community!</p>
            <br>
            <p>Best regards,<br>The Mind Point Team</p>
          </div>
        `,
      });

      console.log(
        `Already enrolled notification email sent successfully to ${args.userEmail}`,
      );
    } catch (error) {
      console.error(
        `Failed to send already enrolled notification email to ${args.userEmail}:`,
        error,
      );
      // Don't throw the error to avoid breaking the enrollment process
    }

    return null;
  },
});
