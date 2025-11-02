/**
 * Send Re-engagement Email Edge Function
 * Triggered for inactive users
 * 
 * Subject: We Miss You! - Come Back to The Enclosure
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderReengagementEmail, ReengagementEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.email || !body.daysSinceLastActivity || !body.dashboardUrl || !body.unsubscribeUrl) {
      return new Response(
        JSON.stringify({ error: 'Email, daysSinceLastActivity, dashboardUrl, and unsubscribeUrl are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || 'there';

    // Render email template
    const emailHtml = renderReengagementEmail({
      userName,
      lastActivityDate: body.lastActivityDate,
      daysSinceLastActivity: body.daysSinceLastActivity,
      dashboardUrl: body.dashboardUrl,
      unsubscribeUrl: body.unsubscribeUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.email,
      subject: 'We Miss You! - Come Back to The Enclosure',
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
    console.error('Error in send-reengagement:', error);
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
