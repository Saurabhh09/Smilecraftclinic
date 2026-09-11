import { Link } from "@tanstack/react-router";
import { Laptop, Menu, Moon, Phone, Sparkles, Sun, SunMoon } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CLINIC } from "@/lib/clinic";

type Theme = "system" | "light" | "dark";

const NAV = [
  { to: "/services", label: "Treatments" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("smilecraft-theme");
    if (savedTheme === "system" || savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => {
      const isDark = theme === "dark" || (theme === "system" && mediaQuery.matches);
      document.documentElement.classList.toggle("dark", isDark);
    };

    updateTheme();
    if (theme === "system") {
      mediaQuery.addEventListener("change", updateTheme);
      return () => mediaQuery.removeEventListener("change", updateTheme);
    }
  }, [theme]);

  const changeTheme = (nextTheme: string) => {
    if (nextTheme !== "system" && nextTheme !== "light" && nextTheme !== "dark") return;
    setTheme(nextTheme);
    window.localStorage.setItem("smilecraft-theme", nextTheme);
  };

  const openAssistant = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-dental-assistant", { detail: { toggle: true } }));
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 sm:h-18 md:h-20 items-center justify-between gap-3 sm:gap-4 py-2">
        <div className="flex items-center shrink-0">
          <Logo size="md" />
        </div>

        {/* Desktop Navigation (visible on large screens 1024px+) */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex xl:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground hover:bg-secondary/50"
              activeProps={{ className: "text-accent font-semibold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* AI Assistant button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 px-2.5 sm:px-3 gap-1.5 text-xs font-medium text-accent border-accent/30 hover:bg-accent/10 hover:text-accent shrink-0"
            onClick={openAssistant}
          >
            <Sparkles className="size-3.5 shrink-0" />
            <span className="hidden xs:inline">AI Assistant</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                aria-label="Change color theme"
              >
                <SunMoon className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme} onValueChange={changeTheme}>
                <DropdownMenuRadioItem value="system">
                  <Laptop aria-hidden="true" />
                  System
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="light">
                  <Sun aria-hidden="true" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon aria-hidden="true" />
                  Dark
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Phone (extra-large desktop only to prevent tablet/laptop crowd) */}
          <Button asChild variant="ghost" size="sm" className="hidden xl:inline-flex h-9 text-xs">
            <a href={CLINIC.phoneHref}>
              <Phone className="size-3.5 mr-1" aria-hidden="true" />
              {CLINIC.phone}
            </a>
          </Button>

          {/* Book an appointment (visible on tablet and desktop) */}
          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex h-8 sm:h-9 px-3 sm:px-4 text-xs font-semibold shrink-0 shadow-xs"
          >
            <Link to="/book-appointment">Book an appointment</Link>
          </Button>

          {/* Mobile/Tablet Menu Trigger (visible under 1024px) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                aria-label="Open navigation menu"
              >
                <Menu className="size-4.5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm p-0 flex flex-col">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
                <Logo size="sm" />
              </div>
              <nav
                aria-label="Mobile"
                className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6"
              >
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-base font-medium text-foreground/90 transition-colors hover:bg-secondary hover:text-foreground"
                    activeProps={{ className: "text-accent bg-secondary/60 font-semibold" }}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-6 flex flex-col gap-2 border-t border-border/60 pt-6">
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 text-accent border-accent/30 hover:bg-accent/10"
                    onClick={() => {
                      setOpen(false);
                      openAssistant();
                    }}
                  >
                    <Sparkles className="size-4" />
                    Ask AI Assistant
                  </Button>
                  <Button asChild className="w-full justify-center shadow-xs">
                    <Link to="/book-appointment" onClick={() => setOpen(false)}>
                      Book an appointment
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-center">
                    <a href={CLINIC.phoneHref}>
                      <Phone className="size-4 mr-2" />
                      Call {CLINIC.phone}
                    </a>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
