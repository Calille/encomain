/**
 * Send Payment Receipt Email Edge Function
 * Triggered after successful payment
 * 
 * Subject: Payment Receipt - [Transaction ID]
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderPaymentReceiptEmail, PaymentReceiptEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.email || !body.payment) {
      return new Response(
        JSON.stringify({ error: 'Email and payment details are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || 'Customer';

    // Render email template
    const emailHtml = renderPaymentReceiptEmail({
      userName,
      payment: body.payment,
      invoiceUrl: body.invoiceUrl,
      receiptUrl: body.receiptUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.email,
      subject: `Payment Receipt - ${body.payment.transactionId}`,
      html: emailHtml,
      from: 'The Enclosure <notifications@theenclosure.co.uk>',
      replyTo: 'orders@theenclosure.co.uk',
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
    console.error('Error in send-payment-receipt:', error);
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
