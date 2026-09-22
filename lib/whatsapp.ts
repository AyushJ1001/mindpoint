// WhatsApp service utility for automated messaging

export interface WhatsAppMessage {
  phone: string;
  message: string;
  enrollmentNumber?: string;
  courseName?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

export class WhatsAppService {
  private static instance: WhatsAppService;

  private constructor() {}

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Automated WhatsApp delivery is intentionally disabled until Mind Point has
   * an approved provider, consent, template, withdrawal, and audit workflow.
   */
  async sendMessage(_message: WhatsAppMessage): Promise<boolean> {
    return false;
  }

  /**
   * Generate course enrollment message
   */
  generateCourseEnrollmentMessage(data: {
    phone: string;
    courseName: string;
    enrollmentNumber: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  }): WhatsAppMessage {
    const message = `🎓 *Enrollment Confirmation - The Mind Point*

Dear Learner,

Your payment for the course *${data.courseName}* has been successfully received.

*Course Details:*
• Course: ${data.courseName}
• Start Date: ${data.startDate}
• End Date: ${data.endDate}
• Time: ${data.startTime} - ${data.endTime}
• Enrollment No: *${data.enrollmentNumber === "N/A" ? "Not Applicable" : data.enrollmentNumber}*

*Important Notes:*
• You will be added to the group a day prior to the course
• Check your email & WhatsApp for the group link (a week before course start)
• Provide your WhatsApp number if not provided on +91 9770780086

For any help, contact us at +91 9770780086

Thank you for choosing us. We wish you a great learning experience!

Best regards,
The Mind Point Team`;

    return {
      phone: data.phone,
      message,
      enrollmentNumber: data.enrollmentNumber,
      courseName: data.courseName,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
    };
  }

  /**
   * Generate therapy enrollment message
   */
  generateTherapyEnrollmentMessage(data: {
    phone: string;
    therapyType: string;
    sessionCount: number;
    enrollmentNumber: string;
  }): WhatsAppMessage {
    const message = `💙 *Therapy Session Enrollment Confirmation - The Mind Point*

Dear Client,

We are pleased to confirm your enrollment for *${data.therapyType}* therapy sessions.

*Session Details:*
• Therapy Type: ${data.therapyType}
• Number of Sessions: ${data.sessionCount}

*Next Steps:*
• Your assigned therapist will contact you within 24-48 hours
• Sessions will be conducted online via secure video conferencing
• Ensure you have a quiet, private space for your sessions
• Your therapist will provide session links and preparation materials

For questions or rescheduling, contact us at +91 9770780086

Thank you for choosing The Mind Point for your therapy journey.

Best regards,
The Mind Point Therapy Team`;

    return {
      phone: data.phone,
      message,
      enrollmentNumber: data.enrollmentNumber,
    };
  }

  /**
   * Generate supervised session enrollment message
   */
  generateSupervisedEnrollmentMessage(data: {
    phone: string;
    supervisionPackage: string;
    sessionCount: number;
    enrollmentNumber: string;
  }): WhatsAppMessage {
    const message = `👨‍🏫 *Supervised Session Enrollment Confirmation - The Mind Point*

Dear Trainee,

We are pleased to confirm your enrollment for *${data.supervisionPackage}* supervised sessions.

*Supervision Details:*
• Supervision Package: ${data.supervisionPackage}
• Number of Sessions: ${data.sessionCount}

*Next Steps:*
• Your supervisor will contact you within 24-48 hours
• All sessions will be conducted online via Google Meet
• You will receive preparation materials and templates
• Ensure you have a quiet environment and necessary materials ready

For questions or rescheduling, contact us at +91 9770780086

Thank you for choosing The Mind Point for your professional development.

Best regards,
The Mind Point Supervision Team`;

    return {
      phone: data.phone,
      message,
      enrollmentNumber: data.enrollmentNumber,
    };
  }
}

export const whatsappService = WhatsAppService.getInstance();
