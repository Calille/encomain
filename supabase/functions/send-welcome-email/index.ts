/**
 * Send Welcome Email Edge Function
 * Idempotent: skips if public.users.welcome_email_sent_at is already set.
 *
 * Subject: Welcome to The Enclosure!
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.6';
import { sendEmail } from '../_shared/email-service.ts';
import { handleCors, buildCorsHeaders } from '../_shared/cors.ts';
import { renderWelcomeEmail } from '../_shared/email-templates.ts';

interface RequestBody {
  email: string;
  userName?: string;
  loginUrl?: string;
  dashboardUrl?: string;
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

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
    let body: RequestBody;
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
    } catch (_parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!body.email) {
      return new Response(
        JSON.stringify({ error: 'Email address is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const email = body.email.toLowerCase().trim();
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userRow, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, welcome_email_sent_at')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('Error loading user for welcome email:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to look up user' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!userRow) {
      return new Response(
        JSON.stringify({ error: 'No user found for that email address' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (userRow.welcome_email_sent_at) {
      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          reason: 'already_sent',
          welcomeEmailSentAt: userRow.welcome_email_sent_at,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userName = body.userName || userRow.full_name || 'there';
    const loginUrl = body.loginUrl || 'https://theenclosure.co.uk/login';
    const dashboardUrl = body.dashboardUrl || 'https://theenclosure.co.uk/dashboard';

    const emailHtml = renderWelcomeEmail({
      userName,
      loginUrl,
      dashboardUrl,
    });

    const result = await sendEmail({
      to: email,
      subject: 'Welcome to The Enclosure!',
      html: emailHtml,
      from: 'The Enclosure <hello@theenclosure.co.uk>',
      idempotencyKey: `welcome-email-${userRow.id}`,
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

    // Only mark as sent after Resend succeeds
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq('id', userRow.id)
      .is('welcome_email_sent_at', null);

    if (updateError) {
      console.error('Welcome email sent but failed to persist flag:', updateError);
      // Still return success: email was delivered; flag failure should be investigated
    }

    return new Response(
      JSON.stringify({
        success: true,
        skipped: false,
        messageId: result.messageId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-welcome-email:', error);
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
