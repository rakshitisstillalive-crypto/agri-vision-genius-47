import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Farmer's AI" },
      { name: "description", content: "Choose a new password for your Farmer's AI account." },
      { property: "og:title", content: "Reset password — Farmer's AI" },
      { property: "og:description", content: "Set a new Farmer's AI account password." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    void navigate({ to: "/dashboard" });
  };

  return (
    <div className="gradient-soft flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-14">
      <form onSubmit={submit} className="surface-card w-full max-w-md space-y-4 p-7">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Open this page from the reset link in your email, then choose a new password.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="np">New password</Label>
          <Input
            id="np"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null} Update password
        </Button>
      </form>
    </div>
  );
}
