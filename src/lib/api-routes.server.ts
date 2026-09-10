import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { deliverEvent, logActivity, verifyInboundSignature } from "@/lib/security.server";

export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  // 1. Health check
  if (url.pathname === "/api/health") {
    return new Response(
      JSON.stringify({
        status: "ok",
        clinic: "SmileCraft Dental Studio",
        timezone: "Asia/Kolkata",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  }

  // 2. n8n inbound webhook endpoint
  if (url.pathname === "/api/webhooks/n8n" || url.pathname === "/api/n8n/webhook") {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "content-type": "application/json" },
      });
    }

    const rawBody = await request.text();
    const verification = verifyInboundSignature(rawBody, request.headers);

    if (!verification.ok) {
      console.warn("[webhook:n8n] rejected signature", verification.reason);
      return new Response(JSON.stringify({ error: "Unauthorized", reason: verification.reason }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    try {
      const payload = JSON.parse(rawBody) as {
        event: string;
        leadId?: string;
        appointmentId?: string;
        status?: string;
        appointmentDate?: string;
        appointmentTime?: string;
        notes?: string;
      };

      if (payload.appointmentId && payload.status) {
        await supabaseAdmin
          .from("appointments")
          .update({
            status: payload.status,
            ...(payload.notes ? { notes: payload.notes } : {}),
            ...(payload.appointmentDate ? { appointment_date: payload.appointmentDate } : {}),
            ...(payload.appointmentTime ? { appointment_time: payload.appointmentTime } : {}),
          })
          .eq("id", payload.appointmentId);

        await logActivity({
          action: `webhook.n8n.${payload.event || "appointment_updated"}`,
          appointmentId: payload.appointmentId,
          metadata: { newStatus: payload.status, notes: payload.notes },
        });
      }

      if (payload.leadId && payload.status) {
        await supabaseAdmin
          .from("leads")
          .update({ status: payload.status })
          .eq("id", payload.leadId);

        await logActivity({
          action: `webhook.n8n.${payload.event || "lead_updated"}`,
          leadId: payload.leadId,
          metadata: { newStatus: payload.status },
        });
      }

      return new Response(JSON.stringify({ ok: true, processed: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    } catch (parseError) {
      console.error("[webhook:n8n] payload processing error", parseError);
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
  }

  // 3. Outbox drain cron endpoint
  if (url.pathname === "/api/cron/drain-outbox") {
    const cronSecret = process.env.LOVABLE_CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const querySecret = url.searchParams.get("secret");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized cron execution" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    try {
      const nowIso = new Date().toISOString();
      const { data: pendingEvents, error } = await supabaseAdmin
        .from("outbox_events")
        .select("id")
        .eq("status", "pending")
        .or(`next_attempt_at.is.null,next_attempt_at.lte.${nowIso}`)
        .order("created_at", { ascending: true })
        .limit(20);

      if (error) {
        console.error("[outbox:cron] query failed", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }

      const count = pendingEvents?.length ?? 0;
      if (pendingEvents && count > 0) {
        await Promise.allSettled(pendingEvents.map((e) => deliverEvent(e.id)));
      }

      return new Response(JSON.stringify({ ok: true, drained: count, timestamp: nowIso }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Internal error";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  }

  return null;
}
