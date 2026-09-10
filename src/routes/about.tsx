import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CLINIC, DENTIST, FICTION_NOTE, HOURS_DISPLAY, TRUST_STATS } from "@/lib/clinic";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Our Clinic & Dr. Aarav Mehta | SmileCraft Dental Studio" },
      {
        name: "description",
        content:
          "Meet Dr. Aarav Mehta and the team at SmileCraft Dental Studio, a fictional multi-specialty dental clinic in New Delhi established in 2018.",
      },
      { property: "og:title", content: "About SmileCraft Dental Studio" },
      {
        property: "og:description",
        content: "A fictional New Delhi dental clinic focused on calm, clearly explained care.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicShell>
      <PageHeader
        eyebrow="About"
        title="A calm clinic built around clear explanations"
        intro={`Established in ${CLINIC.established}, ${CLINIC.name} is a fictional multi-specialty practice in New Delhi combining general, cosmetic and restorative dentistry.`}
      />

      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-2xl">{DENTIST.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {DENTIST.qualifications} · {DENTIST.specialization} · {DENTIST.experience}
            </p>
            <p className="mt-5 leading-relaxed text-muted-foreground">{DENTIST.bio}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Languages spoken: {DENTIST.languages}
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              All credentials, biography details and professional claims on this site are fictional.
            </p>
          </div>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <h2 className="text-lg">Visit us</h2>
              <address className="mt-3 text-sm not-italic text-muted-foreground">
                {CLINIC.address.line1}
                <br />
                {CLINIC.address.line2}
                <br />
                {CLINIC.address.line3}
              </address>
              <dl className="mt-5 space-y-1.5 text-sm text-muted-foreground">
                {HOURS_DISPLAY.map((row) => (
                  <div key={row.day} className="flex justify-between gap-4">
                    <dt>{row.day}</dt>
                    <dd>{row.hours}</dd>
                  </div>
                ))}
              </dl>
              <Button asChild className="mt-6 w-full">
                <Link to="/book-appointment">Book an appointment</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_STATS.map((stat) => (
            <li key={stat.label} className="rounded-xl bg-surface p-6">
              <p className="font-display text-3xl text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-3xl text-xs text-muted-foreground">{FICTION_NOTE}</p>
      </div>
    </PublicShell>
  );
}
