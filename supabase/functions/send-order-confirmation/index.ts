/**
 * Send Order Confirmation Email Edge Function
 * Triggered when an order is placed
 * 
 * Subject: Order Confirmation - [Order Number]
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderOrderConfirmationEmail, OrderConfirmationEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
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
    let body;
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

    if (!body.email || !body.order) {
      return new Response(
        JSON.stringify({ error: 'Email and order details are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || 'Customer';
    const orderDetailsUrl = body.orderDetailsUrl || `https://theenclosure.co.uk/orders/${body.order.orderId}`;

    // Render email template
    const emailHtml = renderOrderConfirmationEmail({
      userName,
      order: body.order,
      orderDetailsUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.email,
      subject: `Order Confirmation - ${body.order.orderNumber}`,
      html: emailHtml,
      from: 'The Enclosure <orders@theenclosure.co.uk>',
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
    console.error('Error in send-order-confirmation:', error);
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
