/**
 * Email service utility for sending form submissions via email
 * Uses FormSubmit.co as a free email forwarding service
 */

type FormData = {
  name: string;
  email: string;
  message: string;
  [key: string]: any;
};

/**
 * Sends an email notification with form data
 * @param formData - The form data to send via email
 * @returns Promise with the result of the email submission
 */
export async function sendEmailNotification(
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    // Use FormSubmit.co to send the email (free service, no API key required)
    const response = await fetch('https://formsubmit.co/ajax/hello@theenclosure.co.uk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        _subject: "New Contact Form Submission - The Enclosure",
        // Additional metadata to include in the email
        timestamp: formData.timestamp || new Date().toISOString(),
        source: formData.source || "Website Contact Form",
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return { success: true, message: "Email sent successfully!" };
    } else {
      throw new Error(result.message || "Failed to send email");
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
    return {
      success: false,
      message: "Failed to send email notification.",
    };
  }
} 