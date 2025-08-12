# WhatsApp Automation Setup Guide

## Overview

The Mind Point app now includes automated WhatsApp messaging that sends enrollment confirmations alongside emails. This feature automatically notifies users via WhatsApp when they enroll in courses, therapy sessions, or supervised sessions.

## How It Works

1. **Automatic Triggering**: When a user completes enrollment, the system automatically sends both an email and a WhatsApp message (if phone number is provided)
2. **Message Content**: WhatsApp messages contain the same information as emails - enrollment details, course/session information, and next steps
3. **Professional Formatting**: Messages use WhatsApp's markdown formatting for better readability

## Current Implementation

### Message Types

1. **Course Enrollment Messages**
   - Sent when users enroll in certificate courses, diplomas, internships, etc.
   - Includes course name, dates, times, and enrollment number

2. **Therapy Session Messages**
   - Sent when users book therapy/counselling sessions
   - Includes therapy type, session count, and enrollment number

3. **Supervised Session Messages**
   - Sent when users enroll in supervised therapy sessions
   - Includes supervision package, session count, and enrollment number

### Message Format

All WhatsApp messages follow this structure:

```
🎓 *Enrollment Confirmation - The Mind Point*

Dear [Learner/Client/Trainee],

[Enrollment confirmation details]

*[Service] Details:*
• [Key information points]

*Important Notes:*
• [Next steps and instructions]

For any help, contact us at +91 9770780086

Thank you for choosing us!

Best regards,
The Mind Point Team
```

## Setup Instructions

### 1. Environment Variables

Add the following environment variable to your `.env` file:

```bash
WHATSAPP_API_KEY=your_whatsapp_api_key_here
```

### 2. WhatsApp API Provider

You need to choose and integrate with a WhatsApp Business API provider. Popular options include:

#### Option A: Twilio WhatsApp API

```bash
npm install twilio
```

#### Option B: MessageBird WhatsApp API

```bash
npm install messagebird
```

#### Option C: WhatsApp Business API (Meta)

- Requires business verification with Meta
- More complex setup but official solution

### 3. Update WhatsApp Service

Replace the placeholder implementation in `lib/whatsapp.ts` with your chosen provider:

#### Example with Twilio:

```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async sendMessage(message: WhatsAppMessage): Promise<boolean> {
  try {
    const formattedPhone = message.phone.replace(/\D/g, '');
    const phoneWithCountryCode = formattedPhone.startsWith('91')
      ? formattedPhone
      : `91${formattedPhone}`;

    await client.messages.create({
      body: message.message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:+${phoneWithCountryCode}`
    });

    return true;
  } catch (error) {
    console.error('WhatsApp message sending failed:', error);
    return false;
  }
}
```

#### Example with MessageBird:

```typescript
import messagebird from 'messagebird';

const client = messagebird(process.env.MESSAGEBIRD_API_KEY);

async sendMessage(message: WhatsAppMessage): Promise<boolean> {
  try {
    const formattedPhone = message.phone.replace(/\D/g, '');
    const phoneWithCountryCode = formattedPhone.startsWith('91')
      ? formattedPhone
      : `91${formattedPhone}`;

    await client.conversations.send({
      to: `+${phoneWithCountryCode}`,
      type: 'text',
      content: {
        text: message.message
      },
      channelId: process.env.MESSAGEBIRD_WHATSAPP_CHANNEL_ID
    });

    return true;
  } catch (error) {
    console.error('WhatsApp message sending failed:', error);
    return false;
  }
}
```

### 4. Phone Number Collection

To enable WhatsApp messaging, you need to collect user phone numbers during enrollment. Update your enrollment forms to include phone number fields.

### 5. Testing

1. **Test with a single enrollment**: Enroll in a course with a valid phone number
2. **Check logs**: Verify that WhatsApp messages are being generated and sent
3. **Monitor delivery**: Ensure messages are being delivered to the correct numbers

## Message Templates

### Course Enrollment Template

```
🎓 *Enrollment Confirmation - The Mind Point*

Dear Learner,

Your payment for the course *[Course Name]* has been successfully received.

*Course Details:*
• Course: [Course Name]
• Start Date: [Start Date]
• End Date: [End Date]
• Time: [Start Time] - [End Time]
• Enrollment No: *[Enrollment Number]*

*Important Notes:*
• You will be added to the group a day prior to the course
• Check your email & WhatsApp for the group link (a week before course start)
• Provide your WhatsApp number if not provided on +91 9770780086

For any help, contact us at +91 9770780086

Thank you for choosing us. We wish you a great learning experience!

Best regards,
The Mind Point Team
```

### Therapy Session Template

```
💙 *Therapy Session Enrollment Confirmation - The Mind Point*

Dear Client,

We are pleased to confirm your enrollment for *[Therapy Type]* therapy sessions.

*Session Details:*
• Therapy Type: [Therapy Type]
• Number of Sessions: [Session Count]
• Enrollment No: *[Enrollment Number]*

*Next Steps:*
• Your assigned therapist will contact you within 24-48 hours
• Sessions will be conducted online via secure video conferencing
• Ensure you have a quiet, private space for your sessions
• Your therapist will provide session links and preparation materials

For questions or rescheduling, contact us at +91 9770780086

Thank you for choosing The Mind Point for your therapy journey.

Best regards,
The Mind Point Therapy Team
```

### Supervised Session Template

```
👨‍🏫 *Supervised Session Enrollment Confirmation - The Mind Point*

Dear Trainee,

We are pleased to confirm your enrollment for *[Supervision Package]* supervised sessions.

*Supervision Details:*
• Supervision Package: [Supervision Package]
• Number of Sessions: [Session Count]
• Enrollment No: *[Enrollment Number]*

*Next Steps:*
• Your supervisor will contact you within 24-48 hours
• All sessions will be conducted online via Google Meet
• You will receive preparation materials and templates
• Ensure you have a quiet environment and necessary materials ready

For questions or rescheduling, contact us at +91 9770780086

Thank you for choosing The Mind Point for your professional development.

Best regards,
The Mind Point Supervision Team
```

## Troubleshooting

### Common Issues

1. **Messages not sending**: Check API credentials and phone number format
2. **Wrong phone numbers**: Ensure proper country code formatting (+91 for India)
3. **Message delivery failures**: Verify WhatsApp Business API setup
4. **Rate limiting**: Implement proper rate limiting for API calls

### Debugging

1. Check server logs for WhatsApp API errors
2. Verify phone number format in the database
3. Test API credentials separately
4. Monitor message delivery status

## Security Considerations

1. **Phone Number Privacy**: Ensure phone numbers are stored securely
2. **API Key Security**: Never expose API keys in client-side code
3. **Message Content**: Avoid sending sensitive information via WhatsApp
4. **Rate Limiting**: Implement proper rate limiting to prevent abuse

## Future Enhancements

1. **Message Templates**: Add more customizable message templates
2. **Scheduled Messages**: Implement scheduled reminders for sessions
3. **Bulk Messaging**: Add support for bulk messaging to multiple users
4. **Message Status Tracking**: Track message delivery and read status
5. **Rich Media**: Support for images, documents, and other media types

## Support

For technical support with WhatsApp automation setup, contact the development team or refer to your chosen WhatsApp API provider's documentation.
