import { Link } from "@tanstack/react-router";

import { Logo } from "./logo";
import { CLINIC, FICTION_NOTE, HOURS_DISPLAY } from "@/lib/clinic";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo size="lg" />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{CLINIC.tagline}</p>
          <address className="mt-4 text-sm not-italic text-muted-foreground">
            {CLINIC.address.line1}
            <br />
            {CLINIC.address.line2}
            <br />
            {CLINIC.address.line3}
          </address>
          <p className="mt-4 text-sm">
            <a className="underline underline-offset-4" href={CLINIC.phoneHref}>
              {CLINIC.phone}
            </a>
            <br />
            <a className="underline underline-offset-4" href={`mailto:${CLINIC.email}`}>
              {CLINIC.email}
            </a>
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/services" className="hover:text-foreground">
                Treatments
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                About the clinic
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/book-appointment" className="hover:text-foreground">
                Book an appointment
              </Link>
            </li>
            <li>
              <Link to="/staff/login" className="hover:text-foreground">
                Staff login
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">Opening hours</h2>
          <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {HOURS_DISPLAY.map((row) => (
              <div key={row.day} className="flex justify-between gap-4">
                <dt>{row.day}</dt>
                <dd>{row.hours}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">Timezone: {CLINIC.timezone}</p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page py-6 text-xs text-muted-foreground">
          <p>{FICTION_NOTE}</p>
          <p className="mt-2">
            © {new Date().getFullYear()} {CLINIC.name}. Fictional portfolio project.
          </p>
        </div>
      </div>
    </footer>
  );
}
