/**
 * Send System Error Notification Email Edge Function (Admin)
 * Triggered for critical system errors
 * 
 * Subject: [Severity] System Error Alert: [Error Type]
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderSystemErrorEmail, SystemErrorEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.adminEmail || !body.errorType || !body.errorMessage || !body.timestamp || !body.severity || !body.adminDashboardUrl) {
      return new Response(
        JSON.stringify({ error: 'adminEmail, errorType, errorMessage, timestamp, severity, and adminDashboardUrl are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const adminName = body.adminName || 'Admin';

    // Render email template
    const emailHtml = renderSystemErrorEmail({
      adminName,
      errorType: body.errorType,
      errorMessage: body.errorMessage,
      timestamp: body.timestamp,
      severity: body.severity,
      context: body.context,
      adminDashboardUrl: body.adminDashboardUrl,
    });

    // Send email
    const severityLabels: Record<string, string> = {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    };

    const result = await sendEmail({
      to: body.adminEmail,
      subject: `${severityLabels[body.severity] || body.severity} System Error Alert: ${body.errorType}`,
      html: emailHtml,
      from: 'The Enclosure <admin@theenclosure.co.uk>',
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
    console.error('Error in send-system-error:', error);
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
