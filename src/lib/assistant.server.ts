import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CLINIC, HOURS_DISPLAY, formatINR } from "@/lib/clinic";
import {
  getServices,
  getServiceDetails,
  getFAQ,
  getClinicInformation,
  getAvailableAppointmentOptions,
  createLead,
} from "@/lib/public.functions";
import { enforceRateLimit, logActivity } from "@/lib/security.server";

export interface AssistantResponse {
  reply: string;
  structuredData?: {
    type: "services" | "slots" | "booking_success" | "emergency_alert" | "clinic_info";
    data?: unknown;
  };
  suggestedActions?: string[];
}

const SYSTEM_PROMPT = `
You are the AI Front-Desk Assistant for SmileCraft Dental Studio, a multi-specialty dental clinic in New Delhi, India.
Clinic Principal: Dr. Aarav Mehta (BDS, MDS).
Location: 24, Green Park Avenue, Sector 18, New Delhi, Delhi 110018, India.
Phone: +91 98765 43210.
Hours: Mon-Fri 9:00 AM - 7:00 PM, Sat 10:00 AM - 5:00 PM. Closed Sundays.
Timezone: Asia/Kolkata.

SAFETY & BOUNDARIES (STRICT):
1. NEVER diagnose medical or dental conditions or recommend medications/dosages.
2. NEVER guarantee clinical outcomes or painlessness.
3. CLEARLY state that fees are indicative portfolio figures when quoting prices.
4. IN DENTAL EMERGENCIES (severe swelling, uncontrollable bleeding, trauma, difficulty breathing/swallowing), immediately advise the user to call the clinic (+91 98765 43210) during hours or seek emergency care immediately.
5. If you do not know an answer, politely direct them to call the reception desk at +91 98765 43210.
6. Speak in a warm, professional, concise tone. Format key information clearly.
`;

export async function handleAssistantChat(params: {
  sessionId: string;
  message: string;
  clientIp?: string;
}): Promise<AssistantResponse> {
  const { sessionId, message, clientIp = "unknown" } = params;

  // 1. Rate limiting
  await enforceRateLimit({
    bucket: "chat_assistant",
    identifier: clientIp || sessionId,
    limit: 25,
    windowSeconds: 60,
  });

  // 2. Persist user message to Supabase
  try {
    const conversation = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    let convId = conversation.data?.id;
    if (!convId) {
      const created = await supabaseAdmin
        .from("conversations")
        .insert({
          session_id: sessionId,
          status: "active",
          summary: `Conversation initiated by visitor`,
        })
        .select("id")
        .single();
      convId = created.data?.id;
    }

    if (convId) {
      await supabaseAdmin.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: message,
      });
    }
  } catch (err) {
    console.error("[assistant] failed to save message", err);
  }

  // 3. Check for emergency triggers first
  const lower = message.toLowerCase();
  if (
    lower.includes("emergency") ||
    lower.includes("severe pain") ||
    lower.includes("swelling") ||
    lower.includes("bleeding heavily") ||
    lower.includes("knocked out tooth") ||
    lower.includes("broken jaw")
  ) {
    const reply =
      "If you are experiencing severe facial swelling, acute trauma, heavy bleeding, or difficulty breathing, please seek immediate emergency medical care or call our clinic directly at +91 98765 43210 right away. Our team will arrange priority triage.";
    return {
      reply,
      structuredData: {
        type: "emergency_alert",
        data: { phone: CLINIC.phone, hours: "Mon–Fri 9am–7pm, Sat 10am–5pm" },
      },
      suggestedActions: ["Call clinic now", "View clinic location", "Request urgent callback"],
    };
  }

  // 4. If GEMINI_API_KEY is available, use Gemini with controlled tools
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const prompt = `${SYSTEM_PROMPT}\n\nPatient Query: "${message}"\nProvide a helpful, polite, and accurate response based strictly on clinic facts.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "Hello! How can I assist you with your dental care today?";
      return {
        reply: text,
        suggestedActions: ["Book an appointment", "View treatment prices", "Clinic opening hours"],
      };
    } catch (geminiError) {
      console.warn(
        "[assistant] Gemini API error, falling back to deterministic responder",
        geminiError,
      );
    }
  }

  // 5. High-fidelity semantic domain router (portfolio-ready fallback)
  if (
    lower.includes("hour") ||
    lower.includes("timing") ||
    lower.includes("open") ||
    lower.includes("close")
  ) {
    return {
      reply: `SmileCraft Dental Studio is open Monday to Friday from 9:00 AM to 7:00 PM, and Saturday from 10:00 AM to 5:00 PM (Asia/Kolkata timezone). We are closed on Sundays.`,
      structuredData: {
        type: "clinic_info",
        data: { hours: HOURS_DISPLAY },
      },
      suggestedActions: ["Book an appointment", "Where are you located?", "Emergency dental care"],
    };
  }

  if (
    lower.includes("location") ||
    lower.includes("address") ||
    lower.includes("where") ||
    lower.includes("parking") ||
    lower.includes("metro")
  ) {
    return {
      reply: `We are located at 24, Green Park Avenue, Sector 18, New Delhi, Delhi 110018. Street parking is available along Green Park Avenue with a visitor bay near the front lobby. Wheelchair ramp access is provided at the main entrance.`,
      structuredData: {
        type: "clinic_info",
        data: { address: CLINIC.address, phone: CLINIC.phone },
      },
      suggestedActions: ["Book an appointment", "Clinic opening hours", "Call the clinic"],
    };
  }

  if (
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("fee") ||
    lower.includes("whitening") ||
    lower.includes("implant") ||
    lower.includes("aligner") ||
    lower.includes("root canal") ||
    lower.includes("cleaning")
  ) {
    const services = await getServices();
    let matched = services.find((s) => lower.includes(s.name.toLowerCase()));
    if (!matched && lower.includes("whitening"))
      matched = services.find((s) => s.slug === "teeth-whitening");
    if (!matched && lower.includes("cleaning"))
      matched = services.find((s) => s.slug === "teeth-cleaning");
    if (!matched && lower.includes("implant"))
      matched = services.find((s) => s.slug === "dental-implants");
    if (!matched && lower.includes("aligner"))
      matched = services.find((s) => s.slug === "clear-aligners");
    if (!matched && lower.includes("root canal"))
      matched = services.find((s) => s.slug === "root-canal-treatment");

    if (matched) {
      return {
        reply: `${matched.name}: indicative fees start from ${formatINR(matched.price_from)} (typical duration: ${matched.duration_minutes} minutes). Please note that final costs depend on clinical assessment during an in-person consultation.`,
        structuredData: {
          type: "services",
          data: [matched],
        },
        suggestedActions: [`Book ${matched.name}`, "View all treatments", "Ask another question"],
      };
    }

    return {
      reply: `Our treatments start from ₹800 for routine consultations, ₹1,200 for cleanings, ₹7,500 for professional whitening, and ₹35,000 for clear aligners. Indicative fees are shown for demonstration; exact treatment plans are confirmed during an in-clinic exam.`,
      structuredData: {
        type: "services",
        data: services.slice(0, 4),
      },
      suggestedActions: ["Book an appointment", "Explore all treatments", "Call front desk"],
    };
  }

  if (
    lower.includes("book") ||
    lower.includes("appointment") ||
    lower.includes("consultation") ||
    lower.includes("slot")
  ) {
    return {
      reply: `I would be glad to help you schedule a consultation at SmileCraft Dental Studio! You can choose your preferred treatment, date, and time slot directly using our interactive booking form, or tell me your preferred day.`,
      suggestedActions: ["Go to Booking Form", "Check available slots", "Call +91 98765 43210"],
    };
  }

  // Default friendly welcome
  return {
    reply: `Hello! I am the virtual front-desk assistant at SmileCraft Dental Studio in New Delhi. How can I assist you today? I can help you with treatment information, fictional fee guides, clinic opening hours, directions, or booking an appointment.`,
    suggestedActions: [
      "Book an appointment",
      "Treatments & pricing",
      "Clinic hours & location",
      "Emergency advice",
    ],
  };
}
