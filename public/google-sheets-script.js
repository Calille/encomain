/**
 * Google Apps Script to connect form submissions to Google Sheets
 *
 * Instructions:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace the content with this script
 * 4. Deploy as a web app (Execute as: Me, Who has access: Anyone)
 * 5. Copy the web app URL and use it in your googleSheets.ts file
 */

const SHEET_NAME = "Form Submissions";

function doGet(e) {
  return HtmlService.createHtmlOutput("The form submission API is working!");
}

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000); // Wait 10 seconds for other processes to finish

    const sheet = getOrCreateSheet();
    const headers = getHeaders(sheet);
    const data = processFormData(e.parameter, headers);

    // Add timestamp if not provided
    if (!data.includes(new Date().toISOString())) {
      data.push(new Date().toISOString());
    }

    // Append the data to the sheet
    sheet.appendRow(data);

    lock.releaseLock();
    return ContentService.createTextOutput(JSON.stringify({ success: true }));
  } catch (error) {
    console.error("Error processing form submission:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      }),
    );
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Set up default headers
    sheet.appendRow([
      "Name",
      "Email",
      "Phone",
      "Company",
      "Website",
      "Message",
      "Business Type",
      "Page Count",
      "Features",
      "Estimated Cost",
      "Source",
      "Timestamp",
    ]);

    // Format the header row
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold");
  }

  return sheet;
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function processFormData(formData, headers) {
  const data = [];

  // Map form data to columns based on headers
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    let value = "";

    // Look for the form field that matches the header
    Object.keys(formData).forEach((key) => {
      if (key.toLowerCase() === header) {
        value = formData[key];
      }
    });

    data.push(value);
  }

  return data;
}
