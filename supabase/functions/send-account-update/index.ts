/**
 * Send Account Update Notification Email Edge Function
 * Triggered when user updates account details
 * 
 * Subject: Your account has been updated
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderAccountUpdateEmail, AccountUpdateEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.email || !body.updatedFields || !body.updatedAt) {
      return new Response(
        JSON.stringify({ error: 'Email, updatedFields, and updatedAt are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || 'there';
    const accountSettingsUrl = body.accountSettingsUrl || 'https://theenclosure.co.uk/settings';

    // Render email template
    const emailHtml = renderAccountUpdateEmail({
      userName,
      updatedFields: body.updatedFields,
      updatedAt: body.updatedAt,
      settingsUrl: accountSettingsUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.email,
      subject: 'Your account has been updated',
      html: emailHtml,
      from: 'The Enclosure <notifications@theenclosure.co.uk>',
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
    console.error('Error in send-account-update:', error);
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
