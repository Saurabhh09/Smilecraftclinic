import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";

import { DentalSpecialists } from "@/components/site/dental-specialists";
import { BeforeAfterSection } from "@/components/site/before-after-section";
import { PatientStories } from "@/components/site/patient-stories";
import { PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CLINIC, TRUST_STATS, formatINR } from "@/lib/clinic";
import { getServices } from "@/lib/public.functions";

const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: () => getServices(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmileCraft Dental Studio — Dentist in New Delhi" },
      {
        name: "description",
        content:
          "SmileCraft Dental Studio is a fictional multi-specialty dental clinic in New Delhi offering check-ups, implants, aligners and cosmetic dentistry. Request an appointment online.",
      },
      {
        property: "og:title",
        content: "SmileCraft Dental Studio — Modern Dentistry. Personal Care.",
      },
      {
        property: "og:description",
        content:
          "Book a dental consultation with Dr. Aarav Mehta. Fictional portfolio clinic in New Delhi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  component: Index,
});

function Index() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const featured = services.slice(0, 6);

  return (
    <PublicShell>
      <section className="border-b border-border bg-surface">
        <div
          className="container-page grid gap-12 py-16 md:grid-cols-2 md:items-center md:py-24"
          suppressHydrationWarning
        >
          <div className="rise-in">
            <p className="eyebrow">{CLINIC.type} · New Delhi</p>
            <h1 className="mt-4 text-4xl leading-tight md:text-6xl">
              Modern dentistry, delivered with personal care.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              SmileCraft Dental Studio combines careful diagnosis, clear explanations and
              comfortable treatment. Request an appointment and our team confirms the time with you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/book-appointment">
                  Book an appointment <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("open-dental-assistant"));
                  }
                }}
              >
                <Sparkles className="size-4 text-accent" />
                Talk to Our Assistant
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/services">Explore treatments</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Requesting a time is not a confirmed booking — the clinic confirms every appointment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {TRUST_STATS.map((stat) => (
              <Card key={stat.label} className="border-border/70 shadow-soft">
                <CardContent className="p-6">
                  <p className="font-display text-3xl text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
            <p className="col-span-2 text-xs text-muted-foreground">
              Illustrative figures for a fictional portfolio clinic.
            </p>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <p className="eyebrow">Treatments</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-2xl text-3xl md:text-4xl">
              Everyday dental care and specialist treatment under one roof
            </h2>
            <Button asChild variant="ghost">
              <Link to="/services">
                All treatments <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service) => (
              <li key={service.id}>
                <Card className="h-full border-border/70 transition-shadow hover:shadow-lift">
                  <CardContent className="flex h-full flex-col p-6">
                    <p className="eyebrow">{service.category}</p>
                    <h3 className="mt-2 text-xl">{service.name}</h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                    <p className="mt-4 text-sm font-medium">
                      From {formatINR(service.price_from)}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {service.duration_minutes} min
                      </span>
                    </p>
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className="mt-4 text-sm font-medium text-accent underline-offset-4 hover:underline"
                    >
                      Treatment details
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <DentalSpecialists />

      <PatientStories />

      <BeforeAfterSection />

      <section className="pt-8 pb-8">
        <div className="container-page">
          <div className="rounded-2xl bg-primary px-6 py-12 text-primary-foreground md:px-12">
            <h2 className="max-w-2xl text-3xl md:text-4xl">
              Ready when you are — request a time that suits you
            </h2>
            <p className="mt-3 max-w-xl text-primary-foreground/80">
              Tell us what you need and when you'd like to come in. Our reception team confirms your
              appointment.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/book-appointment">Book an appointment</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a href={CLINIC.phoneHref}>Call {CLINIC.phone}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
