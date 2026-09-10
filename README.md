# SmileCraft Connect

# SMILECRAFT DENTAL STUDIO

## Production-Quality Full-Stack Dental Website + Lead Conversion + Appointment Management System

You are a senior product designer, UI/UX designer, full-stack engineer, security engineer, and software architect with extensive experience building production websites and business systems for local service businesses.

Build a complete, production-quality fictional dental clinic website and internal clinic management system for **SmileCraft Dental Studio**.

This is a portfolio project, but it will be deployed publicly. Therefore, **do not treat security, accessibility, reliability, performance, or data architecture as optional polish.**

The goal is not to create a generic dental website.

The goal is to demonstrate a complete business system:

**Visitor → Lead → Qualification → Appointment Request → Staff Management → Automation → Follow-up → Analytics**

The public website should generate business opportunities, while the authenticated staff application should help the fictional clinic manage those opportunities.

---

# 1. IMPORTANT ARCHITECTURE RULE

Do NOT attempt to build or configure the actual n8n workflows inside Lovable.

Lovable should build the application, database integration, authentication, APIs, workflow event contracts, and webhook endpoints required for n8n.

n8n will be connected separately after the application is working.

The application must therefore expose clean, documented integration points for n8n.

### Responsibility separation

**Next.js**

- Frontend
- Server-side application logic
- API routes
- Authentication checks
- Authorization
- Validation
- Appointment business rules
- AI orchestration
- Webhook endpoints
- Security controls

**Supabase**

- PostgreSQL database
- Authentication
- Row Level Security
- Persistent application data

**n8n**

- External automation
- Notifications
- Email/SMS/WhatsApp integrations
- Delayed follow-ups
- Appointment reminders
- Post-appointment workflows

**AI**

- Conversational receptionist
- FAQ assistance
- Lead qualification
- Appointment-request assistance
- Controlled backend tool calls

**Vercel**

- Production deployment
- CDN/edge delivery
- Serverless infrastructure
- HTTPS
- Static asset delivery

Do not make n8n the primary backend or database.

---

# 2. TECH STACK

Use this architecture unless a specific technical constraint requires a better equivalent.

### Frontend / Full-stack

Next.js  
React  
TypeScript  
App Router

### Styling

Tailwind CSS

### UI components

shadcn/ui or another accessible component system where useful.

### Database

Supabase PostgreSQL

### Authentication

Supabase Auth

### Authorization

Supabase Row Level Security

### Backend

Next.js Server Actions and Route Handlers where appropriate.

### AI

Secure server-side LLM API integration.

### Automation

n8n, integrated later through secure webhooks.

### Hosting

Vercel

### Version control

GitHub

Do not introduce unnecessary technologies.

---

# 3. FICTIONAL BUSINESS INFORMATION

## Clinic

**Name:** SmileCraft Dental Studio

**Tagline:** Modern Dentistry. Personal Care.

**Type:** Multi-specialty Dental Clinic

**Established:** 2018

**Location:** New Delhi, India

**Address:**

24, Green Park Avenue  
Sector 18, New Delhi  
Delhi 110018  
India

This address is fictional.

## Contact

**Phone:** +91 98765 43210

**WhatsApp:** +91 98765 43210

**Email:** hello@smilecraftdental.example

**Appointments:** appointments@smilecraftdental.example

**Website:** smilecraftdental.example

Use `.example` domains for fictional addresses.

---

# 4. OPENING HOURS

Monday — 9:00 AM – 7:00 PM  
Tuesday — 9:00 AM – 7:00 PM  
Wednesday — 9:00 AM – 7:00 PM  
Thursday — 9:00 AM – 7:00 PM  
Friday — 9:00 AM – 7:00 PM  
Saturday — 10:00 AM – 5:00 PM  
Sunday — Closed

Timezone:

**Asia/Kolkata**

Emergency appointment requests are accepted during operating hours.

---

# 5. LEAD DENTIST

**Dr. Aarav Mehta**

BDS, MDS

**Specialization:** Cosmetic & Restorative Dentistry

**Experience:** 10+ years

**Languages:** English, Hindi

### Biography

Dr. Aarav Mehta is the fictional founder and lead dentist of SmileCraft Dental Studio. His practice focuses on cosmetic, restorative, and preventive dentistry, with an emphasis on personalized treatment planning, clear communication, and patient comfort.

All credentials, biography information, and professional claims are fictional.

---

# 6. SERVICES

Create these as database-backed services rather than hardcoded frontend-only content.

- General Dentistry
- Dental Check-ups
- Professional Teeth Cleaning
- Dental Fillings
- Root Canal Treatment
- Dental Crowns
- Dental Bridges
- Dental Implants
- Teeth Whitening
- Clear Aligners
- Cosmetic Dentistry
- Smile Makeovers
- Gum Treatment
- Wisdom Tooth Consultation
- Pediatric Dentistry
- Preventive Dentistry

### Fictional pricing

Consultation — ₹800  
Dental Cleaning — ₹1,200  
Dental Filling — From ₹1,500  
Root Canal Treatment — From ₹4,500  
Dental Crown — From ₹6,000  
Teeth Whitening — From ₹7,500  
Clear Aligners — From ₹35,000  
Dental Implant — From ₹30,000  
Smile Makeover — From ₹25,000

Clearly mark these as fictional portfolio pricing.

---

# 7. PUBLIC WEBSITE ROUTES

Create:

`/`

`/services`

`/services/[slug]`

`/about`

`/contact`

`/book-appointment`

`/faq`

`/staff/login`

`/staff/dashboard`

Protect all staff routes.

The public website must not expose internal clinic information or dashboard data.

---

# 8. PUBLIC WEBSITE GOAL

The primary business goal is appointment conversion.

Primary CTA:

**Book an Appointment**

Secondary CTAs:

**Explore Treatments**

**Talk to Our Assistant**

**Contact Clinic**

Do not use manipulative conversion patterns.

Make the website feel like a premium local dental practice rather than an AI demo.

---

# 9. DESIGN SYSTEM

Visual direction:

- Premium
- Modern
- Minimal
- Trustworthy
- Warm
- Professional
- Healthcare-focused
- Spacious
- High readability

Use:

- Off-white
- Deep navy
- Soft teal
- Light gray
- White

Use refined typography and strong hierarchy.

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Neon colors
- Over-animation
- Generic SaaS styling
- Template-like sections
- Decorative elements that reduce usability

Use subtle motion only where it improves interaction.

Respect `prefers-reduced-motion`.

---

# 10. FICTIONAL TRUST DATA

Use:

**8+ Years** — Established

**5,000+** — Patient Visits

**15+** — Treatment Categories

**10+ Years** — Dentist Experience

Clearly indicate these are fictional portfolio data.

Do not create fake verified review counts, Google ratings, awards, or certifications.

---

# 11. FICTIONAL TESTIMONIALS

Use concept testimonials:

**Priya Sharma**

“Everyone was very helpful and explained the treatment process clearly.”

**Rahul Kapoor**

“The clinic felt comfortable and the entire appointment was handled professionally.”

**Ananya Verma**

“I really appreciated how clearly the dentist explained my treatment options.”

Mark these as fictional portfolio/demo testimonials.

---

# 12. APPOINTMENT MANAGEMENT SYSTEM

Build an actual appointment request system backed by Supabase.

Fields:

- First name
- Last name
- Phone
- Email
- Treatment
- Preferred date
- Preferred time
- Additional information

Appointment states:

`requested`

`confirmed`

`rescheduled`

`completed`

`cancelled`

`no_show`

Important:

A patient selecting a preferred date/time does NOT automatically create a confirmed appointment.

Correct process:

**Request → Backend validation → Store request → Staff notification → Staff confirmation → Patient confirmation**

---

# 13. APPOINTMENT BUSINESS RULES

The server must enforce:

- Clinic operating hours
- Sunday closure
- Blocked slots
- Appointment duration
- Existing appointment conflicts
- Valid dates
- Valid times
- Asia/Kolkata timezone

Never trust availability calculated solely by the browser.

The backend is the authoritative source of appointment availability.

Prevent race conditions where possible when two users attempt to request the same slot.

---

# 14. AI APPOINTMENT AGENT

Build an AI-powered virtual front-desk assistant.

It is NOT a generic chatbot.

It should:

- Answer common clinic questions
- Explain services
- Explain fictional pricing
- Explain opening hours
- Explain location
- Explain parking
- Ask visitor intent
- Collect contact details
- Identify treatment interest
- Ask new/existing patient
- Ask preferred appointment time
- Understand general reason for visit
- Determine urgency category
- Recommend an appointment category when appropriate
- Create a lead
- Create an appointment request
- Confirm request submission
- Trigger backend workflow events

The AI must use controlled server-side tools.

---

# 15. AI SAFETY BOUNDARIES

The AI must NOT:

- Diagnose conditions
- Prescribe treatment
- Claim a treatment is medically necessary
- Guarantee outcomes
- Pretend to be a dentist
- Invent availability
- Invent clinic policies
- Invent prices
- Invent credentials
- Access unrelated patient information

For clinical questions, provide general educational information and recommend professional evaluation.

If the knowledge base does not contain the answer:

“I don't have enough information to answer that accurately. I can help you request a consultation with the clinic.”

---

# 16. AI TOOL ARCHITECTURE

Do not give the model unrestricted database access.

Create controlled backend functions/tools such as:

`getClinicInformation()`

`getServices()`

`getServiceDetails()`

`getFAQ()`

`getAvailableAppointmentOptions()`

`createLead()`

`createAppointmentRequest()`

`getAppointmentRequestStatus()`

Every operation must be:

- Server-side
- Validated
- Authorized
- Logged where appropriate
- Rate limited where appropriate

The backend must enforce all business rules even if the AI requests invalid data.

---

# 17. LEAD MANAGEMENT

Every meaningful inquiry should create or update a lead.

Lead fields:

- First name
- Last name
- Phone
- Email
- Treatment interest
- Patient type
- General reason
- Urgency
- Intent
- Status
- Source
- Conversation summary
- Created timestamp
- Updated timestamp
- Last contacted timestamp

Statuses:

`new`

`contacted`

`qualified`

`booked`

`completed`

`lost`

Intent:

`high_intent`

`considering`

`information_only`

---

# 18. MISSED LEAD RECOVERY

Build the backend event system required for this workflow.

Example:

**Lead created**

↓

Wait handled externally by n8n

↓

Check whether appointment exists

↓

If booked → stop

↓

If not booked → follow-up

↓

Check again

↓

Final follow-up

↓

Stop

The application should expose the necessary webhook/API operations for n8n.

Do NOT build the actual n8n workflow inside Lovable.

---

# 19. APPOINTMENT AUTOMATION EVENTS

Create backend events that n8n can consume.

Examples:

`lead.created`

`lead.updated`

`appointment.requested`

`appointment.confirmed`

`appointment.rescheduled`

`appointment.cancelled`

`appointment.completed`

`appointment.no_show`

`followup.required`

These events should contain only the minimum necessary data.

Do not expose sensitive information unnecessarily.

---

# 20. N8N WEBHOOK CONTRACT

Create a secure integration mechanism for n8n.

The application should be capable of sending events to configured n8n webhook endpoints.

Use environment variables such as:

`N8N_WEBHOOK_BASE_URL`

`N8N_WEBHOOK_SECRET`

Never hardcode webhook URLs or secrets.

Authenticate outbound webhook requests.

Use a signed secret or equivalent secure mechanism where appropriate.

Document the expected event payloads.

Example conceptual event:

```text
event: appointment.confirmed
event_id: unique-id
timestamp: ISO timestamp
appointment_id: internal-id
lead_id: internal-id
```

Avoid unnecessarily sending complete patient information to automation systems.

---

# 21. RECEPTIONIST DASHBOARD

Create:

`/staff/login`

and:

`/staff/dashboard`

The dashboard is an authenticated internal application.

It must include:

- Overview
- Leads
- Appointments
- Analytics
- Activity
- Settings where appropriate

Staff can:

- View leads
- Search leads
- Filter leads
- Change lead status
- Change intent
- Add notes
- Record contact attempts
- Book appointments
- Manage appointment status
- View appointment details
- Review activity

---

# 22. STAFF AUTHENTICATION

Use Supabase Auth.

Protect staff routes at both:

- Application layer
- Server/API layer

Do not rely on frontend route hiding.

Implement roles:

### Admin

Full system access.

### Receptionist

Leads, appointments, notes, basic analytics.

### Dentist

Appropriate appointment and patient-related information.

Use Supabase Row Level Security to enforce permissions.

---

# 23. DEMO ACCOUNT

Use:

`receptionist@smilecraftdental.example`

Demo password:

`DemoPassword123!`

Clearly identify this as a fictional portfolio account.

Do not use real personal credentials.

---

# 24. DATABASE SCHEMA

Create a clean relational schema.

### profiles

- id
- email
- full_name
- role
- created_at
- updated_at

### services

- id
- name
- slug
- description
- category
- price_from
- duration_minutes
- active
- created_at
- updated_at

### leads

- id
- first_name
- last_name
- email
- phone
- treatment_interest
- patient_type
- reason
- urgency
- intent
- status
- source
- conversation_summary
- created_at
- updated_at
- last_contacted_at

### appointments

- id
- lead_id
- service_id
- appointment_date
- appointment_time
- duration_minutes
- status
- notes
- created_at
- updated_at

### blocked_slots

- id
- date
- start_time
- end_time
- reason
- created_at

### conversations

- id
- lead_id
- session_id
- status
- summary
- created_at
- updated_at

### messages

- id
- conversation_id
- role
- content
- created_at

### follow_up_jobs

- id
- lead_id
- appointment_id
- workflow_type
- scheduled_for
- status
- attempts
- last_attempt_at
- created_at

### activity_logs

- id
- user_id
- lead_id
- appointment_id
- action
- metadata
- created_at

Add appropriate indexes, constraints, foreign keys, and timestamps.

---

# 25. SECURITY — HIGH PRIORITY

Security is a core requirement, not a final polish step.

Apply OWASP-aligned security practices throughout the application.

Implement at minimum:

### Authentication security

- Secure Supabase authentication
- Protected staff routes
- Server-side session validation
- Role-based authorization
- Session expiration handling
- Secure logout

### Authorization

Never trust client-provided roles.

Always verify authorization server-side.

Use Supabase RLS policies.

Users must only access data permitted by their role.

---

# 26. API TOKEN VALIDATION

For every protected API endpoint:

- Validate authentication/session
- Validate authorization
- Validate request structure
- Validate required parameters
- Reject malformed tokens
- Reject expired sessions
- Reject unauthorized roles

For n8n webhooks:

- Require a secret/signature
- Reject missing authentication
- Reject invalid signatures
- Prevent replay where appropriate

Never put privileged tokens in client-side JavaScript.

---

# 27. RATE LIMITING

Implement rate limiting for sensitive operations, especially:

- Login attempts
- AI requests
- Appointment creation
- Lead creation
- Contact forms
- Public API endpoints
- Password/reset-related endpoints
- Webhook endpoints

Use a production-appropriate rate limiting mechanism.

Do not depend exclusively on in-memory rate limiting in a serverless environment.

If an external rate-limit service is required, isolate it behind a clean abstraction and document the required environment variables.

Return appropriate `429 Too Many Requests` responses.

---

# 28. IP THROTTLING

Implement IP-based throttling for publicly exposed abuse-prone endpoints.

Especially:

- AI endpoint
- Appointment request endpoint
- Contact endpoint
- Login endpoint
- Public lead creation endpoint

Do not use IP address alone as the only security mechanism.

Combine IP throttling with:

- User/session limits
- Request frequency limits
- Payload validation
- Bot/abuse protections where appropriate

Avoid storing IP addresses longer than necessary.

---

# 29. AUDIT LOGGING

Create security and operational audit logs.

Log events such as:

- Login success
- Login failure
- Logout
- Unauthorized access attempt
- Role change
- Lead status change
- Appointment creation
- Appointment modification
- Appointment cancellation
- Sensitive configuration change
- Webhook authentication failure
- Rate-limit violation where useful

Do NOT log:

- Passwords
- Authentication tokens
- API keys
- Full sensitive form payloads
- Unnecessary medical information

Audit logs should be append-oriented and protected from ordinary staff modification.

---

# 30. OWASP SECURITY PRACTICES

Follow current OWASP-aligned principles including:

- Input validation
- Output encoding
- Secure authentication
- Least privilege
- Secure session management
- Protection against injection
- Protection against XSS
- CSRF considerations
- Secure headers
- Proper error handling
- Secrets management
- Dependency hygiene
- Server-side authorization
- Rate limiting
- Logging and monitoring
- Secure database access

Do not expose internal stack traces to users.

Do not expose database errors directly.

---

# 31. SECRETS MANAGEMENT

Use environment variables for:

- Supabase credentials
- Server-only Supabase service credentials if required
- AI API keys
- n8n webhook secrets
- External integration credentials
- Rate-limit provider credentials

Clearly separate:

**Public environment variables**

from:

**Server-only secrets**

Never expose server secrets through `NEXT_PUBLIC_*`.

---

# 32. DATABASE SECURITY

Enable Supabase Row Level Security on all relevant tables.

Write explicit policies.

Do not rely on application code alone for authorization.

The database should prevent unauthorized access even if an API endpoint is accidentally misused.

Never expose the Supabase service-role key to the browser.

---

# 33. INPUT VALIDATION

Validate every external input.

Use a robust validation library such as Zod.

Validate:

- Names
- Emails
- Phone numbers
- Dates
- Times
- Service IDs
- Lead status
- Appointment status
- Query parameters
- Pagination
- Search parameters
- AI tool arguments
- Webhook payloads

Reject unexpected fields where appropriate.

---

# 34. ERROR HANDLING

Implement graceful error handling throughout.

States include:

- Loading
- Empty
- Success
- Validation error
- Authentication error
- Authorization error
- Database failure
- Network failure
- AI failure
- Appointment conflict
- Appointment unavailable
- n8n unavailable
- Webhook failure
- Rate limited
- Session expired
- Unknown error

Never show false success.

If a database write fails, do not tell the user the appointment was created.

Provide useful user-facing messages while keeping technical details in secure server logs.

---

# 35. RETRY MECHANISMS

Implement safe retry behavior for transient failures.

Especially:

- n8n webhook delivery
- External API requests
- Notification requests

Use:

- Exponential backoff
- Maximum retry count
- Idempotency
- Failure logging

Do NOT blindly retry appointment creation or other transactional operations because that could create duplicates.

For important external events, use an event ID/idempotency key so repeated delivery does not create duplicate actions.

---

# 36. RELIABLE EVENT DELIVERY

For business-critical events sent to n8n, design for temporary failures.

Recommended architecture:

Database transaction

↓

Record event/outbox entry

↓

Attempt webhook delivery

↓

Retry transient failure

↓

Mark delivered

This prevents the database transaction from depending entirely on n8n being online.

Create an appropriate event/outbox structure if needed.

---

# 37. IDEMPOTENCY

Implement idempotency for operations that must not accidentally execute twice.

Examples:

- Appointment request creation
- Webhook processing
- External notification events

A repeated request with the same idempotency key should not create duplicate records.

---

# 38. ACCESSIBILITY — WCAG 2.1 AA

The public website and staff dashboard should target **WCAG 2.1 AA**.

Implement:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- Accessible form controls
- Accessible dialogs
- Accessible dropdowns
- Accessible tables
- Correct heading hierarchy
- Sufficient color contrast
- Screen-reader support
- ARIA only where necessary
- Reduced-motion support
- Meaningful error messages
- Accessible validation states

Do not use color alone to communicate status.

---

# 39. MOBILE-FIRST RESPONSIVE DESIGN

Design mobile-first.

Test:

- Small mobile
- Large mobile
- Tablet
- Laptop
- Desktop
- Large desktop

No horizontal overflow.

Forms must remain usable on mobile.

Staff dashboard tables should adapt intelligently rather than simply overflowing.

---

# 40. PERFORMANCE

Optimize for production performance.

Use:

- Next.js server rendering where appropriate
- Static generation where appropriate
- Image optimization
- Lazy loading
- Code splitting
- Minimal client-side JavaScript
- Efficient database queries
- Pagination
- Proper caching
- Avoid unnecessary dependencies

Do not turn every component into a client component.

---

# 41. CDN / EDGE DELIVERY

The application will be deployed on Vercel.

Use Vercel's built-in CDN/edge delivery architecture for:

- Static assets
- Images
- Public pages where appropriate
- Cached content

Do not build a custom CDN.

Configure caching headers carefully.

Do not cache authenticated or private staff data publicly.

Never cache sensitive responses in a shared public cache.

---

# 42. SEO

Optimize the public website for search engines.

Implement:

- Metadata
- Page titles
- Meta descriptions
- Open Graph metadata
- Canonical URLs
- Semantic HTML
- Sitemap
- Robots configuration
- Structured data where appropriate

Because this is fictional:

Do NOT attempt to create misleading real-world local business listings or fake Google Business information.

---

# 43. RECEPTIONIST DASHBOARD ANALYTICS

Display:

Website Visitors: 1,284

Leads: 87

Appointment Requests: 43

Booked: 31

Conversion Rate: 3.4%

Most requested treatments:

Teeth Whitening — 28%

Clear Aligners — 22%

Cleaning — 19%

Implants — 14%

Other — 17%

These are fictional portfolio numbers.

Where possible, make analytics derive from database data instead of hardcoded UI.

---

# 44. DASHBOARD LEAD EXAMPLES

Rahul Kapoor  
Treatment: Dental Implant  
Status: New  
Intent: High Intent

Priya Sharma  
Treatment: Cleaning  
Status: Contacted  
Intent: Considering  
Appointment: September 14

Ananya Verma  
Treatment: Clear Aligners  
Status: Booked  
Intent: High Intent  
Appointment: September 16

These are fictional demo records.

---

# 45. DASHBOARD ACTIONS

Staff should be able to:

- Call
- Message
- Book
- Mark contacted
- Change status
- Add note
- Close lead
- View appointment
- Reschedule
- Cancel
- Mark completed
- Mark no-show

Actions must actually work.

Do not create decorative buttons.

---

# 46. KNOWLEDGE BASE

Create database-backed clinic knowledge.

Include:

- Clinic information
- Services
- Pricing
- Opening hours
- Location
- Parking
- Payment methods
- Appointment policies
- General treatment information
- Emergency appointment information
- FAQs

AI answers should come from this knowledge base.

If information is unavailable, the AI must say so.

---

# 47. PRIVACY

This is a portfolio project and should minimize data collection.

Do not build a full electronic medical-record system.

Do not collect unnecessary medical information.

Use fictional demo data.

Include appropriate privacy language.

Separate:

- Lead information
- Appointment information
- Internal staff notes
- AI conversation data

Apply least-privilege access.

---

# 48. DEMO DATA

Seed fictional:

- Services
- Leads
- Appointments
- Staff account
- Activity logs
- Analytics-compatible records
- FAQ content

Never use real personal information.

---

# 49. SYSTEM FLOW

The final architecture should resemble:

```text
                    PUBLIC WEBSITE
                          │
                          ▼
                   AI RECEPTIONIST
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
          Questions    Qualify     Booking
              │           │           │
              └───────────┼───────────┘
                          ▼
                    NEXT.JS BACKEND
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
              SUPABASE          EVENTS
                 │                 │
                 │                 ▼
                 │               n8n
                 │                 │
                 │       ┌─────────┼─────────┐
                 │       ▼         ▼         ▼
                 │    Reminders  Follow-up Notifications
                 │
                 ▼
           STAFF DASHBOARD
                 │
                 ▼
              ANALYTICS
```

The application must remain functional even if n8n is temporarily unavailable.

---

# 50. N8N IS A SEPARATE PHASE

Do not attempt to build the n8n workflows now.

Instead, prepare the application for them.

Create:

- Event types
- Webhook contracts
- Authentication mechanism
- Retry behavior
- Idempotency
- Environment variables
- Documentation
- Outbox/event records where appropriate

The actual n8n workflows will be connected separately after deployment.

---

# 51. PRODUCTION CONFIGURATION

Prepare the application for deployment on Vercel.

Include:

- Environment variable documentation
- Production-safe error handling
- Secure headers
- Authentication configuration
- Supabase configuration
- Database migration/schema setup
- Seed/demo data setup
- AI configuration
- n8n configuration placeholders
- Build configuration

Never commit secrets.

---

# 52. QUALITY CONTROL

Before considering the project complete, inspect the entire application.

Verify:

### Functionality

- Every navigation link works.
- Every important button works.
- Forms work.
- Appointment requests persist.
- Lead records persist.
- Staff login works.
- Protected routes are actually protected.
- Role permissions work.
- AI tools work.
- Invalid appointments are rejected.
- Duplicate operations are prevented.

### Security

- No exposed secrets.
- RLS is enabled.
- API authentication works.
- Authorization works.
- Rate limiting exists.
- IP throttling exists where appropriate.
- Input validation exists.
- Audit logging exists.
- Secure errors are returned.
- Sensitive data isn't unnecessarily logged.
- Public caching does not expose private data.

### Reliability

- External webhook failures are handled.
- Retries exist where appropriate.
- Idempotency exists.
- n8n downtime does not break core appointment functionality.
- Database failures produce graceful errors.

### Accessibility

- WCAG 2.1 AA target.
- Keyboard navigation works.
- Forms are accessible.
- Contrast is sufficient.
- Focus states are visible.

### Performance

- Mobile loads efficiently.
- Images are optimized.
- Client-side JavaScript is minimized.
- Database queries are efficient.
- Pagination exists for potentially large datasets.

### SEO

- Metadata exists.
- Sitemap exists.
- Robots configuration exists.
- Public pages are crawlable.

---

# 53. DO NOT OVERBUILD

Do not add unnecessary:

- Patient medical records
- Insurance processing
- Complex billing
- Prescription systems
- Clinical diagnosis
- Video consultations
- Inventory systems
- Multi-clinic management
- Enterprise microservices

The goal is a focused business website + lead management + appointment system.

---

# 54. FINAL PRODUCT POSITIONING

The final product should demonstrate this proposition:

**“A dental website that turns visitors into qualified appointment opportunities and automates the repetitive work around them.”**

It should NOT feel like:

**“A dental landing page with an AI chatbot.”**

The value is the connected system:

**Traffic**

↓

**Lead Capture**

↓

**AI Qualification**

↓

**Appointment Request**

↓

**Staff Management**

↓

**Automated Follow-up**

↓

**Appointment Completion**

↓

**Analytics**

---

# 55. FINAL DEFINITION OF DONE

The project is complete only when the deployed application demonstrates a coherent end-to-end experience.

A visitor can:

1. Browse the clinic.
2. Explore services.
3. Ask the AI assistant questions.
4. Provide contact information.
5. Get qualified.
6. Request an appointment.
7. Receive an accurate confirmation of the request.

A staff member can:

1. Log in securely.
2. See new leads.
3. View lead details.
4. Manage lead status.
5. View appointment requests.
6. Confirm/reschedule/cancel appointments.
7. Mark completed/no-show.
8. View analytics.
9. Review activity logs.

The backend can:

1. Validate requests.
2. Enforce appointment rules.
3. Protect data with RLS.
4. Authenticate API requests.
5. Rate-limit abuse.
6. Throttle suspicious IP activity.
7. Record audit events.
8. Handle errors gracefully.
9. Retry appropriate transient integrations.
10. Emit secure events for n8n.
11. Prevent duplicate operations.

The architecture must be ready for n8n to be connected separately.

The application must be deployable to Vercel.

The final result should look and behave like a **real business product**, while clearly remaining a fictional portfolio concept.

use attached image as logo and the website colour scheme complement to logo color

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d4b04d7c-4086-40a3-bf9b-7b8bb4f395b8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
