import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in, The Feel Good Society App" },
      { name: "description", content: "Sign in to access your Challenge and Clinic Clients areas." },
      { property: "og:title", content: "Sign in, The Feel Good Society App" },
      { property: "og:description", content: "Sign in to access your Challenge and Clinic Clients areas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Welcome, check your inbox to confirm your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message);
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/app", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="mx-auto w-full max-w-5xl px-6 pt-8">
        <Link to="/" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          ← The Feel Good Society
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-entrance">
          <div className="text-center mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              The Feel Good Society App
            </p>
            <h1 className="mt-3 font-display text-3xl italic">
              {mode === "signin" ? "Sign in" : "Create your account"}
            </h1>
          </div>

          <Button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full rounded-full border border-input bg-card px-5 py-3 text-sm font-semibold hover:bg-muted disabled:opacity-50"
          >
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            )}
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/5 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/5 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <Button variant="link"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-primary underline underline-offset-2"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </Button>
          </p>
        </div>
      </main>
    </div>
  );
}
