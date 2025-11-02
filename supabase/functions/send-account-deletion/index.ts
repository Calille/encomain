/**
 * Send Account Deletion Confirmation Email Edge Function
 * Triggered when user requests account deletion
 * 
 * Subject: Account Deletion Confirmed
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderAccountDeletionEmail, AccountDeletionEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.email || !body.deletionDate) {
      return new Response(
        JSON.stringify({ error: 'Email and deletionDate are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || 'there';

    // Render email template
    const emailHtml = renderAccountDeletionEmail({
      userName,
      deletionDate: body.deletionDate,
      recoveryUrl: body.recoveryUrl,
      recoveryExpiryDate: body.recoveryExpiryDate,
    });

    // Send email
    const result = await sendEmail({
      to: body.email,
      subject: 'Account Deletion Confirmed',
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
    console.error('Error in send-account-deletion:', error);
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
