/**
 * Send Monthly Newsletter Email Edge Function
 * Triggered monthly for marketing/engagement
 * 
 * Subject: [Month] [Year] Newsletter - The Enclosure
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderNewsletterEmail, NewsletterEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.email || !body.month || !body.year || !body.featuredItems || !body.unsubscribeUrl) {
      return new Response(
        JSON.stringify({ error: 'Email, month, year, featuredItems, and unsubscribeUrl are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || 'there';

    // Render email template
    const emailHtml = renderNewsletterEmail({
      userName,
      month: body.month,
      year: body.year,
      featuredItems: body.featuredItems,
      unsubscribeUrl: body.unsubscribeUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.email,
      subject: `${body.month} ${body.year} Newsletter - The Enclosure`,
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
    console.error('Error in send-newsletter:', error);
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
