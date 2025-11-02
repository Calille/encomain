/**
 * Send New Order Notification Email Edge Function (Admin)
 * Triggered when new order is placed
 * 
 * Subject: New Order Received - [Order Number]
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderNewOrderNotificationEmail, NewOrderNotificationEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.adminEmail || !body.order || !body.adminDashboardUrl) {
      return new Response(
        JSON.stringify({ error: 'adminEmail, order, and adminDashboardUrl are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const adminName = body.adminName || 'Admin';

    // Render email template
    const emailHtml = renderNewOrderNotificationEmail({
      adminName,
      order: body.order,
      adminDashboardUrl: body.adminDashboardUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.adminEmail,
      subject: `New Order Received - ${body.order.orderNumber}`,
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
    console.error('Error in send-new-order-alert:', error);
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
