# Supervised Course Email Strategy

## Overview

This document explains how email notifications work for supervised learning courses and the checklist PDF attachments.

## Email Strategy

### Single Supervised Course Enrollment

When a user enrolls in a single supervised course:

- **Email Sent**: `sendSupervisedTherapyWelcomeEmail`
- **Attachments**: ✅ 4 checklist PDFs included
- **Content**: Welcome message with session details and next steps

### Multiple Course Enrollment (Including Supervised)

When a user purchases multiple courses including supervised courses:

- **Supervised Courses**: Separate `sendSupervisedTherapyWelcomeEmail` for each supervised course
  - ✅ Includes 4 checklist PDFs as attachments
  - ✅ Personalized welcome message
- **Other Courses**: Single `sendCartCheckoutConfirmation` for all non-supervised courses
  - ❌ No attachments (not needed for regular courses)
  - ✅ Summary table of all enrollments

## Checklist PDFs Included

The following 4 PDF files are automatically attached to supervised course emails:

1. **TMP Client Intake Form.pdf** - Client intake form for supervised sessions
2. **TMP Consent Form for Live Client Session Observation.pdf** - Consent form for live session observation
3. **TMP Session Preparation Template.pdf** - Template for session preparation
4. **TMP Supervised Session Self-Preparation Checklist.pdf** - Self-preparation checklist

## File Locations

- **Source Files**: `public/checklist/`
- **Email URLs**: `${baseUrl}/checklist/` (where baseUrl is from `NEXT_PUBLIC_SITE_URL` environment variable or defaults to `https://www.themindpoint.org`)
- **Attachment Method**: Files are fetched from URLs and converted to buffers for email attachment

## Implementation Details

### Email Functions Used

- `sendSupervisedTherapyWelcomeEmail` - Main function for supervised courses with attachments
- `sendCartCheckoutConfirmation` - For regular courses without attachments

### Enrollment Functions

- `handleSupervisedTherapyEnrollment` - Single supervised enrollment
- `handleGuestUserSupervisedTherapyEnrollment` - Guest user supervised enrollment
- `handleCartCheckout` - Multiple course checkout (includes supervised logic)
- `handleGuestUserCartCheckoutWithData` - Guest user multiple course checkout

### Environment Variables

- `NEXT_PUBLIC_SITE_URL` - Base URL for PDF attachments (optional, defaults to production URL)

## Benefits of This Strategy

1. **Separate Emails**: Supervised courses get dedicated emails with proper attachments
2. **No Duplication**: Regular courses don't receive unnecessary attachments
3. **Clear Communication**: Each email type serves its specific purpose
4. **Scalable**: Works for any combination of course types
5. **Multiple Enrollments**: Users can enroll multiple times for therapy and supervised sessions

## Enrollment Rules

- **Certificate/Diploma/Internship Courses**: Users can only enroll once per course
- **Therapy Sessions**: Users can enroll multiple times (book multiple sessions)
- **Supervised Sessions**: Users can enroll multiple times (book multiple supervision packages)

## Testing

To test the email functionality:

1. Enroll in a supervised course and check for the welcome email with 4 PDF attachments
2. Purchase multiple courses including supervised and verify separate emails are sent
3. Verify PDF attachments are accessible and downloadable
