/**
 * Send Subscription Renewal Reminder Email Edge Function
 * Triggered before subscription renewal date
 * 
 * Subject: Your Subscription Renews Soon - Action Required
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderSubscriptionRenewalEmail, SubscriptionRenewalEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.email || !body.subscription) {
      return new Response(
        JSON.stringify({ error: 'Email and subscription details are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || 'Customer';
    const billingUrl = body.billingUrl || 'https://theenclosure.co.uk/billing';

    // Render email template
    const emailHtml = renderSubscriptionRenewalEmail({
      userName,
      subscription: body.subscription,
      billingUrl,
      updatePaymentMethodUrl: body.updatePaymentMethodUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.email,
      subject: `Your ${body.subscription.planName} subscription renews soon`,
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
    console.error('Error in send-subscription-reminder:', error);
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
