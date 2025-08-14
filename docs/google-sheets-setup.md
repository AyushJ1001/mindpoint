# Google Sheets Integration Setup

This document explains how to set up Google Sheets integration for automatically tracking enrollments.

## Overview

When a new enrollment is created in the database (any instance), the system will automatically add a row to a Google Sheet with the enrollment details.

## Prerequisites

1. **Google Cloud Project**: You need a Google Cloud Project with the Google Sheets API enabled
2. **Service Account**: A service account with access to Google Sheets
3. **Google Sheet**: A Google Sheet where enrollment data will be stored

## Setup Steps

### 1. Enable Google Sheets API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Library"
4. Search for "Google Sheets API"
5. Click on it and press "Enable"

### 2. Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `mindpoint-enrollments`
   - Description: `Service account for MindPoint enrollment tracking`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 3. Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Choose "JSON" format
5. Download the JSON file
6. **Important**: Keep this file secure and never commit it to version control

### 4. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it something like "MindPoint Enrollments"
4. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

### 5. Share the Sheet with Service Account

1. In your Google Sheet, click "Share"
2. Add the service account email (found in the JSON file) with "Editor" permissions
3. The email will look like: `mindpoint-enrollments@your-project.iam.gserviceaccount.com`

### 6. Configure Environment Variables

#### For Local Development:

Run the setup script to configure local environment variables:

```bash
# Make sure you're in the project root directory
./setup-env.sh

# Set your spreadsheet ID
export GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
```

#### For Production (Convex Dashboard):

Add the following environment variables to your Convex deployment:

```bash
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project",...}
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_SHEET_NAME=Sheet1
```

**Note**: For production, you need to copy the entire JSON content from your service account key file and set it as the `GOOGLE_APPLICATION_CREDENTIALS_JSON` environment variable.

### 7. Set up the Sheet Headers

After deployment, you can set up the sheet headers by calling the setup function:

```typescript
// In your Convex dashboard or through the API
await convex.action(api.myFunctions.setupEnrollmentGoogleSheet, {
  spreadsheetId: "your_spreadsheet_id_here",
  sheetName: "Sheet1", // optional, defaults to "Sheet1"
});
```

## Sheet Structure

The Google Sheet will have the following columns:

| Column | Description         |
| ------ | ------------------- |
| A      | Enrollment Number   |
| B      | Student Name        |
| C      | Email               |
| D      | Phone               |
| E      | Course Name         |
| F      | Course Type         |
| G      | Session Type        |
| H      | Internship Plan     |
| I      | Sessions            |
| J      | Guest User          |
| K      | Enrollment Date     |
| L      | Added to Sheet Date |

## Data Flow

1. When a user enrolls in a course, the enrollment is created in the Convex database
2. The system automatically schedules a Google Sheets action to add the enrollment data
3. The action runs asynchronously and adds a new row to the specified Google Sheet
4. If the Google Sheets integration fails, it won't affect the enrollment process (graceful degradation)

## Troubleshooting

### Common Issues

1. **"Google Sheets spreadsheet ID not configured"**
   - Make sure `GOOGLE_SHEETS_SPREADSHEET_ID` is set in your environment variables

2. **"Sheet not found"**
   - Verify the sheet name exists in your spreadsheet
   - Check that the service account has access to the sheet

3. **Authentication errors**
   - Ensure the service account JSON file is properly configured
   - Verify the service account has the necessary permissions

4. **API quota exceeded**
   - Google Sheets API has rate limits
   - Consider implementing retry logic for high-volume scenarios

### Testing

You can test the integration by:

1. Creating a test enrollment through your application
2. Checking the Google Sheet for the new row
3. Verifying all data is correctly formatted

## Security Considerations

1. **Service Account Key**: Keep the JSON key file secure and never expose it publicly
2. **Sheet Permissions**: Only give the service account the minimum required permissions
3. **Data Privacy**: Ensure the Google Sheet is only accessible to authorized personnel
4. **Environment Variables**: Use secure methods to store sensitive configuration

## Monitoring

Monitor the integration by:

1. Checking Convex logs for Google Sheets related errors
2. Verifying data consistency between the database and Google Sheets
3. Setting up alerts for failed Google Sheets operations

## Future Enhancements

Potential improvements to consider:

1. **Retry Logic**: Implement automatic retries for failed Google Sheets operations
2. **Batch Operations**: Group multiple enrollments into single Google Sheets operations
3. **Data Validation**: Add validation before sending data to Google Sheets
4. **Backup Strategy**: Implement backup mechanisms for Google Sheets data
5. **Real-time Sync**: Consider using Google Sheets API webhooks for real-time updates
