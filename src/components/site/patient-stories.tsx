import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

import { TESTIMONIALS, type PatientTestimonial } from "@/lib/clinic";

function PatientAvatar({
  testimonial,
  active = false,
}: {
  testimonial: PatientTestimonial;
  active?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-12 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tracking-wide transition-colors ${
        active ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-primary"
      }`}
    >
      {testimonial.initials}
    </span>
  );
}

export function PatientStories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<number | null>(null);
  const testimonial = TESTIMONIALS[activeIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isPaused, reducedMotion]);

  const selectTestimonial = (index: number) => setActiveIndex(index);
  const selectPrevious = () =>
    setActiveIndex((current) => (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const selectNext = () => setActiveIndex((current) => (current + 1) % TESTIMONIALS.length);

  return (
    <section
      aria-labelledby="patient-stories-heading"
      className="section-y bg-surface"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          selectPrevious();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          selectNext();
        }
      }}
    >
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Patient stories</p>
          <h2 id="patient-stories-heading" className="mt-3 text-3xl md:text-5xl">
            Trusted by 5,000+ Happy Smiles
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hear stories from patients who have experienced personalized care designed around
            comfort, confidence, and healthier smiles.
          </p>
        </div>

        <div
          className="mx-auto mt-10 max-w-5xl"
          onPointerDown={(event) => {
            touchStart.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (touchStart.current === null) return;
            const distance = event.clientX - touchStart.current;
            if (Math.abs(distance) > 50) (distance > 0 ? selectPrevious : selectNext)();
            touchStart.current = null;
          }}
          onPointerCancel={() => {
            touchStart.current = null;
          }}
        >
          <article
            aria-live="polite"
            aria-roledescription="slide"
            aria-label={`${activeIndex + 1} of ${TESTIMONIALS.length}: ${testimonial.patientName}`}
            className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-soft sm:p-8 md:p-12"
          >
            <Quote
              aria-hidden="true"
              className="absolute right-7 top-6 size-16 text-accent/15 md:right-10 md:top-8 md:size-20"
            />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="flex gap-1 text-accent"
                  aria-label={`${testimonial.rating} out of 5 stars`}
                >
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} aria-hidden="true" className="size-4 fill-current" />
                  ))}
                </span>
                <span className="eyebrow">Patient testimonial</span>
              </div>

              <blockquote className="mt-7 max-w-4xl font-display text-2xl leading-relaxed text-primary sm:text-3xl md:text-4xl">
                “{testimonial.quote}”
              </blockquote>

              <div className="mt-8 grid gap-6 border-t border-border/70 pt-6 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="flex items-center gap-3">
                  <PatientAvatar testimonial={testimonial} active />
                  <div>
                    <p className="font-semibold text-primary">
                      {testimonial.patientName}, {testimonial.age}
                    </p>
                    <p className="text-sm text-muted-foreground">{testimonial.occupation}</p>
                    <p className="mt-2 inline-flex rounded-md bg-accent/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                      {testimonial.treatment}
                    </p>
                  </div>
                </div>
                <div className="border-l-2 border-accent/30 pl-4 sm:max-w-[12rem]">
                  <p className="eyebrow text-[0.65rem]">Case result</p>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {testimonial.resultLabel}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{testimonial.resultStatus}</p>
                </div>
              </div>
            </div>
          </article>

          <div className="mt-7 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={selectPrevious}
              aria-label="Previous testimonial"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <div
              className="flex items-center gap-2"
              role="tablist"
              aria-label="Choose patient story"
            >
              {TESTIMONIALS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`Show testimonial from ${item.patientName}`}
                  onClick={() => selectTestimonial(index)}
                  className={`size-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    index === activeIndex ? "bg-accent" : "bg-border hover:bg-accent/50"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={selectNext}
              aria-label="Next testimonial"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div
            className="mt-7 flex justify-center gap-3 overflow-x-auto pb-1"
            role="tablist"
            aria-label="Patient story profiles"
          >
            {TESTIMONIALS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Show testimonial from ${item.patientName}`}
                onClick={() => selectTestimonial(index)}
                className="shrink-0 rounded-full p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PatientAvatar testimonial={item} active={index === activeIndex} />
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Portfolio demo testimonials. Names, stories, ratings, and treatment details are
            fictional.
          </p>
        </div>
      </div>
    </section>
  );
}
