/**
 * Send Welcome Email Edge Function
 * Triggered after user verifies their email
 * 
 * Subject: Welcome to The Enclosure!
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderWelcomeEmail } from '../_shared/email-templates.ts';

interface RequestBody {
  email: string;
  userName?: string;
  loginUrl?: string;
  dashboardUrl?: string;
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Safely parse JSON body
    let body: RequestBody;
    try {
      const bodyText = await req.text();
      if (!bodyText || bodyText.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Request body is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      body = JSON.parse(bodyText);
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!body.email) {
      return new Response(
        JSON.stringify({ error: 'Email address is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || 'there';
    const loginUrl = body.loginUrl || 'https://theenclosure.co.uk/login';
    const dashboardUrl = body.dashboardUrl || 'https://theenclosure.co.uk/dashboard';

    // Render email HTML
    const emailHtml = renderWelcomeEmail({
      userName,
      loginUrl,
      dashboardUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.email,
      subject: 'Welcome to The Enclosure!',
      html: emailHtml,
      from: 'The Enclosure <hello@theenclosure.co.uk>',
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || 'Failed to send email' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messageId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-welcome-email:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
