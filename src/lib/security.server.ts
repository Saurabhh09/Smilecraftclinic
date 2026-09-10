/**
 * Server-only security + integration primitives.
 * Never import this from a component or from the module scope of a *.functions.ts file.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** One-way hash so raw IP addresses are never persisted. */
export function hashIdentifier(value: string) {
  const salt = process.env["RATE_LIMIT_SALT"] ?? process.env["N8N_WEBHOOK_SECRET"] ?? "smilecraft";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 40);
}

export function clientIp(request: Request | undefined) {
  if (!request) return "unknown";
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export class AppError extends Error {
  constructor(
    message: string,
    readonly code:
      | "rate_limited"
      | "validation"
      | "conflict"
      | "unavailable"
      | "forbidden"
      | "server" = "server",
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Durable, database-backed rate limiting (safe on serverless — no in-memory state).
 * Falls open on infrastructure failure so a limiter outage cannot take the clinic offline,
 * but the failure is logged.
 */
export async function enforceRateLimit(opts: {
  bucket: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}) {
  const db = await admin();
  const identifierHash = hashIdentifier(opts.identifier);
  const since = new Date(Date.now() - opts.windowSeconds * 1000).toISOString();

  const { count, error } = await db
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("bucket", opts.bucket)
    .eq("identifier_hash", identifierHash)
    .gte("created_at", since);

  if (error) {
    console.error("[rate-limit] lookup failed", error.message);
    return;
  }

  if ((count ?? 0) >= opts.limit) {
    await logActivity({
      action: "security.rate_limited",
      metadata: { bucket: opts.bucket, limit: opts.limit },
    });
    throw new AppError(
      "Too many requests from this device. Please wait a moment and try again.",
      "rate_limited",
    );
  }

  await db.from("rate_limit_hits").insert({ bucket: opts.bucket, identifier_hash: identifierHash });

  // opportunistic cleanup so IP-derived hashes are not retained longer than needed
  if (Math.random() < 0.05) {
    await db
      .from("rate_limit_hits")
      .delete()
      .lt("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString());
  }
}

export async function logActivity(entry: {
  action: string;
  userId?: string | null;
  leadId?: string | null;
  appointmentId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const db = await admin();
    await db.from("activity_logs").insert({
      action: entry.action,
      user_id: entry.userId ?? null,
      lead_id: entry.leadId ?? null,
      appointment_id: entry.appointmentId ?? null,
      metadata: (entry.metadata ?? {}) as never,
    });
  } catch (error) {
    console.error("[audit] failed to write", error);
  }
}

// ------------------------------------------------------------------
// Outbox: business events for the external automation tool (n8n)
// ------------------------------------------------------------------

export type DomainEvent =
  | "lead.created"
  | "lead.updated"
  | "appointment.requested"
  | "appointment.confirmed"
  | "appointment.rescheduled"
  | "appointment.cancelled"
  | "appointment.completed"
  | "appointment.no_show"
  | "followup.required";

/**
 * Record the event first, then try to deliver. Delivery failure never fails the
 * business transaction — the row stays pending and is retried by the drain endpoint.
 */
export async function emitEvent(
  eventType: DomainEvent,
  payload: Record<string, unknown>,
  eventId?: string,
) {
  const db = await admin();
  const id = eventId ?? `${eventType}:${crypto.randomUUID()}`;
  const { data, error } = await db
    .from("outbox_events")
    .insert({ event_type: eventType, event_id: id, payload: payload as never })
    .select("id")
    .maybeSingle();

  if (error) {
    // unique violation = duplicate event, which is the point of the idempotency key
    if (error.code !== "23505") console.error("[outbox] insert failed", error.message);
    return;
  }

  if (data?.id) {
    void deliverEvent(data.id).catch((e) => console.error("[outbox] delivery error", e));
  }
}

function signPayload(body: string, secret: string, timestamp: string) {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export async function deliverEvent(rowId: string) {
  const db = await admin();
  const { data: row } = await db.from("outbox_events").select("*").eq("id", rowId).maybeSingle();
  if (!row || row.status !== "pending") return;

  const base = process.env["N8N_WEBHOOK_BASE_URL"];
  const secret = process.env["N8N_WEBHOOK_SECRET"];
  const attempts = row.attempts + 1;

  if (!base || !secret) {
    // Automation is not configured yet — keep the event queued, do not fail the app.
    await db
      .from("outbox_events")
      .update({ attempts, last_error: "automation_not_configured" })
      .eq("id", rowId);
    return;
  }

  const body = JSON.stringify({
    event: row.event_type,
    event_id: row.event_id,
    timestamp: new Date().toISOString(),
    data: row.payload,
  });
  const ts = Math.floor(Date.now() / 1000).toString();

  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/${row.event_type}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-smilecraft-timestamp": ts,
        "x-smilecraft-event-id": row.event_id,
        "x-smilecraft-signature": signPayload(body, secret, ts),
      },
      body,
    });

    if (response.ok) {
      await db
        .from("outbox_events")
        .update({ status: "delivered", attempts, delivered_at: new Date().toISOString() })
        .eq("id", rowId);
      return;
    }
    throw new Error(`automation responded ${response.status}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    const backoffSeconds = Math.min(3600, 30 * 2 ** attempts); // exponential backoff
    const dead = attempts >= 6;
    await db
      .from("outbox_events")
      .update({
        attempts,
        last_error: message.slice(0, 300),
        status: dead ? "dead" : "pending",
        next_attempt_at: new Date(Date.now() + backoffSeconds * 1000).toISOString(),
      })
      .eq("id", rowId);
  }
}

/** Verify an inbound automation call (n8n → app). */
export function verifyInboundSignature(rawBody: string, headers: Headers) {
  const secret = process.env["N8N_WEBHOOK_SECRET"];
  if (!secret) return { ok: false as const, reason: "not_configured" };

  const signature = headers.get("x-smilecraft-signature");
  const timestamp = headers.get("x-smilecraft-timestamp");
  if (!signature || !timestamp) return { ok: false as const, reason: "missing_signature" };

  // replay window: five minutes
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return { ok: false as const, reason: "stale_timestamp" };

  const expected = signPayload(rawBody, secret, timestamp);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false as const, reason: "invalid_signature" };
  }
  return { ok: true as const };
}
