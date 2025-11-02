/**
 * Send New User Signup Alert Email Edge Function (Admin)
 * Triggered when new user signs up
 * 
 * Subject: New User Signup - [User Email]
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, handleCors, corsHeaders } from '../_shared/email-service.ts';
import { renderNewUserSignupEmail, NewUserSignupEmailData } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();

    if (!body.adminEmail || !body.userEmail || !body.signupDate || !body.userRole || !body.adminDashboardUrl) {
      return new Response(
        JSON.stringify({ error: 'adminEmail, userEmail, signupDate, userRole, and adminDashboardUrl are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const adminName = body.adminName || 'Admin';

    // Render email template
    const emailHtml = renderNewUserSignupEmail({
      adminName,
      userEmail: body.userEmail,
      userName: body.userName,
      signupDate: body.signupDate,
      userRole: body.userRole,
      adminDashboardUrl: body.adminDashboardUrl,
    });

    // Send email
    const result = await sendEmail({
      to: body.adminEmail,
      subject: `New User Signup - ${body.userEmail}`,
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
    console.error('Error in send-new-user-alert:', error);
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
