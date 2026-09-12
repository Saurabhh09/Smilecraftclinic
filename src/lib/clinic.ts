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

export type DoctorProfile = {
  id: string;
  name: string;
  qualification: string;
  role: string;
  specialization: string;
  experience: string;
  languages: string;
  bio: string;
  image: string;
  availability: string;
};

export const DOCTORS: DoctorProfile[] = [
  {
    id: "aarav-mehta",
    name: "Dr. Aarav Mehta",
    qualification: "BDS, MDS",
    role: "Founder & Lead Dentist",
    specialization: "Cosmetic & Restorative Dentistry",
    experience: "10+ years",
    languages: "English, Hindi",
    bio: "Dr. Aarav Mehta specializes in cosmetic and restorative dentistry, with a focus on personalized treatment planning and natural, confident smiles.",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=85",
    availability: "Accepting patients",
  },
  {
    id: "nidhi-sharma",
    name: "Dr. Nidhi Sharma",
    qualification: "BDS, MDS",
    role: "Orthodontist",
    specialization: "Orthodontics & Clear Aligners",
    experience: "8+ years",
    languages: "English, Hindi",
    bio: "Dr. Nidhi Sharma focuses on braces, clear aligners, and early orthodontic care for children and adults, helping patients achieve healthier, more confident smiles.",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85",
    availability: "Accepting patients",
  },
  {
    id: "rohan-kulkarni",
    name: "Dr. Rohan Kulkarni",
    qualification: "BDS, MDS",
    role: "Implant & Oral Surgery Specialist",
    specialization: "Dental Implants & Oral Surgery",
    experience: "12+ years",
    languages: "English, Hindi, Marathi",
    bio: "Dr. Rohan Kulkarni has extensive experience in dental implants, bone grafting, and complex oral surgical procedures, with a focus on precision and long-term treatment planning.",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=85",
    availability: "Accepting patients",
  },
  {
    id: "ananya-iyer",
    name: "Dr. Ananya Iyer",
    qualification: "BDS, MDS",
    role: "Pediatric Dentist",
    specialization: "Pediatric & Preventive Dentistry",
    experience: "7+ years",
    languages: "English, Hindi, Tamil",
    bio: "Dr. Ananya Iyer specializes in gentle, anxiety-aware dental care for children and preventive dentistry for patients of all age groups, making every visit a positive experience.",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=85",
    availability: "Accepting patients",
  },
];

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

export type PatientTestimonial = {
  id: string;
  patientName: string;
  age: number;
  occupation: string;
  treatment: string;
  rating: number;
  quote: string;
  resultLabel: string;
  resultStatus: string;
  initials: string;
};

export const TESTIMONIALS: PatientTestimonial[] = [
  {
    id: "priya-patel",
    patientName: "Priya Patel",
    age: 29,
    occupation: "Software Engineer",
    treatment: "Clear Aligners",
    rating: 5,
    quote:
      "The entire team made the experience feel calm and easy to understand. I appreciated having every step explained clearly before starting my treatment.",
    resultLabel: "Clear Aligner Treatment",
    resultStatus: "Treatment Completed",
    initials: "PP",
  },
  {
    id: "arjun-malhotra",
    patientName: "Arjun Malhotra",
    age: 36,
    occupation: "Entrepreneur",
    treatment: "Dental Implants",
    rating: 5,
    quote:
      "I had been putting off replacing a missing tooth for a long time. The consultation helped me understand my options clearly, and the entire process felt organized from beginning to end.",
    resultLabel: "Implant Consultation",
    resultStatus: "Treatment Completed",
    initials: "AM",
  },
  {
    id: "neha-kapoor",
    patientName: "Neha Kapoor",
    age: 31,
    occupation: "Architect",
    treatment: "Teeth Whitening",
    rating: 5,
    quote:
      "The team explained the process without making it feel complicated. The appointment was comfortable, professional, and much easier than I expected.",
    resultLabel: "Professional Whitening",
    resultStatus: "Treatment Completed",
    initials: "NK",
  },
  {
    id: "rohan-verma",
    patientName: "Rohan Verma",
    age: 42,
    occupation: "Business Consultant",
    treatment: "Root Canal Treatment",
    rating: 5,
    quote:
      "I was nervous about the treatment, but the team took the time to explain what would happen and answered all of my questions.",
    resultLabel: "Restorative Care",
    resultStatus: "Treatment Completed",
    initials: "RV",
  },
  {
    id: "kavya-iyer",
    patientName: "Kavya Iyer",
    age: 27,
    occupation: "Product Designer",
    treatment: "Smile Makeover",
    rating: 5,
    quote:
      "What stood out most was how personalized the consultation felt. I never felt rushed, and I understood the different options before making a decision.",
    resultLabel: "Smile Makeover",
    resultStatus: "Treatment Completed",
    initials: "KI",
  },
  {
    id: "vikram-shah",
    patientName: "Vikram Shah",
    age: 48,
    occupation: "Finance Professional",
    treatment: "Dental Crown",
    rating: 5,
    quote:
      "From the first consultation to the follow-up, everything felt organized and professional. The team made the entire experience much less stressful.",
    resultLabel: "Restorative Dentistry",
    resultStatus: "Treatment Completed",
    initials: "VS",
  },
];

export type SmileCase = {
  id: string;
  caseNumber: string;
  treatment: string;
  title: string;
  description: string;
  timeline: string;
  beforeImage: string | null;
  afterImage: string | null;
  beforeAlt: string;
  afterAlt: string;
  serviceSlug: string;
};

export const SMILE_CASES: SmileCase[] = [
  {
    id: "clear-aligner-smile",
    caseNumber: "01",
    treatment: "Clear Aligners",
    title: "Clear Aligner Smile Transformation",
    description:
      "A portfolio demonstration of how orthodontic treatment can improve tooth alignment and smile symmetry.",
    timeline: "Varies by individual case",
    beforeImage: "/cases/SmileCraft-Case-01-Before.png",
    afterImage: "/cases/case-01-after.png",
    beforeAlt: "Fictional clear aligner case before-treatment image",
    afterAlt: "Fictional clear aligner case after-treatment image",
    serviceSlug: "clear-aligners",
  },
  {
    id: "restorative-smile",
    caseNumber: "02",
    treatment: "Dental Restoration",
    title: "Restorative Smile Improvement",
    description:
      "A fictional treatment example demonstrating how restorative dentistry can improve the appearance and function of a damaged tooth.",
    timeline: "Varies by individual case",
    beforeImage: null,
    afterImage: null,
    beforeAlt: "Fictional restorative case before-treatment image placeholder",
    afterAlt: "Fictional restorative case after-treatment image placeholder",
    serviceSlug: "dental-fillings",
  },
  {
    id: "smile-brightening",
    caseNumber: "03",
    treatment: "Professional Teeth Whitening",
    title: "Smile Brightening",
    description:
      "A fictional portfolio example illustrating a brighter-looking smile following professional cosmetic care.",
    timeline: "Varies by individual case",
    beforeImage: null,
    afterImage: null,
    beforeAlt: "Fictional teeth whitening case before-treatment image placeholder",
    afterAlt: "Fictional teeth whitening case after-treatment image placeholder",
    serviceSlug: "teeth-whitening",
  },
];

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
