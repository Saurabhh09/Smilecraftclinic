import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useEffect, useId } from "react";
import {
  CheckCircle2,
  Calendar,
  Clock,
  AlertCircle,
  Phone,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { z } from "zod";

import { PageHeader, PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLINIC, formatINR } from "@/lib/clinic";
import {
  getServices,
  getAvailableAppointmentOptions,
  createAppointmentRequest,
} from "@/lib/public.functions";
import { appointmentRequestSchema, fieldErrors } from "@/lib/validation";
import { clinicToday, addDays, formatLongDate } from "@/lib/scheduling";

const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: () => getServices(),
});

const bookAppointmentSearchSchema = z.object({
  service: z.string().optional(),
});

export const Route = createFileRoute("/book-appointment")({
  head: () => ({
    meta: [
      { title: "Book a Dental Appointment | SmileCraft Dental Studio" },
      {
        name: "description",
        content:
          "Request an appointment at SmileCraft Dental Studio in New Delhi. Choose your preferred treatment, date and time.",
      },
      { property: "og:title", content: "Book an Appointment | SmileCraft Dental Studio" },
      {
        property: "og:description",
        content: "Choose a preferred date and time for your dental consultation in New Delhi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search) => bookAppointmentSearchSchema.parse(search),
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  component: BookAppointmentPage,
});

function BookAppointmentPage() {
  const { service: initialServiceSlug } = Route.useSearch();
  const { data: services } = useSuspenseQuery(servicesQuery);

  const [selectedService, setSelectedService] = useState<string>(
    initialServiceSlug || (services[0]?.slug ?? "dental-check-ups"),
  );

  const today = clinicToday();
  const defaultDate = addDays(today, 1);
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsData, setSlotsData] = useState<{
    open: boolean;
    reason: string | null;
    slots: Array<{ time: string; available: boolean }>;
    duration?: number;
  }>({ open: true, reason: null, slots: [] });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [patientType, setPatientType] = useState<"new" | "existing">("new");
  const [urgency, setUrgency] = useState<"routine" | "soon" | "urgent" | "emergency">("routine");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<{
    appointmentId: string;
    duplicate: boolean;
    serviceName: string;
    date: string;
    time: string;
    duration: number;
  } | null>(null);

  const formId = useId();
  const [idempotencyKey] = useState(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  });

  // Fetch slots whenever date or service changes
  useEffect(() => {
    let active = true;
    async function fetchSlots() {
      setSlotsLoading(true);
      setServerError(null);
      try {
        const res = await getAvailableAppointmentOptions({
          data: { date: selectedDate, serviceSlug: selectedService },
        });
        if (active) {
          setSlotsData(res);
          // If previous selected time is no longer available in this day, clear it
          if (!res.slots.some((s) => s.time === selectedTime && s.available)) {
            setSelectedTime("");
          }
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load appointment slots", err);
          setSlotsData({
            open: false,
            reason: "Could not load slot availability. Please refresh.",
            slots: [],
          });
        }
      } finally {
        if (active) setSlotsLoading(false);
      }
    }

    if (selectedDate) {
      void fetchSlots();
    }
    return () => {
      active = false;
    };
  }, [selectedDate, selectedService]);

  const activeService = services.find((s) => s.slug === selectedService);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const payload = {
      firstName,
      lastName: lastName.trim() || undefined,
      phone,
      email: email.trim() || undefined,
      serviceSlug: selectedService,
      preferredDate: selectedDate,
      preferredTime: selectedTime,
      patientType,
      urgency,
      notes: notes.trim() || undefined,
      source: "website_form",
      idempotencyKey,
    };

    const validation = appointmentRequestSchema.safeParse(payload);
    if (!validation.success) {
      setErrors(fieldErrors(validation.error));
      if (!selectedTime) {
        setErrors((prev) => ({ ...prev, preferredTime: "Please pick a preferred time slot" }));
      }
      return;
    }

    if (!selectedTime) {
      setErrors({ preferredTime: "Please select an available time slot." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await createAppointmentRequest({ data: validation.data });
      if (!res.ok) {
        setServerError(res.message);
        return;
      }

      setConfirmedData({
        appointmentId: res.appointmentId,
        duplicate: res.duplicate,
        serviceName: activeService?.name ?? "Dental Treatment",
        date: selectedDate,
        time: selectedTime,
        duration: activeService?.duration_minutes ?? 30,
      });
    } catch (err) {
      setServerError("A network error occurred while submitting your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedData) {
    return (
      <PublicShell>
        <div className="container-page py-16 md:py-24">
          <Card className="mx-auto max-w-2xl border-border/80 shadow-soft">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                <CheckCircle2 className="size-8" />
              </div>
              <h1 className="mt-6 text-3xl font-semibold">Appointment Request Received</h1>
              <p className="mt-3 text-muted-foreground">
                Thank you, {firstName}. Your request has been logged into our clinic schedule.
              </p>

              <div className="my-8 rounded-xl bg-surface p-6 text-left border border-border/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Request Summary
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Reference ID:</span>
                    <span className="font-mono text-xs font-medium">
                      {confirmedData.appointmentId}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Treatment:</span>
                    <span className="font-medium text-foreground">{confirmedData.serviceName}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Requested Date:</span>
                    <span className="font-medium text-foreground">
                      {formatLongDate(confirmedData.date)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Requested Time:</span>
                    <span className="font-medium text-foreground">
                      {confirmedData.time} (Asia/Kolkata)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Estimated Duration:</span>
                    <span className="font-medium text-foreground">
                      {confirmedData.duration} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact Phone:</span>
                    <span className="font-medium text-foreground">{phone}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-secondary/60 p-4 text-left text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Important Next Step:</p>
                <p className="mt-1">
                  Selecting a time creates an appointment request, not an automatic confirmation.
                  Our reception team will verify the clinic diary and contact you at {phone} to
                  confirm your visit.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link to="/">Return to Home</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmedData(null);
                    setSelectedTime("");
                  }}
                >
                  Make another request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <PageHeader
        eyebrow="Appointments"
        title="Request a Dental Consultation"
        intro="Select your treatment, preferred day, and slot. Our reception team will review the clinic diary and confirm your appointment with you."
      />

      <div className="container-page py-12 md:py-16">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl" noValidate>
          {serverError && (
            <div className="mb-8 flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="size-5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="grid gap-10 md:grid-cols-3">
            {/* Left 2 columns: Booking Flow */}
            <div className="space-y-8 md:col-span-2">
              {/* Step 1: Treatment Selection */}
              <div className="rounded-xl border border-border/70 bg-card p-6 shadow-soft">
                <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    1
                  </div>
                  <h2 className="text-lg font-semibold">Select Treatment</h2>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <Label htmlFor={`${formId}-service`}>Treatment or Consultation</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger id={`${formId}-service`} className="mt-1.5 w-full">
                        <SelectValue placeholder="Choose a treatment" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {services.map((svc) => (
                          <SelectItem key={svc.slug} value={svc.slug}>
                            {svc.name} — from {formatINR(svc.price_from)} ({svc.duration_minutes}{" "}
                            min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {activeService && (
                    <div className="rounded-lg bg-surface p-4 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">{activeService.name}</p>
                      <p className="mt-1">{activeService.description}</p>
                      <p className="mt-2 text-foreground font-semibold">
                        Indicative fee: from {formatINR(activeService.price_from)} · Estimated time:{" "}
                        {activeService.duration_minutes} min
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Date & Slot Selection */}
              <div className="rounded-xl border border-border/70 bg-card p-6 shadow-soft">
                <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    2
                  </div>
                  <h2 className="text-lg font-semibold">Select Date & Preferred Time</h2>
                </div>

                <div className="mt-5 space-y-6">
                  <div>
                    <Label htmlFor={`${formId}-date`}>Appointment Date</Label>
                    <div className="mt-1.5 flex items-center gap-3">
                      <Input
                        id={`${formId}-date`}
                        type="date"
                        min={today}
                        max={addDays(today, 90)}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="max-w-xs"
                      />
                      <span className="text-xs text-muted-foreground">
                        {selectedDate ? formatLongDate(selectedDate) : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Mon–Fri: 9am–7pm, Sat: 10am–5pm. Closed Sundays. Up to 90 days in advance.
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center justify-between">
                      <span>
                        Available Slots for{" "}
                        {selectedDate ? formatLongDate(selectedDate) : "Selected Date"}
                      </span>
                      {slotsLoading && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="size-3 animate-spin" /> Checking live diary...
                        </span>
                      )}
                    </Label>

                    {!slotsData.open ? (
                      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                        {slotsData.reason ??
                          "Clinic is closed on this date. Please pick another day."}
                      </div>
                    ) : slotsData.slots.length === 0 && !slotsLoading ? (
                      <div className="mt-3 rounded-lg border border-border p-4 text-sm text-muted-foreground">
                        No available slots remaining on this day. Please choose another date.
                      </div>
                    ) : (
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slotsData.slots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => {
                                setSelectedTime(slot.time);
                                setErrors((prev) => {
                                  const c = { ...prev };
                                  delete c.preferredTime;
                                  return c;
                                });
                              }}
                              className={`flex items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                                !slot.available
                                  ? "border-border/40 bg-muted/40 text-muted-foreground/50 cursor-not-allowed line-through"
                                  : isSelected
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-card hover:border-primary/50 hover:bg-secondary/40 text-foreground"
                              }`}
                            >
                              <Clock className="mr-1.5 size-3.5 opacity-70" />
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {errors.preferredTime && (
                      <p className="mt-2 text-xs font-medium text-destructive">
                        {errors.preferredTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Patient Information */}
              <div className="rounded-xl border border-border/70 bg-card p-6 shadow-soft">
                <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    3
                  </div>
                  <h2 className="text-lg font-semibold">Your Contact Details</h2>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`${formId}-fname`}>
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`${formId}-fname`}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Rahul"
                        className="mt-1"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`${formId}-lname`}>Last Name</Label>
                      <Input
                        id={`${formId}-lname`}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Kapoor"
                        className="mt-1"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`${formId}-phone`}>
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`${formId}-phone`}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="mt-1"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Our reception will call or WhatsApp this number to confirm.
                      </p>
                      {errors.phone && (
                        <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`${formId}-email`}>Email (optional)</Label>
                      <Input
                        id={`${formId}-email`}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="mt-1"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div>
                      <Label>Patient Type</Label>
                      <RadioGroup
                        value={patientType}
                        onValueChange={(v) => setPatientType(v as "new" | "existing")}
                        className="mt-2 flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="new" id={`${formId}-pt-new`} />
                          <Label
                            htmlFor={`${formId}-pt-new`}
                            className="font-normal cursor-pointer"
                          >
                            New Patient
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="existing" id={`${formId}-pt-exist`} />
                          <Label
                            htmlFor={`${formId}-pt-exist`}
                            className="font-normal cursor-pointer"
                          >
                            Existing Patient
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Urgency Level</Label>
                      <Select
                        value={urgency}
                        onValueChange={(v) =>
                          setUrgency(v as "routine" | "soon" | "urgent" | "emergency")
                        }
                      >
                        <SelectTrigger className="mt-1.5 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">
                            Routine (regular checkup or planned care)
                          </SelectItem>
                          <SelectItem value="soon">Soon (within the next few days)</SelectItem>
                          <SelectItem value="urgent">
                            Urgent (mild discomfort / chipped tooth)
                          </SelectItem>
                          <SelectItem value="emergency">
                            Emergency (acute pain or injury)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Label htmlFor={`${formId}-notes`}>
                      Additional Information / Symptoms (optional)
                    </Label>
                    <Textarea
                      id={`${formId}-notes`}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tell us about any specific symptoms, sensitivity, or previous treatments..."
                      className="mt-1.5"
                      rows={3}
                    />
                    {errors.notes && (
                      <p className="mt-1 text-xs text-destructive">{errors.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Summary sidebar */}
            <div>
              <Card className="sticky top-24 border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">Booking Summary</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Treatment:</span>
                      <span className="font-medium text-right">{activeService?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium text-right">
                        {selectedDate ? formatLongDate(selectedDate) : "Select date"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Time slot:</span>
                      <span className="font-medium text-right">
                        {selectedTime ? `${selectedTime} IST` : "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Indicative fee:</span>
                      <span className="font-medium text-right text-primary">
                        {activeService ? `From ${formatINR(activeService.price_from)}` : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg bg-surface p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Clinic Confirmation Policy</p>
                    <p className="mt-1">
                      Online requests do not immediately confirm appointment slots. Staff reviews
                      each request against operating capacity.
                    </p>
                  </div>

                  <Button type="submit" disabled={submitting} className="mt-6 w-full" size="lg">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Submitting request...
                      </>
                    ) : (
                      "Request Appointment"
                    )}
                  </Button>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground">Prefer to book by phone?</p>
                    <a
                      href={CLINIC.phoneHref}
                      className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      <Phone className="size-3" />
                      {CLINIC.phone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </PublicShell>
  );
}
