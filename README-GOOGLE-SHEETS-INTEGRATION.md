# Google Sheets Integration for The Enclosure Website

## Overview
This document provides instructions for setting up the Google Sheets integration for form submissions on The Enclosure website. This integration allows all form submissions to be automatically recorded in a Google Sheet for lead tracking and management.

## Setup Instructions

### 1. Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name the spreadsheet "The Enclosure - Form Submissions"

### 2. Set Up Google Apps Script
1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any code in the editor and paste the contents of `public/google-sheets-script.js` from this repository
3. Save the project with a name like "Form Submission Handler"

### 3. Deploy the Web App
1. Click on **Deploy > New deployment**
2. Select **Web app** as the deployment type
3. Configure the following settings:
   - Description: "Form Submission Handler"
   - Execute as: "Me" (your Google account)
   - Who has access: "Anyone"
4. Click **Deploy**
5. Copy the Web app URL that is provided after deployment

### 4. Update the Website Code
1. Open `src/utils/googleSheets.ts` in your code editor
2. Replace the placeholder URL in the `sheetsApiUrl` variable with your actual Google Apps Script web app URL:
   ```typescript
   const sheetsApiUrl = "https://script.google.com/macros/s/YOUR_GOOGLE_SCRIPT_ID/exec";
   ```
   Replace `YOUR_GOOGLE_SCRIPT_ID` with the actual ID from your deployed web app URL

## Testing the Integration

1. Deploy your website or run it locally
2. Submit a test form (contact form, cost calculator form, etc.)
3. Check your Google Sheet to verify that the submission was recorded
4. If the submission doesn't appear, check the browser console for any errors

## Troubleshooting

### Form Submissions Not Appearing in Google Sheet
- Verify that the web app URL in `googleSheets.ts` is correct
- Check browser console for any CORS-related errors
- Ensure the Google Apps Script is deployed with the correct permissions

### Error Handling
- The integration includes a backup mechanism that stores form submissions in localStorage if the Google Sheets submission fails
- These backed-up submissions will be automatically retried when the user visits the site again

## Security Considerations

- The Google Apps Script is configured to accept requests from any origin
- Consider implementing additional security measures for production use, such as:
  - Adding CORS restrictions
  - Implementing a server-side proxy
  - Adding form validation on the server side

## Data Fields

The following data fields are captured for each form submission:

- Name
- Email
- Phone (if provided)
- Company (if provided)
- Website (if provided)
- Message
- Business Type (from cost calculator)
- Page Count (from cost calculator)
- Features (from cost calculator)
- Estimated Cost (from cost calculator)
- Source (which form was used)
- Timestamp

## Maintenance

- Periodically check the Google Sheet to ensure it's not getting too large
- Consider setting up automated email notifications for new submissions
- Review and update the integration as needed when the website is updated
