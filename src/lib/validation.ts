import { z } from "zod";

const name = z
  .string()
  .trim()
  .min(1, "Required")
  .max(80, "Too long")
  .regex(/^[\p{L}\p{M}'\-. ]+$/u, "Use letters only");

const phone = z
  .string()
  .trim()
  .min(6, "Enter a valid phone number")
  .max(24, "Enter a valid phone number")
  .regex(/^[+()\d\s-]+$/, "Enter a valid phone number");

const email = z.string().trim().email("Enter a valid email").max(255);

export const leadInputSchema = z
  .object({
    firstName: name,
    lastName: name.optional().or(z.literal("")),
    phone,
    email: email.optional().or(z.literal("")),
    treatmentInterest: z.string().trim().max(120).optional().or(z.literal("")),
    patientType: z.enum(["new", "existing", "unknown"]).default("unknown"),
    reason: z.string().trim().max(600).optional().or(z.literal("")),
    urgency: z.enum(["routine", "soon", "urgent", "emergency"]).default("routine"),
    intent: z.enum(["high_intent", "considering", "information_only"]).default("considering"),
    source: z.string().trim().max(40).default("website"),
    conversationSummary: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .strict();

export type LeadInput = z.infer<typeof leadInputSchema>;

export const appointmentRequestSchema = z
  .object({
    firstName: name,
    lastName: name.optional().or(z.literal("")),
    phone,
    email: email.optional().or(z.literal("")),
    serviceSlug: z.string().trim().min(1).max(80),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
    preferredTime: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time"),
    patientType: z.enum(["new", "existing", "unknown"]).default("unknown"),
    urgency: z.enum(["routine", "soon", "urgent", "emergency"]).default("routine"),
    notes: z.string().trim().max(600).optional().or(z.literal("")),
    source: z.string().trim().max(40).default("website_form"),
    idempotencyKey: z.string().trim().min(8).max(80),
  })
  .strict();

export type AppointmentRequestInput = z.infer<typeof appointmentRequestSchema>;

export const contactSchema = z
  .object({
    firstName: name,
    lastName: name.optional().or(z.literal("")),
    phone,
    email: email.optional().or(z.literal("")),
    message: z.string().trim().min(5, "Tell us how we can help").max(1000),
  })
  .strict();

export const availabilitySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    serviceSlug: z.string().trim().max(80).optional(),
  })
  .strict();

export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "qualified",
  "booked",
  "completed",
  "lost",
]);
export const leadIntentSchema = z.enum(["high_intent", "considering", "information_only"]);
export const appointmentStatusSchema = z.enum([
  "requested",
  "confirmed",
  "rescheduled",
  "completed",
  "cancelled",
  "no_show",
]);

export const paginationSchema = z
  .object({
    page: z.number().int().min(1).max(500).default(1),
    pageSize: z.number().int().min(1).max(50).default(20),
    search: z.string().trim().max(80).optional(),
  })
  .strict();

export const chatSchema = z
  .object({
    sessionId: z.string().trim().min(8).max(64),
    message: z.string().trim().min(1).max(1200),
  })
  .strict();

/** Turn a ZodError into a field-keyed map the UI can render next to inputs. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
