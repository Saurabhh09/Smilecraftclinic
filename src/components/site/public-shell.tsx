import type { ReactNode } from "react";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { AssistantModal } from "@/components/chat/assistant-modal";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip" suppressHydrationWarning>
      <SiteHeader />
      <main id="main" className="flex-1" suppressHydrationWarning>
        {children}
      </main>
      <SiteFooter />
      <AssistantModal />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="container-page py-14 md:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl md:text-5xl">{title}</h1>
        {intro ? <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p> : null}
      </div>
    </section>
  );
}
