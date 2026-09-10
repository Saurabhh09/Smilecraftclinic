import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/staff/login")({
  head: () => ({
    meta: [
      { title: "Staff Login | SmileCraft Dental Studio" },
      { name: "description", content: "Clinic staff authentication for SmileCraft Dental Studio." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StaffLoginPage,
});

function StaffLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, redirect straight to dashboard
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        void navigate({ to: "/staff/dashboard" });
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.session) {
        setError(authError?.message ?? "Invalid staff credentials.");
        return;
      }

      void navigate({ to: "/staff/dashboard" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during authentication.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("receptionist@smilecraftdental.example");
    setPassword("DemoPassword123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to public clinic site
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-block">
            <Logo size="lg" />
          </div>
          <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Clinic Operations Portal
          </p>
        </div>

        <Card className="border-border/80 shadow-soft">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lock className="size-4" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Staff Sign In</h1>
                <p className="text-xs text-muted-foreground">Authorized clinic staff only</p>
              </div>
            </div>

            {/* Demo Notice Callout */}
            <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-3.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between font-medium text-foreground">
                <span className="flex items-center gap-1.5 text-accent font-semibold">
                  <Sparkles className="size-3.5" /> Portfolio Demo Access
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-xs text-primary font-medium hover:underline underline-offset-2"
                >
                  Fill credentials
                </button>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] bg-background/80 p-2 rounded border border-border/50">
                <p>receptionist@smilecraftdental.example</p>
                <p>DemoPassword123!</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="staff-email">Email Address</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="staff-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@smilecraftdental.example"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="staff-password">Password</Label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="staff-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  "Sign In to Clinic Dashboard"
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 text-accent" />
              <span>Role-Based Access Control (Receptionist / Dentist / Admin)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        SmileCraft Dental Studio · Internal Receptionist & Clinic Operations Portal
      </div>
    </div>
  );
}
