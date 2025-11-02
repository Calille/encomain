/**
 * Shared Email Service for Supabase Edge Functions
 * Handles email sending via Resend with error handling and logging
 */
import { Resend } from 'npm:resend@4.0.0';
import { render } from 'npm:@react-email/components@0.0.28';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const resend = new Resend(RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(
  options: EmailOptions
): Promise<EmailResponse> {
  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return {
        success: false,
        error: 'RESEND_API_KEY environment variable is not configured',
      };
    }

    // Set default from address
    const from = options.from || 'The Enclosure <notifications@theenclosure.co.uk>';

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    console.log('Email sent successfully:', data?.id);
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Render a React Email component to HTML string
 */
export async function renderEmailTemplate(
  component: React.ReactElement
): Promise<string> {
  try {
    const html = await render(component);
    return html;
  } catch (error) {
    console.error('Error rendering email template:', error);
    throw new Error('Failed to render email template');
  }
}

/**
 * CORS headers for Edge Function responses
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Handle CORS preflight requests
 */
export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

