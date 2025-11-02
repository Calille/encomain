/**
 * Send Promotional Offer Email Edge Function
 * Triggered for marketing promotions
 * 
 * Subject: [Offer Title] - Limited Time Offer
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderPromotionalOfferEmail, PromotionalOfferEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.email || !body.offerTitle || !body.offerDescription || !body.ctaUrl || !body.unsubscribeUrl) {
      return new Response(
        JSON.stringify({ error: 'Email, offerTitle, offerDescription, ctaUrl, and unsubscribeUrl are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || 'there';

    // Render email template
    const emailHtml = renderPromotionalOfferEmail({
      userName,
      offerTitle: body.offerTitle,
      offerDescription: body.offerDescription,
      discount: body.discount,
      expiryDate: body.expiryDate,
      ctaUrl: body.ctaUrl,
      unsubscribeUrl: body.unsubscribeUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.email,
      subject: `${body.offerTitle} - Limited Time Offer`,
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
    console.error('Error in send-promotional-offer:', error);
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
