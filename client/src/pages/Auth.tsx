import { Compass, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Field, TextInput } from "../components/common/Field";
import { useAuth } from "../hooks/useAuth";

export function AuthPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp, continueAsGuest } = useAuth();

  const [mode, setMode] = useState<"in" | "up">("in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "in") {
        await signIn(email, password);
        navigate("/app");
      } else {
        const notice = await signUp(fullName, email, password);
        if (notice) {
          setMessage(notice);
        } else {
          navigate("/app");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-8">
      <Link to="/" className="mb-6 flex items-center gap-2 font-display text-2xl text-ink">
        <Compass className="h-6 w-6 text-clay animate-spin" style={{ animationDuration: "16s" }} />
        Daytrail
      </Link>

      <div className="rounded-3xl border border-ink/10 bg-white/90 p-7 shadow-ticket backdrop-blur-md">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-pine mb-2">
          <Sparkles className="h-3 w-3" /> Daytrail Account
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          {mode === "in" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="mt-1 text-xs text-ink/60">
          {mode === "in"
            ? "Sign in to access your planned trips and travel preferences."
            : "Register an account to start saving personalized itineraries."}
        </p>

        {mode === "in" && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-pine/20 bg-pine/5 px-3.5 py-2 text-xs">
            <span className="text-ink/65">
              💡 Demo: <strong className="text-ink">alex@daytrail.app</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail("alex@daytrail.app");
                setPassword("password123");
              }}
              className="font-semibold text-pine hover:underline ml-2"
            >
              Fill Demo
            </button>
          </div>
        )}

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          {mode === "up" ? (
            <Field label="Full Name">
              <TextInput
                value={fullName}
                placeholder="e.g. Marco Polo"
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </Field>
          ) : null}
          <Field label="Email Address">
            <TextInput
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              minLength={6}
              value={password}
              placeholder="••••••••"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>

          {error ? (
            <div className="rounded-xl border border-clay/20 bg-clay/5 p-3 text-xs text-clay">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-xl border border-pine/20 bg-pine/5 p-3 text-xs text-pine">
              {message}
            </div>
          ) : null}

          <Button type="submit" className="w-full mt-2" disabled={busy}>
            {busy ? "Please wait…" : mode === "in" ? "Sign in to Daytrail" : "Create Account"}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            className="text-xs text-pine hover:underline"
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setError(null);
              setMessage(null);
            }}
          >
            {mode === "in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-white px-2 text-ink/40">Or explore without an account</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            continueAsGuest();
            navigate("/app");
          }}
          className="w-full rounded-2xl border border-pine/30 bg-pine/5 py-2.5 text-xs font-semibold text-pine transition hover:bg-pine/10 flex items-center justify-center gap-1.5"
        >
          <Compass className="h-3.5 w-3.5" />
          Continue as Guest Explorer →
        </button>
      </div>
    </div>
  );
}
