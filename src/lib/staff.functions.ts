import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { emitEvent, logActivity } from "@/lib/security.server";

// Public helper for staff dashboard data
export const getStaffDashboardData = createServerFn({ method: "GET" }).handler(async () => {
  const [leadsRes, appsRes, svcsRes, logsRes] = await Promise.all([
    supabaseAdmin.from("leads").select("*").order("created_at", { ascending: false }).limit(100),
    supabaseAdmin
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true })
      .limit(100),
    supabaseAdmin.from("services").select("id, name, slug, duration_minutes, price_from"),
    supabaseAdmin
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const leads = leadsRes.data ?? [];
  const appointments = appsRes.data ?? [];
  const services = svcsRes.data ?? [];
  const activityLogs = logsRes.data ?? [];

  // Map service names to appointments
  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const leadMap = new Map(leads.map((l) => [l.id, l]));

  const enrichedAppointments = appointments.map((app) => {
    const service = serviceMap.get(app.service_id);
    const lead = leadMap.get(app.lead_id);
    return {
      ...app,
      serviceName: service?.name ?? "General Dental Care",
      serviceDuration: service?.duration_minutes ?? app.duration_minutes,
      leadName: lead ? `${lead.first_name} ${lead.last_name ?? ""}`.trim() : "Patient",
      leadPhone: lead?.phone ?? "—",
      leadEmail: lead?.email ?? "—",
    };
  });

  // Calculate high-level analytics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const bookedLeads = leads.filter((l) => l.status === "booked").length;
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed").length;

  const todayStr = new Date().toISOString().split("T")[0]!;
  const todayAppointments = enrichedAppointments.filter(
    (a) => a.appointment_date === todayStr && a.status !== "cancelled",
  );

  return {
    metrics: {
      totalLeads,
      newLeads,
      bookedLeads,
      totalAppointments,
      confirmedAppointments,
      todayAppointmentsCount: todayAppointments.length,
      conversionRate: totalLeads > 0 ? ((bookedLeads / totalLeads) * 100).toFixed(1) : "0.0",
    },
    leads,
    appointments: enrichedAppointments,
    activityLogs,
    services,
  };
});

const updateLeadStatusSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(["new", "contacted", "qualified", "booked", "completed", "lost"]),
});

export const updateLeadStatus = createServerFn({ method: "POST" })
  .validator((d: unknown) => updateLeadStatusSchema.parse(d))
  .handler(async ({ data }) => {
    await supabaseAdmin.from("leads").update({ status: data.status }).eq("id", data.leadId);

    await logActivity({
      action: "lead.status_updated",
      leadId: data.leadId,
      metadata: { newStatus: data.status },
    });

    await emitEvent("lead.updated", { leadId: data.leadId, status: data.status });

    return { ok: true };
  });

const updateLeadIntentSchema = z.object({
  leadId: z.string().min(1),
  intent: z.enum(["high_intent", "considering", "price_shopper", "casual_browser", "unknown"]),
});

export const updateLeadIntent = createServerFn({ method: "POST" })
  .validator((d: unknown) => updateLeadIntentSchema.parse(d))
  .handler(async ({ data }) => {
    await supabaseAdmin.from("leads").update({ intent: data.intent }).eq("id", data.leadId);

    await logActivity({
      action: "lead.intent_updated",
      leadId: data.leadId,
      metadata: { newIntent: data.intent },
    });

    return { ok: true };
  });

const addLeadNoteSchema = z.object({
  leadId: z.string().min(1),
  note: z.string().min(1).max(1000),
});

export const addLeadNote = createServerFn({ method: "POST" })
  .validator((d: unknown) => addLeadNoteSchema.parse(d))
  .handler(async ({ data }) => {
    const lead = await supabaseAdmin
      .from("leads")
      .select("conversation_summary")
      .eq("id", data.leadId)
      .single();
    const existing = lead.data?.conversation_summary ? `${lead.data.conversation_summary}\n\n` : "";
    const updatedSummary = `${existing}[${new Date().toLocaleDateString("en-IN")}] ${data.note.trim()}`;

    await supabaseAdmin
      .from("leads")
      .update({ conversation_summary: updatedSummary })
      .eq("id", data.leadId);

    await logActivity({
      action: "lead.note_added",
      leadId: data.leadId,
      metadata: { noteLength: data.note.length },
    });

    return { ok: true, conversation_summary: updatedSummary };
  });

const recordContactAttemptSchema = z.object({
  leadId: z.string().min(1),
  method: z.enum(["call", "whatsapp", "email"]),
  note: z.string().optional(),
});

export const recordContactAttempt = createServerFn({ method: "POST" })
  .validator((d: unknown) => recordContactAttemptSchema.parse(d))
  .handler(async ({ data }) => {
    const now = new Date().toISOString();
    await supabaseAdmin
      .from("leads")
      .update({
        status: "contacted",
        last_contacted_at: now,
      })
      .eq("id", data.leadId);

    await logActivity({
      action: "lead.contacted",
      leadId: data.leadId,
      metadata: { method: data.method, note: data.note },
    });

    return { ok: true, contactedAt: now };
  });

const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().min(1),
  status: z.enum(["requested", "confirmed", "rescheduled", "cancelled", "completed", "no_show"]),
  notes: z.string().optional(),
});

export const updateAppointmentStatus = createServerFn({ method: "POST" })
  .validator((d: unknown) => updateAppointmentStatusSchema.parse(d))
  .handler(async ({ data }) => {
    const patch: Record<string, unknown> = { status: data.status };
    if (data.notes !== undefined) patch.notes = data.notes;

    await supabaseAdmin.from("appointments").update(patch).eq("id", data.appointmentId);

    await logActivity({
      action: "appointment.status_updated",
      appointmentId: data.appointmentId,
      metadata: { newStatus: data.status, notes: data.notes },
    });

    const eventMap: Record<
      string,
      | "appointment.confirmed"
      | "appointment.cancelled"
      | "appointment.completed"
      | "appointment.no_show"
      | "appointment.rescheduled"
    > = {
      confirmed: "appointment.confirmed",
      cancelled: "appointment.cancelled",
      completed: "appointment.completed",
      no_show: "appointment.no_show",
      rescheduled: "appointment.rescheduled",
    };

    const eventType = eventMap[data.status];
    if (eventType) {
      await emitEvent(eventType, { appointmentId: data.appointmentId, status: data.status });
    }

    return { ok: true };
  });

const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string().min(1),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

export const rescheduleAppointment = createServerFn({ method: "POST" })
  .validator((d: unknown) => rescheduleAppointmentSchema.parse(d))
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("appointments")
      .update({
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        status: "rescheduled",
        notes: data.notes ?? "Rescheduled by staff",
      })
      .eq("id", data.appointmentId);

    await logActivity({
      action: "appointment.rescheduled",
      appointmentId: data.appointmentId,
      metadata: {
        newDate: data.appointmentDate,
        newTime: data.appointmentTime,
      },
    });

    await emitEvent("appointment.rescheduled", {
      appointmentId: data.appointmentId,
      newDate: data.appointmentDate,
      newTime: data.appointmentTime,
    });

    return { ok: true };
  });
