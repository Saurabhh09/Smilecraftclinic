import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PageHeader, PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/clinic";
import { getServices } from "@/lib/public.functions";

const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: () => getServices(),
});

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Dental Treatments & Fictional Pricing | SmileCraft Dental Studio" },
      {
        name: "description",
        content:
          "Explore treatments at SmileCraft Dental Studio: check-ups, cleaning, fillings, root canals, crowns, implants, whitening and clear aligners, with indicative fictional pricing.",
      },
      { property: "og:title", content: "Dental Treatments | SmileCraft Dental Studio" },
      {
        property: "og:description",
        content: "General, cosmetic and restorative dentistry with indicative fictional pricing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const categories = [...new Set(services.map((s) => s.category ?? "General"))];

  return (
    <PublicShell>
      <PageHeader
        eyebrow="Treatments"
        title="Dental care for every stage"
        intro="From routine check-ups to full smile makeovers. All prices below are indicative fictional portfolio pricing and are confirmed after an in-clinic assessment."
      />

      <div className="container-page py-14">
        {categories.map((category) => (
          <section key={category} className="mb-14">
            <h2 className="text-2xl">{category}</h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services
                .filter((s) => (s.category ?? "General") === category)
                .map((service) => (
                  <li key={service.id}>
                    <Card className="h-full border-border/70 transition-shadow hover:shadow-lift">
                      <CardContent className="flex h-full flex-col p-6">
                        <h3 className="text-xl">{service.name}</h3>
                        <p className="mt-2 flex-1 text-sm text-muted-foreground">
                          {service.description}
                        </p>
                        <p className="mt-4 text-sm font-medium">
                          From {formatINR(service.price_from)}{" "}
                          <span className="font-normal text-muted-foreground">
                            · {service.duration_minutes} min
                          </span>
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link to="/services/$slug" params={{ slug: service.slug }}>
                              Details
                            </Link>
                          </Button>
                          <Button asChild size="sm">
                            <Link to="/book-appointment" search={{ service: service.slug }}>
                              Book
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </PublicShell>
  );
}
