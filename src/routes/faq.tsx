import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search, HelpCircle, Phone, ArrowRight, Sparkles } from "lucide-react";

import { PageHeader, PublicShell } from "@/components/site/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CLINIC, FICTION_NOTE } from "@/lib/clinic";
import { getFAQ } from "@/lib/public.functions";

const faqQuery = queryOptions({
  queryKey: ["faq"],
  queryFn: () => getFAQ(),
});

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | SmileCraft Dental Studio" },
      {
        name: "description",
        content:
          "Find answers to common questions about dental check-ups, teeth whitening, clear aligners, appointments, payment methods and emergency dental care.",
      },
      { property: "og:title", content: "Frequently Asked Questions | SmileCraft Dental Studio" },
      {
        property: "og:description",
        content: "Answers about clinic appointments, opening hours, pricing and treatments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(faqQuery),
  component: FAQPage,
});

function FAQPage() {
  const { data: faqs } = useSuspenseQuery(faqQuery);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set(faqs.map((f) => f.category));
    return ["All", ...Array.from(set)];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, search]);

  return (
    <PublicShell>
      <PageHeader
        eyebrow="Knowledge Base"
        title="Frequently Asked Questions"
        intro="Everything you need to know about our clinic, appointments, treatments, and procedures. If you have an urgent inquiry, you can always call us directly."
      />

      <div className="container-page py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          {/* Search & Category filter */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions or keywords (e.g. whitening, cost, emergency)..."
                className="pl-10 h-11"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion list */}
          <div className="mt-8">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-xl border border-border/70 bg-card p-10 text-center">
                <HelpCircle className="mx-auto size-8 text-muted-foreground/60" />
                <p className="mt-3 font-medium">No matching questions found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try searching with different terms or reset your category filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                  }}
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="rounded-xl border border-border/70 bg-card px-5 shadow-soft transition-colors"
                  >
                    <AccordionTrigger className="text-left font-medium py-4 text-base hover:no-underline">
                      <span className="flex items-center gap-2.5">
                        <span className="text-xs px-2 py-0.5 rounded bg-surface border border-border/50 text-muted-foreground font-normal">
                          {faq.category}
                        </span>
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 pt-1 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* Bottom Callout */}
          <div className="mt-14 rounded-2xl border border-border/80 bg-surface p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h2 className="text-lg font-semibold">Still have a question?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our front-desk team is happy to discuss your oral health goals and answer any
                  specific questions.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <Button asChild size="sm">
                  <Link to="/book-appointment">
                    Book visit <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={CLINIC.phoneHref}>
                    <Phone className="mr-1 size-3.5" /> Call {CLINIC.phone}
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>{FICTION_NOTE}</p>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
