// Google Sheets API integration utility

/**
 * Sends form data to Google Sheets
 * @param formData - The form data to send to Google Sheets
 * @returns Promise with the result of the submission
 */
export async function sendToGoogleSheets(
  formData: Record<string, any>,
): Promise<{ success: boolean; message: string }> {
  try {
    // Google Sheets API endpoint (using Google Apps Script Web App URL)
    const sheetsApiUrl =
      "https://script.google.com/macros/s/AKfycbzQb7xdgbUUGj-NxRWFCnFZPKqrgfS_4nB1G7J-LPPbm9qZa4nXYniQZ_5vBBuqxGGJ/exec";

    // Format the data for Google Sheets
    const formattedData = new FormData();

    // Add all form fields to the FormData
    Object.keys(formData).forEach((key) => {
      formattedData.append(key, formData[key]);
    });

    // Add timestamp if not already present
    if (!formData.timestamp) {
      formattedData.append("timestamp", new Date().toISOString());
    }

    // Add source if not already present
    if (!formData.source) {
      formattedData.append("source", "Website Form");
    }

    // Send the data to Google Sheets
    const response = await fetch(sheetsApiUrl, {
      method: "POST",
      body: formattedData,
      mode: "no-cors", // This is required for Google Apps Script
    });

    // Since no-cors mode doesn't allow us to read the response,
    // we assume success if no error is thrown
    return { success: true, message: "Form submitted successfully!" };
  } catch (error) {
    console.error("Error submitting form to Google Sheets:", error);
    // Backup the data automatically
    backupFormData(formData);
    return {
      success: false,
      message:
        "Failed to submit form. We've saved your data and will try again later.",
    };
  }
}

/**
 * Backup form data to local storage in case the Google Sheets submission fails
 * @param formData - The form data to backup
 */
export function backupFormData(formData: Record<string, any>): void {
  try {
    // Get existing backups
    const existingBackups = localStorage.getItem("formBackups");
    const backups = existingBackups ? JSON.parse(existingBackups) : [];

    // Add new backup with timestamp
    const backup = {
      ...formData,
      timestamp: formData.timestamp || new Date().toISOString(),
      id: Date.now(),
    };

    backups.push(backup);

    // Store updated backups
    localStorage.setItem("formBackups", JSON.stringify(backups));
    console.log("Form data backed up to localStorage");
  } catch (error) {
    console.error("Error backing up form data:", error);
  }
}

/**
 * Retry sending backed up form submissions
 * @returns Promise with the number of successfully retried submissions
 */
export async function retryBackedUpSubmissions(): Promise<number> {
  try {
    // Get existing backups
    const existingBackups = localStorage.getItem("formBackups");
    if (!existingBackups) return 0;

    const backups = JSON.parse(existingBackups);
    if (!backups.length) return 0;

    console.log(`Attempting to retry ${backups.length} backed up submissions`);

    let successCount = 0;
    const remainingBackups = [];

    // Try to send each backup
    for (const backup of backups) {
      const { id, ...formData } = backup;
      const result = await sendToGoogleSheets(formData);

      if (result.success) {
        successCount++;
        console.log(`Successfully retried submission ${id}`);
      } else {
        remainingBackups.push(backup);
        console.log(`Failed to retry submission ${id}`);
      }
    }

    // Update localStorage with remaining backups
    localStorage.setItem("formBackups", JSON.stringify(remainingBackups));
    console.log(
      `Retried ${successCount} submissions, ${remainingBackups.length} remaining`,
    );

    return successCount;
  } catch (error) {
    console.error("Error retrying backed up submissions:", error);
    return 0;
  }
}

/**
 * Initialize the Google Sheets integration by attempting to retry any backed up submissions
 * and setting up an interval to retry periodically
 */
export function initGoogleSheetsIntegration(): void {
  // Try to retry backed up submissions on page load
  window.addEventListener("load", () => {
    setTimeout(() => {
      retryBackedUpSubmissions();
    }, 3000); // Wait 3 seconds after page load to avoid competing with other initialization tasks
  });

  // Set up an interval to retry backed up submissions periodically
  setInterval(
    () => {
      retryBackedUpSubmissions();
    },
    5 * 60 * 1000,
  ); // Every 5 minutes
}
