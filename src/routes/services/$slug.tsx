import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CLINIC, formatINR } from "@/lib/clinic";
import { getServiceDetails } from "@/lib/public.functions";

const serviceQuery = (slug: string) =>
  queryOptions({
    queryKey: ["service", slug],
    queryFn: () => getServiceDetails({ data: { slug } }),
  });

export const Route = createFileRoute("/services/$slug")({
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Treatment";
    const description =
      loaderData?.description ??
      "Treatment information at SmileCraft Dental Studio, a fictional dental clinic in New Delhi.";
    return {
      meta: [
        { title: `${name} in New Delhi | SmileCraft Dental Studio` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `${name} | SmileCraft Dental Studio` },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const service = await context.queryClient.ensureQueryData(serviceQuery(params.slug));
    if (!service) throw notFound();
    return service;
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(serviceQuery(slug));
  if (!data) return null;

  return (
    <PublicShell>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-14 md:py-20">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link to="/services" className="underline-offset-4 hover:underline">
              Treatments
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-foreground">{data.name}</span>
          </nav>
          <p className="eyebrow mt-6">{data.category}</p>
          <h1 className="mt-3 max-w-3xl text-4xl md:text-5xl">{data.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{data.description}</p>
        </div>
      </section>

      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <article className="md:col-span-2">
          <h2 className="text-2xl">What to expect</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
            {data.long_description ?? data.description}
          </p>
          <p className="mt-8 rounded-xl bg-surface p-5 text-sm text-muted-foreground">
            This page provides general information only and is not dental advice or a diagnosis.
            Suitability for any treatment is confirmed after an in-clinic assessment.
          </p>
        </article>

        <aside>
          <Card className="sticky top-24 border-border/70 shadow-soft">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Indicative fee</p>
              <p className="font-display text-3xl text-primary">
                From {formatINR(data.price_from)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Typical appointment: {data.duration_minutes} minutes
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Fictional portfolio pricing shown for demonstration.
              </p>
              <Button asChild className="mt-6 w-full">
                <Link to="/book-appointment" search={{ service: data.slug }}>
                  Request this treatment
                </Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <a href={CLINIC.phoneHref}>Call the clinic</a>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PublicShell>
  );
}
