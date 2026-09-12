import { CheckCircle2, GraduationCap } from "lucide-react";

import { DOCTORS, type DoctorProfile } from "@/lib/clinic";

function DoctorCard({ doctor }: { doctor: DoctorProfile }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-within:ring-2 focus-within:ring-ring">
      <div className="relative aspect-[1.12] overflow-hidden bg-secondary">
        <img
          src={doctor.image}
          alt={`${doctor.name}, ${doctor.role} at SmileCraft Dental Studio`}
          loading="lazy"
          className="size-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-3 bottom-3 rounded-lg bg-accent px-3 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-accent-foreground shadow-sm">
          {doctor.specialization}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-2xl leading-tight">{doctor.name}</h3>
        <p className="mt-1 text-sm font-medium text-foreground/80">{doctor.qualification}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.09em] text-accent">
          {doctor.role}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap aria-hidden="true" className="size-4 shrink-0 text-accent" />
          <span>
            {doctor.qualification} <span aria-hidden="true">|</span> {doctor.experience} experience
          </span>
        </div>
        <p className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>
        <div className="mt-5 border-t border-border/70 pt-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            {doctor.availability}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Languages: {doctor.languages}</p>
        </div>
      </div>
    </article>
  );
}

export function DentalSpecialists() {
  return (
    <section aria-labelledby="specialists-heading" className="section-y bg-surface">
      <div className="container-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Our experts</p>
            <h2 id="specialists-heading" className="mt-3 max-w-3xl text-3xl md:text-5xl">
              Meet Our Dental Specialists
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              A team of experienced professionals dedicated to your oral health and overall well-being.
            </p>
          </div>
          <span className="hidden border-b border-accent/30 pb-2 text-sm text-muted-foreground md:block">
            A healthier you, together
          </span>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DOCTORS.map((doctor) => (
            <li key={doctor.id} className="min-w-0">
              <DoctorCard doctor={doctor} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}