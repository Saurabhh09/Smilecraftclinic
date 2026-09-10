-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','receptionist','dentist');
CREATE TYPE public.lead_status AS ENUM ('new','contacted','qualified','booked','completed','lost');
CREATE TYPE public.lead_intent AS ENUM ('high_intent','considering','information_only');
CREATE TYPE public.appointment_status AS ENUM ('requested','confirmed','rescheduled','completed','cancelled','no_show');
CREATE TYPE public.urgency_level AS ENUM ('routine','soon','urgent','emergency');
CREATE TYPE public.patient_type AS ENUM ('new','existing','unknown');
CREATE TYPE public.outbox_status AS ENUM ('pending','delivered','failed','dead');

-- ============ SHARED FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ROLES ============
CREATE TABLE public.staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.staff_roles TO authenticated;
GRANT ALL ON public.staff_roles TO service_role;
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = _user_id);
$$;

CREATE POLICY "staff read roles" ON public.staff_roles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "admins manage roles" ON public.staff_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- new signups get a profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, COALESCE(NEW.email,''), COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SERVICES ============
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  price_from INTEGER,
  price_note TEXT NOT NULL DEFAULT 'Fictional portfolio pricing',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active services" ON public.services FOR SELECT TO anon USING (active);
CREATE POLICY "staff read services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_services_active ON public.services(active, sort_order);

-- ============ FAQS ============
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read faqs" ON public.faqs FOR SELECT TO anon USING (active);
CREATE POLICY "staff read faqs" ON public.faqs FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage faqs" ON public.faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_faqs_updated BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ KNOWLEDGE BASE ============
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_base TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_base TO authenticated;
GRANT ALL ON public.knowledge_base TO service_role;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read kb" ON public.knowledge_base FOR SELECT TO anon USING (is_public);
CREATE POLICY "staff read kb" ON public.knowledge_base FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage kb" ON public.knowledge_base FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_kb_updated BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ LEADS ============
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT NOT NULL,
  treatment_interest TEXT,
  patient_type public.patient_type NOT NULL DEFAULT 'unknown',
  reason TEXT,
  urgency public.urgency_level NOT NULL DEFAULT 'routine',
  intent public.lead_intent NOT NULL DEFAULT 'considering',
  status public.lead_status NOT NULL DEFAULT 'new',
  source TEXT NOT NULL DEFAULT 'website',
  conversation_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_contacted_at TIMESTAMPTZ,
  CONSTRAINT leads_phone_len CHECK (char_length(phone) BETWEEN 6 AND 24),
  CONSTRAINT leads_first_name_len CHECK (char_length(first_name) BETWEEN 1 AND 80)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read leads" ON public.leads FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "reception manage leads" ON public.leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'receptionist'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'receptionist'));
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_leads_status ON public.leads(status, created_at DESC);
CREATE INDEX idx_leads_phone ON public.leads(phone);

-- ============ BLOCKED SLOTS ============
CREATE TABLE public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT blocked_slots_range CHECK (end_time > start_time)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_slots TO authenticated;
GRANT ALL ON public.blocked_slots TO service_role;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read blocked" ON public.blocked_slots FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "admins manage blocked" ON public.blocked_slots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_blocked_date ON public.blocked_slots(date);

-- ============ APPOINTMENTS ============
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status public.appointment_status NOT NULL DEFAULT 'requested',
  notes TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read appointments" ON public.appointments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "reception manage appointments" ON public.appointments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'receptionist'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'receptionist'));
CREATE POLICY "dentist update appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'dentist')) WITH CHECK (public.has_role(auth.uid(),'dentist'));
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- prevent double booking of an active slot (race-condition safe)
CREATE UNIQUE INDEX idx_appointments_slot_unique ON public.appointments(appointment_date, appointment_time)
  WHERE status IN ('requested','confirmed','rescheduled');
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date, appointment_time);
CREATE INDEX idx_appointments_lead ON public.appointments(lead_id);

-- ============ CONVERSATIONS / MESSAGES ============
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'open',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read conversations" ON public.conversations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER trg_conv_updated BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read messages" ON public.messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at);

-- ============ FOLLOW UP JOBS ============
CREATE TABLE public.follow_up_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.follow_up_jobs TO authenticated;
GRANT ALL ON public.follow_up_jobs TO service_role;
ALTER TABLE public.follow_up_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read followups" ON public.follow_up_jobs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX idx_followups_due ON public.follow_up_jobs(status, scheduled_for);

-- ============ ACTIVITY LOGS (append-only) ============
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read activity" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX idx_activity_created ON public.activity_logs(created_at DESC);

-- ============ OUTBOX EVENTS ============
CREATE TABLE public.outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.outbox_status NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.outbox_events TO authenticated;
GRANT ALL ON public.outbox_events TO service_role;
ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read outbox" ON public.outbox_events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE INDEX idx_outbox_pending ON public.outbox_events(status, next_attempt_at);

-- ============ RATE LIMIT COUNTERS (durable, not in-memory) ============
CREATE TABLE public.rate_limit_hits (
  id BIGSERIAL PRIMARY KEY,
  bucket TEXT NOT NULL,
  identifier_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.rate_limit_hits TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.rate_limit_hits_id_seq TO service_role;
ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_rate_limit_lookup ON public.rate_limit_hits(bucket, identifier_hash, created_at DESC);

-- ============ SEED: SERVICES ============
INSERT INTO public.services (name, slug, description, long_description, category, price_from, duration_minutes, sort_order) VALUES
('General Dentistry','general-dentistry','Routine care that keeps your teeth and gums healthy year round.','General dentistry covers everyday oral health: examinations, cleanings, small restorations and preventive advice. Our approach is conservative — we treat what needs treating and explain why.','General',800,30,1),
('Dental Check-ups','dental-check-ups','A thorough examination with clear, jargon-free findings.','A check-up includes an oral examination, screening of the gums and soft tissues, and a written summary of findings with options and indicative costs before anything is scheduled.','General',800,30,2),
('Professional Teeth Cleaning','teeth-cleaning','Scaling and polishing to remove plaque and surface stains.','Professional cleaning removes hardened plaque that brushing cannot reach, followed by polishing. Most patients benefit from a cleaning every six to twelve months.','Preventive',1200,45,3),
('Dental Fillings','dental-fillings','Tooth-coloured restorations for decay and small fractures.','Composite fillings restore the shape and function of a damaged tooth and are shade-matched to the surrounding enamel.','Restorative',1500,45,4),
('Root Canal Treatment','root-canal-treatment','Treatment for infected or badly damaged tooth pulp.','Root canal treatment removes infected pulp, disinfects the canal system and seals the tooth. It is usually completed in one or two visits under local anaesthetic.','Restorative',4500,90,5),
('Dental Crowns','dental-crowns','Full-coverage restorations for weakened or treated teeth.','A crown protects a tooth that has lost significant structure. We offer ceramic and zirconia options depending on position and aesthetics.','Restorative',6000,60,6),
('Dental Bridges','dental-bridges','A fixed replacement for one or more missing teeth.','A bridge uses adjacent teeth to support a fixed replacement, restoring chewing and appearance without a removable appliance.','Restorative',6000,60,7),
('Dental Implants','dental-implants','A long-term replacement for a missing tooth root.','Implant treatment places a titanium fixture in the jawbone, which later supports a crown. Treatment is planned across several appointments with healing time in between.','Surgical',30000,90,8),
('Teeth Whitening','teeth-whitening','Professionally supervised whitening for a brighter smile.','In-clinic whitening lightens the natural shade of your teeth under supervision, with take-home maintenance options. Results vary between individuals.','Cosmetic',7500,60,9),
('Clear Aligners','clear-aligners','Discreet, removable orthodontic treatment.','Clear aligners gradually move teeth using a series of custom trays. Suitability depends on the complexity of the case and is assessed at consultation.','Orthodontics',35000,45,10),
('Cosmetic Dentistry','cosmetic-dentistry','Treatments focused on the appearance of your smile.','Cosmetic dentistry spans whitening, bonding, veneers and contouring. Every plan begins with a discussion of what you would like to change.','Cosmetic',7500,45,11),
('Smile Makeovers','smile-makeovers','A combined plan tailored to your goals.','A smile makeover coordinates several treatments into one sequenced plan, with previews and staged approvals so you know what to expect.','Cosmetic',25000,60,12),
('Gum Treatment','gum-treatment','Care for bleeding, receding or inflamed gums.','Gum treatment ranges from deep cleaning to maintenance programmes. Early treatment is the most effective way to protect the bone that supports your teeth.','Preventive',2500,60,13),
('Wisdom Tooth Consultation','wisdom-tooth-consultation','Assessment and advice on wisdom teeth.','Not every wisdom tooth needs removal. We assess position, symptoms and risk, then explain the options — including doing nothing.','Surgical',800,30,14),
('Pediatric Dentistry','pediatric-dentistry','Gentle dental care for children.','Child-friendly appointments focused on comfort, prevention and building good habits early.','Pediatric',800,30,15),
('Preventive Dentistry','preventive-dentistry','Sealants, fluoride and habit guidance.','Preventive care is the least expensive dentistry there is. We focus on protecting healthy teeth rather than repairing them later.','Preventive',1200,30,16);

-- ============ SEED: FAQS ============
INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
('Do I need an appointment or can I walk in?','We work by appointment so that each patient gets unhurried time. You can request an appointment on this website or call the clinic during opening hours.','Appointments',1),
('How do I know my appointment is confirmed?','Submitting the form creates an appointment request. Our reception team reviews it against the schedule and confirms your slot by phone or email. A request is not a confirmed booking until you hear from us.','Appointments',2),
('What are your opening hours?','Monday to Friday 9:00 AM – 7:00 PM, Saturday 10:00 AM – 5:00 PM. We are closed on Sunday. All times are Asia/Kolkata.','Clinic',3),
('Where are you located and is parking available?','24, Green Park Avenue, Sector 18, New Delhi 110018. Street parking is available on Green Park Avenue and there is a small visitor bay at the entrance of the building.','Clinic',4),
('What payment methods do you accept?','Cash, UPI, debit and credit cards. Multi-visit treatments can be paid in stages as treatment progresses.','Payments',5),
('How much does a consultation cost?','A consultation is ₹800. All prices on this site are fictional portfolio figures for a demonstration project.','Payments',6),
('Do you handle dental emergencies?','Emergency requests are accepted during operating hours. Call the clinic directly and describe the problem — we keep time aside each day for urgent cases.','Emergencies',7),
('Is teeth whitening safe?','Professionally supervised whitening is generally well tolerated. Sensitivity can occur and usually settles. Suitability is assessed at your appointment.','Treatments',8),
('How long do clear aligners take?','Treatment length depends on the case, commonly several months to over a year. An assessment is needed before any estimate can be given.','Treatments',9),
('Can I bring my child?','Yes. We offer pediatric appointments and are happy to see families together where the schedule allows.','Clinic',10);

-- ============ SEED: KNOWLEDGE BASE ============
INSERT INTO public.knowledge_base (topic, title, content) VALUES
('clinic_overview','About SmileCraft Dental Studio','SmileCraft Dental Studio is a fictional multi-specialty dental clinic established in 2018 in New Delhi, India. Tagline: Modern Dentistry. Personal Care. This is a portfolio demonstration project; the clinic, staff, pricing and testimonials are fictional.'),
('opening_hours','Opening hours','Monday to Friday: 9:00 AM to 7:00 PM. Saturday: 10:00 AM to 5:00 PM. Sunday: closed. Timezone Asia/Kolkata. Emergency appointment requests are accepted during operating hours only.'),
('location','Location and directions','24, Green Park Avenue, Sector 18, New Delhi, Delhi 110018, India. This address is fictional.'),
('parking','Parking','Street parking is available on Green Park Avenue, plus a small visitor bay at the building entrance. There is no dedicated multi-level car park.'),
('payments','Payment methods','We accept cash, UPI, debit cards and credit cards. Longer treatment plans can be paid in stages as treatment progresses. We do not process insurance claims in this demonstration project.'),
('appointment_policy','Appointment policy','Choosing a preferred date and time creates an appointment REQUEST, not a confirmed booking. Reception reviews every request against the live schedule and confirms by phone or email. Please give at least 24 hours notice to reschedule or cancel.'),
('emergencies','Emergency care','Urgent dental problems such as severe pain, swelling or trauma should be raised by phone during operating hours. For a medical emergency or significant facial swelling affecting breathing or swallowing, seek immediate hospital care rather than a dental appointment.'),
('dentist','Lead dentist','Dr. Aarav Mehta, BDS, MDS, is the fictional founder and lead dentist. Specialization: cosmetic and restorative dentistry. Experience: 10+ years. Languages: English and Hindi. All credentials are fictional.'),
('contact','Contact details','Phone and WhatsApp: +91 98765 43210. General email: hello@smilecraftdental.example. Appointments email: appointments@smilecraftdental.example.'),
('pricing_note','Pricing disclaimer','All prices shown are fictional portfolio figures used to demonstrate the product. Real treatment costs depend on clinical assessment.');

-- ============ SEED: DEMO LEADS + APPOINTMENTS ============
INSERT INTO public.leads (id, first_name, last_name, email, phone, treatment_interest, patient_type, reason, urgency, intent, status, source, conversation_summary, last_contacted_at) VALUES
('11111111-1111-4111-8111-111111111111','Rahul','Kapoor','rahul.kapoor@example.com','+91 90000 00001','Dental Implants','new','Missing lower molar, asking about implant options and cost.','soon','high_intent','new','ai_assistant','Visitor asked about implants and healing time. Shared indicative pricing and recommended a consultation.',NULL),
('22222222-2222-4222-8222-222222222222','Priya','Sharma','priya.sharma@example.com','+91 90000 00002','Professional Teeth Cleaning','existing','Routine cleaning, mild gum bleeding when brushing.','routine','considering','contacted','website_form','Returning patient requesting a routine cleaning appointment.',now() - interval '2 days'),
('33333333-3333-4333-8333-333333333333','Ananya','Verma','ananya.verma@example.com','+91 90000 00003','Clear Aligners','new','Crowding in upper front teeth, prefers a discreet option.','routine','high_intent','booked','ai_assistant','Discussed aligners versus braces, then requested an assessment appointment.',now() - interval '1 day');

INSERT INTO public.appointments (lead_id, service_id, appointment_date, appointment_time, duration_minutes, status, notes)
SELECT '22222222-2222-4222-8222-222222222222', s.id, (CURRENT_DATE + 5), '11:00', 45, 'confirmed', 'Routine cleaning. Check gum bleeding.'
FROM public.services s WHERE s.slug = 'teeth-cleaning';

INSERT INTO public.appointments (lead_id, service_id, appointment_date, appointment_time, duration_minutes, status, notes)
SELECT '33333333-3333-4333-8333-333333333333', s.id, (CURRENT_DATE + 7), '15:30', 45, 'requested', 'Aligner suitability assessment.'
FROM public.services s WHERE s.slug = 'clear-aligners';

INSERT INTO public.activity_logs (lead_id, action, metadata) VALUES
('11111111-1111-4111-8111-111111111111','lead.created','{"source":"ai_assistant"}'::jsonb),
('22222222-2222-4222-8222-222222222222','lead.status_changed','{"from":"new","to":"contacted"}'::jsonb),
('33333333-3333-4333-8333-333333333333','appointment.requested','{"service":"Clear Aligners"}'::jsonb);
