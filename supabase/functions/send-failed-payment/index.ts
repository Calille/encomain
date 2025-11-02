/**
 * Send Failed Payment Alert Email Edge Function
 * Triggered when payment fails
 * 
 * Subject: Payment Failed - Action Required
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderFailedPaymentEmail, FailedPaymentEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.email || !body.payment || !body.updatePaymentMethodUrl || !body.billingUrl) {
      return new Response(
        JSON.stringify({ error: 'Email, payment details, updatePaymentMethodUrl, and billingUrl are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || 'Customer';

    // Render email template
    const emailHtml = renderFailedPaymentEmail({
      userName,
      payment: body.payment,
      retryDate: body.retryDate,
      updatePaymentMethodUrl: body.updatePaymentMethodUrl,
      billingUrl: body.billingUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.email,
      subject: `Payment Failed - ${body.payment.amount} ${body.payment.currency}`,
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
    console.error('Error in send-failed-payment:', error);
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
