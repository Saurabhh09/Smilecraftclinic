/* eslint-disable @typescript-eslint/no-explicit-any */
// In-memory mock client for Supabase used when credentials are not configured in the environment.
// Enables the application to boot and showcase all features safely without crashing.

export interface ServiceRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string;
  category: string;
  price_from: number;
  price_note: string;
  duration_minutes: number;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FaqRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface KnowledgeBaseRecord {
  id: string;
  topic: string;
  title: string;
  content: string;
  is_public: boolean;
  created_at: string;
}

export interface LeadRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  treatment_interest: string;
  patient_type: string;
  reason: string;
  urgency: string;
  intent: string;
  status: string;
  source: string;
  conversation_summary: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentRecord {
  id: string;
  lead_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BlockedSlotRecord {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_at: string;
}

const INITIAL_SERVICES: ServiceRecord[] = [
  {
    id: "s1",
    name: "General Dentistry",
    slug: "general-dentistry",
    description: "Routine care that keeps your teeth and gums healthy year round.",
    long_description:
      "General dentistry covers everyday oral health: examinations, cleanings, small restorations and preventive advice. Our approach is conservative — we treat what needs treating and explain why.",
    category: "General",
    price_from: 800,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 30,
    active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s2",
    name: "Dental Check-ups",
    slug: "dental-check-ups",
    description: "A thorough examination with clear, jargon-free findings.",
    long_description:
      "A check-up includes an oral examination, screening of the gums and soft tissues, and a written summary of findings with options and indicative costs before anything is scheduled.",
    category: "General",
    price_from: 800,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 30,
    active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s3",
    name: "Professional Teeth Cleaning",
    slug: "teeth-cleaning",
    description: "Scaling and polishing to remove plaque and surface stains.",
    long_description:
      "Professional cleaning removes hardened plaque that brushing cannot reach, followed by polishing. Most patients benefit from a cleaning every six to twelve months.",
    category: "Preventive",
    price_from: 1200,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 45,
    active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s4",
    name: "Dental Fillings",
    slug: "dental-fillings",
    description: "Tooth-coloured restorations for decay and small fractures.",
    long_description:
      "Composite fillings restore the shape and function of a damaged tooth and are shade-matched to the surrounding enamel.",
    category: "Restorative",
    price_from: 1500,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 45,
    active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s5",
    name: "Root Canal Treatment",
    slug: "root-canal-treatment",
    description: "Treatment for infected or badly damaged tooth pulp.",
    long_description:
      "Root canal treatment removes infected pulp, disinfects the canal system and seals the tooth. It is usually completed in one or two visits under local anaesthetic.",
    category: "Restorative",
    price_from: 4500,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 90,
    active: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s6",
    name: "Dental Crowns",
    slug: "dental-crowns",
    description: "Full-coverage restorations for weakened or treated teeth.",
    long_description:
      "A crown protects a tooth that has lost significant structure. We offer ceramic and zirconia options depending on position and aesthetics.",
    category: "Restorative",
    price_from: 6000,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 60,
    active: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s7",
    name: "Dental Bridges",
    slug: "dental-bridges",
    description: "A fixed replacement for one or more missing teeth.",
    long_description:
      "A bridge uses adjacent teeth to support a fixed replacement, restoring chewing and appearance without a removable appliance.",
    category: "Restorative",
    price_from: 6000,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 60,
    active: true,
    sort_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s8",
    name: "Dental Implants",
    slug: "dental-implants",
    description: "A long-term replacement for a missing tooth root.",
    long_description:
      "Implant treatment places a titanium fixture in the jawbone, which later supports a crown. Treatment is planned across several appointments with healing time in between.",
    category: "Surgical",
    price_from: 30000,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 90,
    active: true,
    sort_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s9",
    name: "Teeth Whitening",
    slug: "teeth-whitening",
    description: "Professionally supervised whitening for a brighter smile.",
    long_description:
      "In-clinic whitening lightens the natural shade of your teeth under supervision, with take-home maintenance options. Results vary between individuals.",
    category: "Cosmetic",
    price_from: 7500,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 60,
    active: true,
    sort_order: 9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s10",
    name: "Clear Aligners",
    slug: "clear-aligners",
    description: "Discreet, removable orthodontic treatment.",
    long_description:
      "Clear aligners gradually move teeth using a series of custom trays. Suitability depends on the complexity of the case and is assessed at consultation.",
    category: "Orthodontics",
    price_from: 35000,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 45,
    active: true,
    sort_order: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s11",
    name: "Cosmetic Dentistry",
    slug: "cosmetic-dentistry",
    description: "Treatments focused on the appearance of your smile.",
    long_description:
      "Cosmetic dentistry spans whitening, bonding, veneers and contouring. Every plan begins with a discussion of what you would like to change.",
    category: "Cosmetic",
    price_from: 7500,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 45,
    active: true,
    sort_order: 11,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s12",
    name: "Smile Makeovers",
    slug: "smile-makeovers",
    description: "A combined plan tailored to your goals.",
    long_description:
      "A smile makeover coordinates several treatments into one sequenced plan, with previews and staged approvals so you know what to expect.",
    category: "Cosmetic",
    price_from: 25000,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 60,
    active: true,
    sort_order: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s13",
    name: "Gum Treatment",
    slug: "gum-treatment",
    description: "Care for bleeding, receding or inflamed gums.",
    long_description:
      "Gum treatment ranges from deep cleaning to maintenance programmes. Early treatment is the most effective way to protect the bone that supports your teeth.",
    category: "Preventive",
    price_from: 2500,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 60,
    active: true,
    sort_order: 13,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s14",
    name: "Wisdom Tooth Consultation",
    slug: "wisdom-tooth-consultation",
    description: "Assessment and advice on wisdom teeth.",
    long_description:
      "Not every wisdom tooth needs removal. We assess position, symptoms and risk, then explain the options — including doing nothing.",
    category: "Surgical",
    price_from: 800,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 30,
    active: true,
    sort_order: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s15",
    name: "Pediatric Dentistry",
    slug: "pediatric-dentistry",
    description: "Gentle dental care for children.",
    long_description:
      "Child-friendly appointments focused on comfort, prevention and building good habits early.",
    category: "Pediatric",
    price_from: 800,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 30,
    active: true,
    sort_order: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "s16",
    name: "Preventive Dentistry",
    slug: "preventive-dentistry",
    description: "Sealants, fluoride and habit guidance.",
    long_description:
      "Preventive care is the least expensive dentistry there is. We focus on protecting healthy teeth rather than repairing them later.",
    category: "Preventive",
    price_from: 1200,
    price_note: "Fictional portfolio pricing",
    duration_minutes: 30,
    active: true,
    sort_order: 16,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_FAQS: FaqRecord[] = [
  {
    id: "f1",
    question: "Do I need an appointment or can I walk in?",
    answer:
      "We work by appointment so that each patient gets unhurried time. You can request an appointment on this website or call the clinic during opening hours.",
    category: "Appointments",
    sort_order: 1,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f2",
    question: "How do I know my appointment is confirmed?",
    answer:
      "Submitting the form creates an appointment request. Our reception team reviews it against the schedule and confirms your slot by phone or email. A request is not a confirmed booking until you hear from us.",
    category: "Appointments",
    sort_order: 2,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f3",
    question: "What are your opening hours?",
    answer:
      "Monday to Friday 9:00 AM – 7:00 PM, Saturday 10:00 AM – 5:00 PM. We are closed on Sunday. All times are Asia/Kolkata.",
    category: "Clinic",
    sort_order: 3,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f4",
    question: "Where are you located and is parking available?",
    answer:
      "24, Green Park Avenue, Sector 18, New Delhi 110018. Street parking is available on Green Park Avenue and there is a small visitor bay at the entrance of the building.",
    category: "Clinic",
    sort_order: 4,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f5",
    question: "What payment methods do you accept?",
    answer:
      "Cash, UPI, debit and credit cards. Multi-visit treatments can be paid in stages as treatment progresses.",
    category: "Payments",
    sort_order: 5,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f6",
    question: "How much does a consultation cost?",
    answer:
      "A consultation is ₹800. All prices on this site are fictional portfolio figures for a demonstration project.",
    category: "Payments",
    sort_order: 6,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f7",
    question: "Do you handle dental emergencies?",
    answer:
      "Emergency requests are accepted during operating hours. Call the clinic directly and describe the problem — we keep time aside each day for urgent cases.",
    category: "Emergencies",
    sort_order: 7,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f8",
    question: "Is teeth whitening safe?",
    answer:
      "Professionally supervised whitening is generally well tolerated. Sensitivity can occur and usually settles. Suitability is assessed at your appointment.",
    category: "Treatments",
    sort_order: 8,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f9",
    question: "How long do clear aligners take?",
    answer:
      "Treatment length depends on the case, commonly several months to over a year. An assessment is needed before any estimate can be given.",
    category: "Treatments",
    sort_order: 9,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "f10",
    question: "Can I bring my child?",
    answer:
      "Yes. We offer pediatric appointments and are happy to see families together where the schedule allows.",
    category: "Clinic",
    sort_order: 10,
    active: true,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_KNOWLEDGE_BASE: KnowledgeBaseRecord[] = [
  {
    id: "kb1",
    topic: "clinic_overview",
    title: "About SmileCraft Dental Studio",
    content:
      "SmileCraft Dental Studio is a fictional multi-specialty dental clinic established in 2018 in New Delhi, India. Tagline: Modern Dentistry. Personal Care. This is a portfolio demonstration project; the clinic, staff, pricing and testimonials are fictional.",
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "kb2",
    topic: "opening_hours",
    title: "Opening hours",
    content:
      "Monday to Friday: 9:00 AM to 7:00 PM. Saturday: 10:00 AM to 5:00 PM. Sunday: closed. Timezone Asia/Kolkata. Emergency appointment requests are accepted during operating hours only.",
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "kb3",
    topic: "location",
    title: "Location and directions",
    content:
      "24, Green Park Avenue, Sector 18, New Delhi, Delhi 110018, India. This address is fictional.",
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "kb4",
    topic: "parking",
    title: "Parking",
    content:
      "Street parking is available on Green Park Avenue, plus a small visitor bay at the building entrance. There is no dedicated multi-level car park.",
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "kb5",
    topic: "payments",
    title: "Payment methods",
    content:
      "We accept cash, UPI, debit cards and credit cards. Longer treatment plans can be paid in stages as treatment progresses. We do not process insurance claims in this demonstration project.",
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "kb6",
    topic: "appointment_policy",
    title: "Appointment policy",
    content:
      "Choosing a preferred date and time creates an appointment REQUEST, not a confirmed booking. Reception reviews every request against the live schedule and confirms by phone or email. Please give at least 24 hours notice to reschedule or cancel.",
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "kb7",
    topic: "emergencies",
    title: "Emergency care",
    content:
      "Urgent dental problems such as severe pain, swelling or trauma should be raised by phone during operating hours. For a medical emergency or significant facial swelling affecting breathing or swallowing, seek immediate hospital care rather than a dental appointment.",
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "kb8",
    topic: "dentist",
    title: "Lead dentist",
    content:
      "Dr. Aarav Mehta, BDS, MDS, is the fictional founder and lead dentist. Specialization: cosmetic and restorative dentistry. Experience: 10+ years. Languages: English and Hindi. All credentials are fictional.",
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "kb9",
    topic: "contact",
    title: "Contact details",
    content:
      "Phone and WhatsApp: +91 98765 43210. General email: hello@smilecraftdental.example. Appointments email: appointments@smilecraftdental.example.",
    is_public: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "kb10",
    topic: "pricing_note",
    title: "Pricing disclaimer",
    content:
      "All prices shown are fictional portfolio figures used to demonstrate the product. Real treatment costs depend on clinical assessment.",
    is_public: true,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_LEADS: LeadRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    first_name: "Rahul",
    last_name: "Kapoor",
    email: "rahul.kapoor@example.com",
    phone: "+91 90000 00001",
    treatment_interest: "Dental Implants",
    patient_type: "new",
    reason: "Missing lower molar, asking about implant options and cost.",
    urgency: "soon",
    intent: "high_intent",
    status: "new",
    source: "ai_assistant",
    conversation_summary:
      "Visitor asked about implants and healing time. Shared indicative pricing and recommended a consultation.",
    last_contacted_at: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    first_name: "Priya",
    last_name: "Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 90000 00002",
    treatment_interest: "Professional Teeth Cleaning",
    patient_type: "existing",
    reason: "Routine cleaning, mild gum bleeding when brushing.",
    urgency: "routine",
    intent: "considering",
    status: "contacted",
    source: "website_form",
    conversation_summary: "Returning patient requesting a routine cleaning appointment.",
    last_contacted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    first_name: "Ananya",
    last_name: "Verma",
    email: "ananya.verma@example.com",
    phone: "+91 90000 00003",
    treatment_interest: "Clear Aligners",
    patient_type: "new",
    reason: "Crowding in upper front teeth, prefers a discreet option.",
    urgency: "routine",
    intent: "high_intent",
    status: "booked",
    source: "ai_assistant",
    conversation_summary:
      "Discussed aligners versus braces, then requested an assessment appointment.",
    last_contacted_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: "app-1",
    lead_id: "22222222-2222-4222-8222-222222222222",
    service_id: "s3",
    appointment_date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0]!,
    appointment_time: "11:00",
    duration_minutes: 45,
    status: "confirmed",
    notes: "Routine cleaning. Check gum bleeding.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "app-2",
    lead_id: "33333333-3333-4333-8333-333333333333",
    service_id: "s10",
    appointment_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]!,
    appointment_time: "15:30",
    duration_minutes: 45,
    status: "requested",
    notes: "Aligner suitability assessment.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// In-memory data store
const store: Record<string, any[]> = {
  services: [...INITIAL_SERVICES],
  faqs: [...INITIAL_FAQS],
  knowledge_base: [...INITIAL_KNOWLEDGE_BASE],
  leads: [...INITIAL_LEADS],
  appointments: [...INITIAL_APPOINTMENTS],
  blocked_slots: [],
  rate_limit_hits: [],
  activity_logs: [],
  outbox_events: [],
  follow_up_jobs: [],
};

class MockQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private sortFn: ((a: any, b: any) => number) | null = null;
  private limitCount: number | null = null;
  private selectedFields: string[] | null = null;
  private isCountOnly = false;

  constructor(table: string) {
    this.table = table;
    if (!store[table]) {
      store[table] = [];
    }
  }

  select(fields?: string, options?: { count?: string; head?: boolean }) {
    if (options?.head || options?.count) {
      this.isCountOnly = true;
    }
    if (fields && fields !== "*") {
      this.selectedFields = fields.split(",").map((s) => s.trim());
    }
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item) => item[column] !== value);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((item) => values.includes(item[column]));
    return this;
  }

  or(conditionString: string) {
    // Basic parser for "email.eq.xyz,phone.eq.abc"
    const parts = conditionString.split(",");
    this.filters.push((item) => {
      return parts.some((p) => {
        const [col, op, val] = p.split(".");
        if (op === "eq" && col && val) {
          return String(item[col]) === String(val);
        }
        return false;
      });
    });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item) => item[column] >= value);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((item) => item[column] <= value);
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((item) => item[column] > value);
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push((item) => item[column] < value);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending !== false;
    this.sortFn = (a, b) => {
      if (a[column] < b[column]) return asc ? -1 : 1;
      if (a[column] > b[column]) return asc ? 1 : -1;
      return 0;
    };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  private execute() {
    let items = (store[this.table] ?? []).filter((item) => {
      return this.filters.every((fn) => fn(item));
    });

    if (this.sortFn) {
      items = [...items].sort(this.sortFn);
    }

    if (this.limitCount !== null) {
      items = items.slice(0, this.limitCount);
    }

    if (this.selectedFields && !this.isCountOnly) {
      items = items.map((item) => {
        const res: Record<string, any> = {};
        for (const f of this.selectedFields!) {
          res[f] = item[f];
        }
        return res;
      });
    }

    return items;
  }

  async then(resolve: (result: { data: any[] | null; count: number | null; error: null }) => any) {
    const data = this.execute();
    return resolve({
      data: this.isCountOnly ? null : data,
      count: data.length,
      error: null,
    });
  }

  async maybeSingle() {
    const data = this.execute();
    return { data: data[0] ?? null, error: null };
  }

  async single() {
    const data = this.execute();
    return { data: data[0] ?? null, error: null };
  }

  insert(values: any | any[]) {
    const rows = Array.isArray(values) ? values : [values];
    const created: any[] = [];
    for (const r of rows) {
      const item = {
        id: r.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...r,
      };
      store[this.table]!.push(item);
      created.push(item);
    }

    return {
      select: (_fields?: string) => ({
        single: async () => ({ data: created[0] ?? null, error: null }),
        maybeSingle: async () => ({ data: created[0] ?? null, error: null }),
        then: async (resolve: any) => resolve({ data: created, error: null }),
      }),
      then: async (resolve: any) => resolve({ data: created, error: null }),
    };
  }

  update(patch: Record<string, any>) {
    return {
      eq: (column: string, value: any) => {
        const tableData = store[this.table] ?? [];
        for (const item of tableData) {
          if (item[column] === value) {
            Object.assign(item, patch, { updated_at: new Date().toISOString() });
          }
        }
        return {
          then: async (resolve: any) => resolve({ data: null, error: null }),
        };
      },
      then: async (resolve: any) => resolve({ data: null, error: null }),
    };
  }

  delete() {
    return {
      eq: (column: string, value: any) => {
        store[this.table] = (store[this.table] ?? []).filter((item) => item[column] !== value);
        return {
          then: async (resolve: any) => resolve({ data: null, error: null }),
        };
      },
      lt: (column: string, value: any) => {
        store[this.table] = (store[this.table] ?? []).filter((item) => !(item[column] < value));
        return {
          then: async (resolve: any) => resolve({ data: null, error: null }),
        };
      },
      then: async (resolve: any) => resolve({ data: null, error: null }),
    };
  }
}

export function createMockSupabaseClient() {
  const getStoredSession = () => {
    if (typeof window === "undefined") return null;
    try {
      const s = window.localStorage.getItem("smilecraft_mock_session");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  };

  const setStoredSession = (session: any) => {
    if (typeof window === "undefined") return;
    try {
      if (session) {
        window.localStorage.setItem("smilecraft_mock_session", JSON.stringify(session));
      } else {
        window.localStorage.removeItem("smilecraft_mock_session");
      }
    } catch {
      // ignore storage access errors in restricted iframe contexts
    }
  };

  return {
    from: (table: string) => new MockQueryBuilder(table),
    auth: {
      getSession: async () => {
        const session = getStoredSession();
        return { data: { session }, error: null };
      },
      getUser: async () => {
        const session = getStoredSession();
        return { data: { user: session?.user ?? null }, error: null };
      },
      getClaims: async (_token?: string) => ({ data: { claims: null }, error: null }),
      onAuthStateChange: (callback: any) => {
        const session = getStoredSession();
        if (session) {
          setTimeout(() => callback("SIGNED_IN", session), 0);
        }
        return {
          data: { subscription: { unsubscribe: () => {} } },
        };
      },
      signInWithPassword: async ({ email, password }: any) => {
        if (
          email?.toLowerCase().trim() === "receptionist@smilecraftdental.example" &&
          password === "DemoPassword123!"
        ) {
          const user = {
            id: "11111111-1111-4111-8111-111111111111",
            email: "receptionist@smilecraftdental.example",
            user_metadata: { full_name: "Staff Receptionist" },
            role: "authenticated",
          };
          const session = {
            access_token: "mock-jwt-token-receptionist-portfolio",
            user,
            expires_at: Math.floor(Date.now() / 1000) + 86400,
          };
          setStoredSession(session);
          return { data: { user, session }, error: null };
        }
        return {
          data: { user: null, session: null },
          error: new Error(
            "Invalid credentials. Please use receptionist@smilecraftdental.example and DemoPassword123!",
          ),
        };
      },
      signOut: async () => {
        setStoredSession(null);
        return { error: null };
      },
    },
  } as any;
}
