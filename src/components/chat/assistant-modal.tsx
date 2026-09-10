import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  Phone,
  Calendar,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CLINIC, DENTIST, formatINR } from "@/lib/clinic";
import { sendAssistantMessage } from "@/lib/public.functions";

interface ServiceCardItem {
  id?: string;
  name: string;
  slug: string;
  price_from: number;
  description?: string;
}

interface MessageItem {
  id: string;
  role: "assistant" | "user";
  text: string;
  structuredData?: {
    type: "services" | "slots" | "booking_success" | "emergency_alert" | "clinic_info";
    data?: unknown;
  };
  suggestedActions?: string[];
  timestamp: string;
}

export function AssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or restore session ID
  useEffect(() => {
    let sid = "";
    if (typeof window !== "undefined") {
      sid = window.sessionStorage.getItem("smilecraft_chat_session") || "";
      if (!sid) {
        sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        window.sessionStorage.setItem("smilecraft_chat_session", sid);
      }
    }
    setSessionId(sid);

    // Initial greeting if empty
    setMessages([
      {
        id: "m-welcome",
        role: "assistant",
        text: `Hello! I'm the virtual front-desk assistant at SmileCraft Dental Studio in New Delhi. How can I assist you today?`,
        suggestedActions: [
          "Book an appointment",
          "Teeth whitening cost",
          "Clinic opening hours",
          "Emergency dental care",
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    // Custom event listener so any button on the site can open/toggle the assistant
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ toggle?: boolean }>;
      if (customEvent.detail?.toggle) {
        setIsOpen((prev) => !prev);
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener("open-dental-assistant", handleOpenEvent);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("open-dental-assistant", handleOpenEvent);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: MessageItem = {
      id: `usr-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendAssistantMessage({
        data: {
          sessionId: sessionId || "sess_default",
          message: text,
        },
      });

      const assistantMsg: MessageItem = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        text: res.reply,
        structuredData: res.structuredData,
        suggestedActions: res.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          role: "assistant",
          text: "Our front desk system is momentarily busy. Please give us a call at +91 98765 43210 for immediate help.",
          suggestedActions: ["Call clinic now", "Book an appointment"],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95 border border-primary/20"
          aria-label="Open AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="size-4" />
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span>Talk to Assistant</span>
        </button>
      )}

      {/* Assistant Window */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 flex h-[min(540px,calc(100vh-2rem))] max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] w-[calc(100vw-1.5rem)] sm:w-[410px] max-w-[420px] flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 p-1">
                <img src="/favicon.png" alt={CLINIC.name} className="size-5.5 object-contain" />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5 truncate">
                  SmileCraft Front Desk
                  <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-medium shrink-0">
                    AI Assistant
                  </span>
                </h2>
                <p className="text-[11px] text-muted-foreground truncate">
                  {DENTIST.name}'s Practice · New Delhi
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-8.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Assistant"
              title="Close assistant (Esc)"
            >
              <X className="size-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                    <Bot className="size-4" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-2`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 leading-relaxed text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-surface border border-border/70 text-foreground rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line text-xs sm:text-[13px]">{m.text}</p>
                  </div>

                  {/* Structured Data Cards */}
                  {m.structuredData?.type === "services" &&
                    Array.isArray(m.structuredData.data) && (
                      <div className="space-y-1.5 mt-2">
                        {(m.structuredData.data as ServiceCardItem[]).map((svc) => (
                          <div
                            key={svc.id || svc.slug}
                            className="rounded-lg border border-border/60 bg-background p-2.5 text-xs shadow-xs"
                          >
                            <div className="flex justify-between items-start font-medium">
                              <span className="text-foreground">{svc.name}</span>
                              <span className="text-primary font-semibold">
                                From {formatINR(svc.price_from)}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                              {svc.description}
                            </p>
                            <div className="mt-2 flex justify-end">
                              <Button asChild size="sm" className="h-6 text-[10px] px-2">
                                <Link
                                  to="/book-appointment"
                                  search={{ service: svc.slug }}
                                  onClick={() => setIsOpen(false)}
                                >
                                  Request Treatment
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {m.structuredData?.type === "emergency_alert" && (
                    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive space-y-2">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Immediate Emergency Advice</span>
                      </div>
                      <p className="text-[11px] text-foreground">
                        For acute dental trauma or swelling affecting breathing or swallowing,
                        please seek emergency medical attention.
                      </p>
                      <Button
                        asChild
                        size="sm"
                        variant="destructive"
                        className="w-full h-7 text-xs"
                      >
                        <a href={CLINIC.phoneHref}>
                          <Phone className="size-3.5 mr-1" /> Call Clinic Now ({CLINIC.phone})
                        </a>
                      </Button>
                    </div>
                  )}

                  {/* Suggested Quick Replies */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (
                              action === "Book an appointment" ||
                              action.includes("Go to Booking")
                            ) {
                              setIsOpen(false);
                              if (typeof window !== "undefined") {
                                window.location.href = "/book-appointment";
                              }
                            } else {
                              void handleSendMessage(action);
                            }
                          }}
                          className="rounded-full bg-background border border-border/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-primary/40 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="block text-[10px] text-muted-foreground/60 px-1">
                    {m.timestamp}
                  </span>
                </div>

                {m.role === "user" && (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary mt-0.5">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-muted-foreground">
                <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-surface border border-border/60 px-3 py-2">
                  <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Consulting clinic knowledge base...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="border-t border-border bg-surface p-3 space-y-2 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about treatments, pricing, booking, or hours..."
                className="text-xs h-9 bg-background"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="size-9 shrink-0"
              >
                <Send className="size-3.5" />
              </Button>
            </form>

            <p className="text-[10px] text-center text-muted-foreground leading-tight">
              Virtual assistant for general information. Suitability confirmed in clinic.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
