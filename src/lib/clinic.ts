/**
 * Static clinic facts. Fictional portfolio data — safe for both client and server.
 * Anything the AI assistant answers with comes from the database knowledge base,
 * not from this file; this is presentation content only.
 */

export const CLINIC = {
  name: "SmileCraft Dental Studio",
  tagline: "Modern Dentistry. Personal Care.",
  established: 2018,
  type: "Multi-specialty Dental Clinic",
  address: {
    line1: "24, Green Park Avenue",
    line2: "Sector 18, New Delhi",
    line3: "Delhi 110018, India",
  },
  phone: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  whatsapp: "+91 98765 43210",
  whatsappHref: "https://wa.me/919876543210",
  email: "hello@smilecraftdental.example",
  appointmentsEmail: "appointments@smilecraftdental.example",
  website: "smilecraftdental.example",
  timezone: "Asia/Kolkata",
} as const;

export const DENTIST = {
  name: "Dr. Aarav Mehta",
  qualifications: "BDS, MDS",
  specialization: "Cosmetic & Restorative Dentistry",
  experience: "10+ years",
  languages: "English, Hindi",
  bio: "Dr. Aarav Mehta is the fictional founder and lead dentist of SmileCraft Dental Studio. His practice focuses on cosmetic, restorative and preventive dentistry, with an emphasis on personalized treatment planning, clear communication and patient comfort.",
} as const;

/** 0 = Sunday … 6 = Saturday. `null` means closed. */
export const OPENING_HOURS: Record<number, { open: string; close: string } | null> = {
  0: null,
  1: { open: "09:00", close: "19:00" },
  2: { open: "09:00", close: "19:00" },
  3: { open: "09:00", close: "19:00" },
  4: { open: "09:00", close: "19:00" },
  5: { open: "09:00", close: "19:00" },
  6: { open: "10:00", close: "17:00" },
};

export const HOURS_DISPLAY = [
  { day: "Monday", hours: "9:00 AM – 7:00 PM" },
  { day: "Tuesday", hours: "9:00 AM – 7:00 PM" },
  { day: "Wednesday", hours: "9:00 AM – 7:00 PM" },
  { day: "Thursday", hours: "9:00 AM – 7:00 PM" },
  { day: "Friday", hours: "9:00 AM – 7:00 PM" },
  { day: "Saturday", hours: "10:00 AM – 5:00 PM" },
  { day: "Sunday", hours: "Closed" },
] as const;

export const TRUST_STATS = [
  { value: "8+ Years", label: "Established" },
  { value: "5,000+", label: "Patient visits" },
  { value: "15+", label: "Treatment categories" },
  { value: "10+ Years", label: "Dentist experience" },
] as const;

export const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    quote: "Everyone was very helpful and explained the treatment process clearly.",
  },
  {
    name: "Rahul Kapoor",
    quote: "The clinic felt comfortable and the entire appointment was handled professionally.",
  },
  {
    name: "Ananya Verma",
    quote: "I really appreciated how clearly the dentist explained my treatment options.",
  },
] as const;

export const FICTION_NOTE =
  "SmileCraft Dental Studio is a fictional clinic created for a portfolio project. The clinic, team, pricing, statistics and testimonials shown here are illustrative and not real.";

export function formatINR(value: number | null | undefined) {
  if (value === null || value === undefined) return "On assessment";
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatTime12h(time: string) {
  const segments = time.split(":");
  const m = segments[1] ?? "00";
  const h = Number(segments[0] ?? "0");
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${suffix}`;
}
