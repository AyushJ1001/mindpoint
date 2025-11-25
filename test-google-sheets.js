// Test script for Google Sheets integration
// Run this after setting up the Google Sheets integration

// Load environment variables from .env.local
require('dotenv').config({ path: '.env' });

const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function testGoogleSheetsIntegration() {
  try {
    console.log("🔧 Testing Google Sheets integration...");
    
    // Check if required environment variables are set
    if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID environment variable is not set");
    }
    
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set");
    }
    
    console.log("✅ Environment variables loaded successfully");
    console.log(`📊 Spreadsheet ID: ${process.env.GOOGLE_SHEETS_SPREADSHEET_ID}`);
    console.log(`🔑 Credentials: JSON credentials loaded (${process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.length} characters)`);
    
    // Test 1: Setup sheet headers
    console.log("\n1. Setting up sheet headers...");
    await convex.action(api.myFunctions.setupEnrollmentGoogleSheet, {
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      sheetName: "NEW ENROLLMENT" // Use the default sheet name
    });
    console.log("✅ Sheet headers setup completed");
    
    // Test 2: Test adding enrollment data
    console.log("\n2. Testing enrollment data addition...");
    await convex.action(api.googleSheets.addEnrollmentToSheet, {
      enrollmentData: {
        userId: "test-user-123",
        userName: "Test User",
        userEmail: "test@example.com",
        userPhone: "+1234567890",
        courseId: "test-course-123",
        courseName: "Test Course",
        enrollmentNumber: "TMP-TEST-1224-123456",
        isGuestUser: false,
        sessionType: "focus",
        courseType: "therapy",
        internshipPlan: undefined,
        sessions: 10,
        enrollmentDate: new Date().toISOString(),
      },
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      sheetName: "Sheet1" // Use the default sheet name
    });
    console.log("✅ Test enrollment data added successfully");
    
    console.log("\n🎉 All tests passed! Google Sheets integration is working correctly.");
    console.log("📋 Check your Google Sheet to see the test data.");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("1. Make sure you have set up Google Cloud Project with Sheets API enabled");
    console.error("2. Created a service account and downloaded the JSON key");
    console.error("3. Created a Google Sheet and shared it with the service account");
    console.error("4. Set the environment variables in .env:");
    console.error("   - GOOGLE_SHEETS_SPREADSHEET_ID");
    console.error("   - GOOGLE_APPLICATION_CREDENTIALS_JSON");
    console.error("\n💡 Run './setup-env.sh' to configure environment variables");
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testGoogleSheetsIntegration();
}

module.exports = { testGoogleSheetsIntegration };
