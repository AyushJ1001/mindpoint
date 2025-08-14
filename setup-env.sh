#!/bin/bash

# Setup script for Google Sheets integration environment variables
# Run this script to set up local development environment

echo "🔧 Setting up Google Sheets integration environment variables..."

# Check if .secrets directory exists
if [ ! -d ".secrets" ]; then
    echo "❌ .secrets directory not found!"
    echo "Please create .secrets directory and place your Google service account JSON file there."
    exit 1
fi

# Find the JSON file in .secrets directory
JSON_FILE=$(find .secrets -name "*.json" | head -n 1)

if [ -z "$JSON_FILE" ]; then
    echo "❌ No JSON file found in .secrets directory!"
    echo "Please place your Google service account JSON file in the .secrets directory."
    exit 1
fi

echo "✅ Found JSON file: $JSON_FILE"

# Set environment variables
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/$JSON_FILE"

echo "✅ Set GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS"

# Check if spreadsheet ID is provided
if [ -z "$GOOGLE_SHEETS_SPREADSHEET_ID" ]; then
    echo "⚠️  GOOGLE_SHEETS_SPREADSHEET_ID not set"
    echo "Please set this environment variable with your Google Sheets spreadsheet ID"
    echo "Example: export GOOGLE_SHEETS_SPREADSHEET_ID='your_spreadsheet_id_here'"
fi

# Check if sheet name is provided
if [ -z "$GOOGLE_SHEETS_SHEET_NAME" ]; then
echo "⚠️  GOOGLE_SHEETS_SHEET_NAME not set, using default 'Sheet1'"
export GOOGLE_SHEETS_SHEET_NAME="Sheet1"
fi

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "📋 Summary:"
echo "   GOOGLE_APPLICATION_CREDENTIALS: $GOOGLE_APPLICATION_CREDENTIALS"
echo "   GOOGLE_SHEETS_SPREADSHEET_ID: ${GOOGLE_SHEETS_SPREADSHEET_ID:-'NOT SET'}"
echo "   GOOGLE_SHEETS_SHEET_NAME: ${GOOGLE_SHEETS_SHEET_NAME:-'Sheet1'}"
echo ""
echo "💡 To make these permanent, add them to your shell profile (.bashrc, .zshrc, etc.)"
echo "💡 For production, set these in your Convex dashboard under Settings > Environment Variables"
