import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import {
  appointmentRequestSchema,
  availabilitySchema,
  contactSchema,
  leadInputSchema,
} from "./validation";
import {
  MAX_ADVANCE_DAYS,
  addDays,
  candidateSlots,
  clinicNowMinutes,
  clinicToday,
  isClinicOpenOn,
  overlaps,
  toMinutes,
} from "./scheduling";

/**
 * Public (unauthenticated) server functions.
 * Everything here is validated, rate limited and IP throttled before touching the database.
 * The browser is never trusted for availability or business rules.
 */

async function guard(bucket: string, limit: number, windowSeconds: number) {
  const { enforceRateLimit, clientIp } = await import("./security.server");
  const request = getRequest();
  await enforceRateLimit({
    bucket,
    identifier: clientIp(request),
    limit,
    windowSeconds,
  });
}

function safeError(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "code" in error && "message" in error) {
    const e = error as { code: string; message: string };
    if (
      e.code === "rate_limited" ||
      e.code === "conflict" ||
      e.code === "unavailable" ||
      e.code === "validation"
    ) {
      return { ok: false as const, code: e.code, message: e.message };
    }
  }
  console.error("[public]", error);
  return { ok: false as const, code: "server" as const, message: fallback };
}

// ---------------------------------------------------------------- content

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  const { admin } = await import("./security.server");
  const db = await admin();
  const { data } = await db
    .from("services")
    .select(
      "id,name,slug,description,long_description,category,price_from,duration_minutes,sort_order",
    )
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
});

export const getServiceDetails = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 80) }))
  .handler(async ({ data }) => {
    const { admin } = await import("./security.server");
    const db = await admin();
    const { data: service } = await db
      .from("services")
      .select("*")
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    return service;
  });

export const getFAQ = createServerFn({ method: "GET" }).handler(async () => {
  const { admin } = await import("./security.server");
  const db = await admin();
  const { data } = await db
    .from("faqs")
    .select("id,question,answer,category,sort_order")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
});

export const getClinicInformation = createServerFn({ method: "GET" }).handler(async () => {
  const { admin } = await import("./security.server");
  const db = await admin();
  const { data } = await db
    .from("knowledge_base")
    .select("topic,title,content")
    .eq("is_public", true);
  return data ?? [];
});

// ---------------------------------------------------------------- availability

export const getAvailableAppointmentOptions = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => availabilitySchema.parse(input))
  .handler(async ({ data }) => {
    const { admin } = await import("./security.server");
    const db = await admin();

    const today = clinicToday();
    if (data.date < today) {
      return { date: data.date, open: false, reason: "That date has already passed.", slots: [] };
    }
    if (data.date > addDays(today, MAX_ADVANCE_DAYS)) {
      return {
        date: data.date,
        open: false,
        reason: `We take requests up to ${MAX_ADVANCE_DAYS} days ahead.`,
        slots: [],
      };
    }
    if (!isClinicOpenOn(data.date)) {
      return {
        date: data.date,
        open: false,
        reason: "The clinic is closed on Sundays.",
        slots: [],
      };
    }

    let duration = 30;
    if (data.serviceSlug) {
      const { data: service } = await db
        .from("services")
        .select("duration_minutes")
        .eq("slug", data.serviceSlug)
        .maybeSingle();
      duration = service?.duration_minutes ?? 30;
    }

    const [{ data: booked }, { data: blocked }] = await Promise.all([
      db
        .from("appointments")
        .select("appointment_time,duration_minutes")
        .eq("appointment_date", data.date)
        .in("status", ["requested", "confirmed", "rescheduled"]),
      db.from("blocked_slots").select("start_time,end_time").eq("date", data.date),
    ]);

    const nowMinutes = data.date === today ? clinicNowMinutes() + 60 : -1;

    const slots = candidateSlots(data.date, duration)
      .filter((slot) => toMinutes(slot) >= nowMinutes)
      .map((slot) => {
        const start = toMinutes(slot);
        const end = start + duration;
        const clash =
          (booked ?? []).some((a) =>
            overlaps(
              start,
              end,
              toMinutes(a.appointment_time.slice(0, 5)),
              toMinutes(a.appointment_time.slice(0, 5)) + (a.duration_minutes ?? 30),
            ),
          ) ||
          (blocked ?? []).some((b) =>
            overlaps(
              start,
              end,
              toMinutes(b.start_time.slice(0, 5)),
              toMinutes(b.end_time.slice(0, 5)),
            ),
          );
        return { time: slot, available: !clash };
      });

    return { date: data.date, open: true, reason: null as string | null, slots, duration };
  });

// ---------------------------------------------------------------- leads

async function upsertLead(input: {
  firstName: string;
  lastName?: string | undefined;
  phone: string;
  email?: string | undefined;
  treatmentInterest?: string | undefined;
  patientType?: "new" | "existing" | "unknown" | undefined;
  reason?: string | undefined;
  urgency?: "routine" | "soon" | "urgent" | "emergency" | undefined;
  intent?: "high_intent" | "considering" | "information_only" | undefined;
  source?: string | undefined;
  conversationSummary?: string | undefined;
}) {
  const { admin, emitEvent, logActivity } = await import("./security.server");
  const db = await admin();

  const { data: existing } = await db
    .from("leads")
    .select("id,status")
    .eq("phone", input.phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const patch = {
    first_name: input.firstName,
    last_name: input.lastName || "",
    email: input.email || null,
    phone: input.phone,
    treatment_interest: input.treatmentInterest || null,
    patient_type: input.patientType ?? "unknown",
    reason: input.reason || null,
    urgency: input.urgency ?? "routine",
    intent: input.intent ?? "considering",
    source: input.source ?? "website",
    conversation_summary: input.conversationSummary || null,
  };

  if (existing) {
    await db.from("leads").update(patch).eq("id", existing.id);
    await logActivity({ action: "lead.updated", leadId: existing.id });
    await emitEvent("lead.updated", { lead_id: existing.id, source: patch.source });
    return existing.id;
  }

  const { data: created, error } = await db.from("leads").insert(patch).select("id").single();
  if (error || !created) throw new Error(error?.message ?? "lead insert failed");

  await logActivity({
    action: "lead.created",
    leadId: created.id,
    metadata: { source: patch.source },
  });
  await emitEvent("lead.created", {
    lead_id: created.id,
    source: patch.source,
    intent: patch.intent,
    urgency: patch.urgency,
  });
  await db.from("follow_up_jobs").insert({
    lead_id: created.id,
    workflow_type: "missed_lead_recovery",
    scheduled_for: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
  return created.id;
}

export const createLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadInputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      await guard("lead", 5, 600);
      const leadId = await upsertLead(data);
      return { ok: true as const, leadId };
    } catch (error) {
      return safeError(
        error,
        "We couldn't save your details. Please try again or call the clinic.",
      );
    }
  });

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      await guard("contact", 5, 600);
      const leadId = await upsertLead({
        firstName: data.firstName,
        lastName: data.lastName || "",
        phone: data.phone,
        email: data.email || "",
        reason: data.message,
        intent: "information_only",
        source: "contact_form",
      });
      return { ok: true as const, leadId };
    } catch (error) {
      return safeError(error, "Your message could not be sent. Please call the clinic instead.");
    }
  });

// ---------------------------------------------------------------- appointment requests

export const createAppointmentRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => appointmentRequestSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      await guard("appointment", 4, 900);
      const { admin, emitEvent, logActivity, AppError } = await import("./security.server");
      const db = await admin();

      // idempotency: the same submission never creates two appointments
      const { data: duplicate } = await db
        .from("appointments")
        .select("id,appointment_date,appointment_time,status")
        .eq("idempotency_key", data.idempotencyKey)
        .maybeSingle();
      if (duplicate) {
        return { ok: true as const, appointmentId: duplicate.id, duplicate: true };
      }

      const { data: service } = await db
        .from("services")
        .select("id,name,duration_minutes")
        .eq("slug", data.serviceSlug)
        .eq("active", true)
        .maybeSingle();
      if (!service) throw new AppError("That treatment is not available.", "validation");

      // server-authoritative availability re-check
      const availability = await getAvailableAppointmentOptions({
        data: { date: data.preferredDate, serviceSlug: data.serviceSlug },
      });
      if (!availability.open) {
        throw new AppError(availability.reason ?? "That date is not available.", "unavailable");
      }
      const slot = availability.slots.find((s) => s.time === data.preferredTime);
      if (!slot || !slot.available) {
        throw new AppError(
          "That time is no longer available. Please pick another slot.",
          "conflict",
        );
      }

      const leadId = await upsertLead({
        firstName: data.firstName,
        lastName: data.lastName || "",
        phone: data.phone,
        email: data.email || "",
        treatmentInterest: service.name,
        patientType: data.patientType,
        reason: data.notes || "",
        urgency: data.urgency,
        intent: "high_intent",
        source: data.source,
      });

      const { data: appointment, error } = await db
        .from("appointments")
        .insert({
          lead_id: leadId,
          service_id: service.id,
          appointment_date: data.preferredDate,
          appointment_time: data.preferredTime,
          duration_minutes: service.duration_minutes,
          status: "requested",
          notes: data.notes || null,
          idempotency_key: data.idempotencyKey,
        })
        .select("id")
        .single();

      if (error || !appointment) {
        // unique index on (date,time) for active appointments — someone won the race
        if (error?.code === "23505") {
          throw new AppError(
            "Someone just requested that slot. Please choose another time.",
            "conflict",
          );
        }
        throw new Error(error?.message ?? "appointment insert failed");
      }

      await db.from("leads").update({ status: "qualified" }).eq("id", leadId);
      await logActivity({
        action: "appointment.requested",
        leadId,
        appointmentId: appointment.id,
        metadata: { service: service.name },
      });
      await emitEvent(
        "appointment.requested",
        {
          appointment_id: appointment.id,
          lead_id: leadId,
          service: service.name,
          date: data.preferredDate,
          time: data.preferredTime,
        },
        `appointment.requested:${appointment.id}`,
      );

      return { ok: true as const, appointmentId: appointment.id, duplicate: false };
    } catch (error) {
      return safeError(
        error,
        "We couldn't submit your request. Nothing has been booked — please call the clinic.",
      );
    }
  });

export const getAppointmentRequestStatus = createServerFn({ method: "GET" })
  .inputValidator((input: { appointmentId: string }) => ({
    appointmentId: String(input.appointmentId).slice(0, 40),
  }))
  .handler(async ({ data }) => {
    const { admin } = await import("./security.server");
    const db = await admin();
    const { data: row } = await db
      .from("appointments")
      .select("id,status,appointment_date,appointment_time,services(name)")
      .eq("id", data.appointmentId)
      .maybeSingle();
    if (!row) return null;
    // deliberately minimal: no patient details are exposed on a public lookup
    return {
      id: row.id,
      status: row.status,
      date: row.appointment_date,
      time: row.appointment_time.slice(0, 5),
      service: row.services?.name ?? null,
    };
  });

export const sendAssistantMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => chatSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const { clientIp } = await import("./security.server");
      const { handleAssistantChat } = await import("./assistant.server");

      const req = getRequest();
      const ip = clientIp(req);

      const res = await handleAssistantChat({
        sessionId: data.sessionId,
        message: data.message,
        clientIp: ip,
      });

      return { ok: true as const, ...res };
    } catch (err: unknown) {
      console.error("[assistant] failed to process chat", err);
      return {
        ok: false as const,
        reply:
          "Our front desk is temporarily experiencing high inquiry volume. Please call +91 98765 43210 for immediate assistance.",
        suggestedActions: ["Call +91 98765 43210", "Book an appointment", "View treatments"],
      };
    }
  });
