import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Farmer's AI" },
      {
        name: "description",
        content:
          "Sign in or create a Farmer's AI account to save analysis history and revisit past crop and soil reports.",
      },
      { property: "og:title", content: "Sign in — Farmer's AI" },
      { property: "og:description", content: "Access your saved crop and soil analysis history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function AuthPage() {
  const { redirect } = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const target = redirect && redirect.startsWith("/") ? redirect : "/dashboard";

  useEffect(() => {
    if (!loading && user) void navigate({ to: target });
  }, [loading, user, navigate, target]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk(email)) { toast.error("Enter a valid email address."); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back.");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk(email)) { toast.error("Enter a valid email address."); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (!data.session) toast.success("Check your inbox to confirm your email address.");
    else toast.success("Account created.");
  };

  const oauth = async (provider: "google" | "microsoft") => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Could not start sign-in. Please try again.");
      return;
    }
    if (!("redirected" in result && result.redirected)) setBusy(false);
  };

  const reset = async () => {
    if (!emailOk(email)) { toast.error("Enter your email first, then tap reset."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent.");
  };

  return (
    <div className="gradient-soft flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="surface-card p-7">
          <div className="flex flex-col items-center text-center">
            <LogoMark className="size-12" />
            <h1 className="mt-4 text-2xl font-bold">Welcome to Farmer&apos;s AI</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Analysis is always free — sign in to save your reports.
            </p>
          </div>

          <div className="mt-6 grid gap-2">
            <Button variant="outline" disabled={busy} onClick={() => oauth("google")}>
              Continue with Google
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => oauth("microsoft")}>
              Continue with Microsoft
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or use email{" "}
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Email</Label>
                  <Input
                    id="si-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-pass">Password</Label>
                  <Input
                    id="si-pass"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null} Sign in
                </Button>
                <button
                  type="button"
                  onClick={reset}
                  className="w-full text-center text-xs text-muted-foreground hover:text-primary"
                >
                  Forgot your password?
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-3 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input
                    id="su-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Email</Label>
                  <Input
                    id="su-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-pass">Password</Label>
                  <Input
                    id="su-pass"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/legal/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
