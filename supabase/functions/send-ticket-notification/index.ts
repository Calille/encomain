/**
 * Send support ticket notification emails.
 *
 * Types:
 * - new_ticket: notify admin distribution address when a client creates a ticket
 * - admin_response: notify the client when an admin replies
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendEmail } from "../_shared/email-service.ts";
import { handleCors, buildCorsHeaders } from "../_shared/cors.ts";
import {
  renderNewTicketAdminEmail,
  renderTicketResponseClientEmail,
} from "../_shared/email-templates.ts";

interface RequestBody {
  type?: "new_ticket" | "admin_response";
  ticketId?: string;
  subject?: string;
  category?: string;
  clientEmail?: string;
  clientName?: string;
  responsePreview?: string;
  ticketUrl?: string;
}

const ADMIN_INBOX = "josh@theenclosure.co.uk";
const FROM_ADDRESS = "The Enclosure <noreply@theenclosure.co.uk>";

function previewKey(preview: string | undefined): string {
  const raw = (preview || "reply").trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40);
  return raw || "reply";
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let body: RequestBody;
    try {
      body = await req.json();
    } catch (_e) {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const type = body.type;
    const ticketId = body.ticketId?.trim();
    const subject = body.subject?.trim();
    const clientEmail = body.clientEmail?.toLowerCase().trim();

    if (!type || !ticketId || !subject) {
      return new Response(
        JSON.stringify({ error: "type, ticketId, and subject are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (type === "new_ticket") {
      const emailHtml = renderNewTicketAdminEmail({
        subject,
        category: body.category || "general",
        clientEmail: clientEmail || "unknown",
        clientName: body.clientName,
        ticketUrl:
          body.ticketUrl || "https://theenclosure.co.uk/admin/support-tickets",
        ticketId,
      });

      const result = await sendEmail({
        to: ADMIN_INBOX,
        subject: `New support ticket: ${subject}`,
        html: emailHtml,
        from: FROM_ADDRESS,
        idempotencyKey: `ticket-new-${ticketId}`,
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.error || "Failed to send email" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, messageId: result.messageId }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (type === "admin_response") {
      if (!clientEmail) {
        return new Response(
          JSON.stringify({ error: "clientEmail is required for admin_response" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const emailHtml = renderTicketResponseClientEmail({
        clientName: body.clientName,
        subject,
        responsePreview: body.responsePreview,
        ticketUrl: body.ticketUrl || "https://theenclosure.co.uk/dashboard/support",
      });

      const result = await sendEmail({
        to: clientEmail,
        subject: `Update on your support request: ${subject}`,
        html: emailHtml,
        from: FROM_ADDRESS,
        idempotencyKey: `ticket-resp-${ticketId}-${previewKey(body.responsePreview)}`,
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ error: result.error || "Failed to send email" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, messageId: result.messageId }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid type. Use new_ticket or admin_response." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-ticket-notification:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
