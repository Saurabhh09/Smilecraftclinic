import { useRef, useState } from "react";
import { ArrowRight, GripVertical, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { SMILE_CASES, type SmileCase } from "@/lib/clinic";

function PlaceholderImage({ side, treatment }: { side: "before" | "after"; treatment: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center ${side === "after" ? "bg-secondary" : "bg-muted"}`}>
      <div className="max-w-[15rem] px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {side === "before" ? "Before treatment" : "After treatment"}
        </p>
        <p className="mt-3 font-display text-2xl text-primary">{treatment}</p>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Fictional case image placeholder. Replace with the supplied portfolio asset.
        </p>
      </div>
    </div>
  );
}

function CaseSelector({ activeCase, onSelect }: { activeCase: SmileCase; onSelect: (index: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Choose a comparison case">
      {SMILE_CASES.map((item, index) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={item.id === activeCase.id}
          onClick={() => onSelect(index)}
          className={`rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            item.id === activeCase.id
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:border-accent hover:text-accent"
          }`}
        >
          Case {item.caseNumber}
        </button>
      ))}
    </div>
  );
}

function BeforeAfterSlider({ smileCase, position, onPositionChange }: { smileCase: SmileCase; position: number; onPositionChange: (value: number) => void }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const updateFromPointer = (clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const bounds = frame.getBoundingClientRect();
    onPositionChange(Math.max(0, Math.min(100, ((clientX - bounds.left) / bounds.width) * 100)));
  };

  return (
    <div>
      <div
        ref={frameRef}
        className={`relative aspect-[4/3] touch-none select-none overflow-hidden rounded-xl border border-border/70 bg-card ${dragging ? "cursor-grabbing" : "cursor-ew-resize"}`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
          updateFromPointer(event.clientX);
        }}
        onPointerMove={(event) => {
          if (dragging) updateFromPointer(event.clientX);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        role="group"
        aria-label="Interactive before and after comparison"
      >
        {smileCase.afterImage ? (
          <img src={smileCase.afterImage} alt={smileCase.afterAlt} className="absolute inset-0 size-full object-cover" />
        ) : (
          <PlaceholderImage side="after" treatment={smileCase.treatment} />
        )}
        <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${position}%` }}>
          {smileCase.beforeImage ? (
            <img src={smileCase.beforeImage} alt={smileCase.beforeAlt} className="absolute inset-0 size-full max-w-none object-cover" style={{ width: frameRef.current?.offsetWidth }} />
          ) : (
            <div className="relative size-full" style={{ width: frameRef.current?.offsetWidth }}>
              <PlaceholderImage side="before" treatment={smileCase.treatment} />
            </div>
          )}
        </div>
        <span className="absolute left-4 top-4 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-primary-foreground">
          Before
        </span>
        <span className="absolute right-4 top-4 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-accent-foreground">
          After treatment
        </span>
        <button
          type="button"
          aria-label="Comparison slider. Use left and right arrow keys to reveal more of the before or after treatment image."
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          role="slider"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              onPositionChange(Math.max(0, Math.min(100, position + (event.key === "ArrowLeft" ? -5 : 5))));
            }
          }}
          className="absolute inset-y-0 z-10 -ml-px w-1 cursor-ew-resize bg-accent shadow-[0_0_0_1px_rgba(255,255,255,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{ left: `${position}%` }}
        >
          <span className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-accent text-accent-foreground shadow-lift">
            <GripVertical aria-hidden="true" className="size-5" />
          </span>
        </button>
      </div>
      <div className="mt-3 flex justify-between text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        <span>Drag left to reveal after</span>
        <span>Drag right to view before</span>
      </div>
    </div>
  );
}

function CaseInformation({ smileCase }: { smileCase: SmileCase }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
      <p className="eyebrow">
        Case {smileCase.caseNumber} · {smileCase.treatment}
      </p>
      <h3 className="mt-3 text-2xl leading-tight md:text-3xl">{smileCase.title}</h3>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-accent">
        Treatment timeline
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{smileCase.timeline}</p>
      <p className="mt-6 leading-relaxed text-muted-foreground">{smileCase.description}</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/services/$slug" params={{ slug: smileCase.serviceSlug }}>
            Explore treatment <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/book-appointment" search={{ service: smileCase.serviceSlug }}>
            Book a consultation
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function BeforeAfterSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState(50);
  const activeCase = SMILE_CASES[activeIndex];

  const selectCase = (index: number) => {
    setActiveIndex(index);
    setPosition(50);
  };

  return (
    <section aria-labelledby="before-after-heading" className="section-y bg-background">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow flex items-center gap-2"><Sparkles aria-hidden="true" className="size-4" />Interactive smile comparison</p>
            <h2 id="before-after-heading" className="mt-3 text-3xl md:text-5xl">Witness the Transformation</h2>
            <p className="mt-4 text-lg text-muted-foreground">Explore selected treatment journeys through interactive before-and-after comparisons.</p>
          </div>
          <CaseSelector activeCase={activeCase} onSelect={selectCase} />
        </div>

        <div className="mt-10 grid gap-6 rounded-2xl border border-border/70 bg-surface p-4 shadow-soft md:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] md:p-6">
          <BeforeAfterSlider smileCase={activeCase} position={position} onPositionChange={setPosition} />
          <CaseInformation smileCase={activeCase} />
        </div>
        <p className="mt-5 text-center text-xs text-muted-foreground">Portfolio demonstration only. Patient images, treatment cases, and outcomes shown here are fictional and are not representative of actual clinical results.</p>
      </div>
    </section>
  );
}