import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { PageHeader, PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CLINIC, HOURS_DISPLAY, FICTION_NOTE } from "@/lib/clinic";
import { submitContactMessage } from "@/lib/public.functions";
import { contactSchema, fieldErrors } from "@/lib/validation";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Directions | SmileCraft Dental Studio" },
      {
        name: "description",
        content:
          "Get in touch with SmileCraft Dental Studio in New Delhi. Find clinic hours, phone numbers, parking advice or send an enquiry.",
      },
      { property: "og:title", content: "Contact SmileCraft Dental Studio" },
      {
        property: "og:description",
        content: "Address, opening hours, phone and enquiry form for our New Delhi clinic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const payload = {
      firstName,
      lastName: lastName.trim() || undefined,
      phone,
      email: email.trim() || undefined,
      message,
    };

    const validation = contactSchema.safeParse(payload);
    if (!validation.success) {
      setErrors(fieldErrors(validation.error));
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContactMessage({ data: validation.data });
      if (!res.ok) {
        setServerError(res.message);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setServerError("A network error occurred. Please call the clinic directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicShell>
      <PageHeader
        eyebrow="Contact"
        title="We're here to help"
        intro="Have a question about a treatment, opening hours, or want to speak with our front desk? Reach out by phone, WhatsApp, or send us a message below."
      />

      <div className="container-page py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left: Contact Info & Opening Hours */}
          <div className="space-y-8 lg:col-span-5">
            <div>
              <h2 className="text-2xl font-semibold">Clinic Information</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                SmileCraft Dental Studio is located in Sector 18, New Delhi. Appointments can be
                scheduled by phone or requested online.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary border border-border/60">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Address</h3>
                  <address className="mt-1 text-sm not-italic text-muted-foreground">
                    {CLINIC.address.line1}
                    <br />
                    {CLINIC.address.line2}
                    <br />
                    {CLINIC.address.line3}
                  </address>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary border border-border/60">
                  <Phone className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Telephone & WhatsApp</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <a
                      href={CLINIC.phoneHref}
                      className="text-accent underline-offset-4 hover:underline"
                    >
                      {CLINIC.phone}
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground">Available during operating hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary border border-border/60">
                  <Mail className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Email</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <a
                      href={`mailto:${CLINIC.email}`}
                      className="text-accent underline-offset-4 hover:underline"
                    >
                      {CLINIC.email}
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground">For general inquiries</p>
                </div>
              </div>
            </div>

            <Card className="border-border/70 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <h3 className="font-semibold text-sm">Opening Hours</h3>
                </div>
                <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {HOURS_DISPLAY.map((row) => (
                    <div
                      key={row.day}
                      className="flex justify-between border-b border-border/40 pb-1.5 last:border-0 last:pb-0"
                    >
                      <dt className="text-foreground">{row.day}</dt>
                      <dd>{row.hours}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-xs text-muted-foreground">
                  Timezone: {CLINIC.timezone}. Emergency appointment requests are evaluated during
                  operating hours.
                </p>
              </CardContent>
            </Card>

            <div className="rounded-xl border border-border/60 bg-surface p-5 text-xs text-muted-foreground">
              <h4 className="font-semibold text-foreground text-sm">Parking & Accessibility</h4>
              <p className="mt-2">
                Street parking is available directly along Green Park Avenue. A small visitor bay is
                located near the building lobby. Wheelchair ramp access is available at the front
                entrance.
              </p>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7">
            <Card className="border-border/80 shadow-soft">
              <CardContent className="p-8 md:p-10">
                {submitted ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h2 className="mt-6 text-2xl font-semibold">Message Sent Successfully</h2>
                    <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm">
                      Thank you for contacting us, {firstName}. Our reception team has received your
                      note and will get back to you shortly at {phone}.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Button asChild>
                        <Link to="/book-appointment">Book an appointment</Link>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSubmitted(false);
                          setMessage("");
                        }}
                      >
                        Send another message
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="size-5 text-accent" />
                      <h2 className="text-2xl font-semibold">Send a Message</h2>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Fill out the form below and our clinic reception team will respond within one
                      business day.
                    </p>

                    {serverError && (
                      <div className="mt-5 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 text-sm text-destructive">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{serverError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="contact-fname">
                            First Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="contact-fname"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="e.g. Rahul"
                            className="mt-1.5"
                          />
                          {errors.firstName && (
                            <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="contact-lname">Last Name</Label>
                          <Input
                            id="contact-lname"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="e.g. Kapoor"
                            className="mt-1.5"
                          />
                          {errors.lastName && (
                            <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="contact-phone">
                            Phone Number <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="contact-phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="mt-1.5"
                          />
                          {errors.phone && (
                            <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="contact-email">Email (optional)</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="mt-1.5"
                          />
                          {errors.email && (
                            <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="contact-message">
                          How can we help? <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="contact-message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell us what you'd like to ask or what dental care you are considering..."
                          rows={4}
                          className="mt-1.5"
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                        )}
                      </div>

                      <Button type="submit" disabled={submitting} className="w-full mt-2" size="lg">
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Sending message...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>{FICTION_NOTE}</p>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
