import {
  Compass,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Footprints,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Navigation */}
      <header className="flex items-center justify-between border-b border-ink/10 pb-5">
        <div className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-ink">
          <Compass className="h-6 w-6 text-clay animate-spin" style={{ animationDuration: "12s" }} />
          Daytrail
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="rounded-full px-4 py-2 text-sm font-medium text-ink/70 hover:text-ink transition"
          >
            Sign in
          </Link>
          <Link
            to="/app"
            className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-medium text-ink/70 hover:text-ink transition"
          >
            Dashboard
          </Link>
          <Link
            to="/app/trips/new"
            className="rounded-full bg-pine px-5 py-2 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine/90"
          >
            Plan a Trip
          </Link>
        </div>

      </header>

      {/* Hero Section */}
      <section className="mt-12 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-pine/20 bg-pine/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-pine">
            <Sparkles className="h-3.5 w-3.5" />
            AI Prompt Engineering & Itinerary Architecture
          </div>
          <h1 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[1.08] text-ink sm:text-6xl">
            A travel itinerary that understands how you actually travel.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink/75 leading-relaxed">
            Multi-step preferences calibrate activity pacing, dietary restrictions, and physical mobility needs into custom AI prompts and day-by-day itineraries.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/app/trips/new"
              className="flex items-center gap-2 rounded-2xl bg-clay px-6 py-3.5 text-sm font-semibold text-paper shadow-md shadow-clay/20 transition hover:bg-clay/90 hover:scale-[1.02]"
            >
              Start 5-Step Planner <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/app"
              className="rounded-2xl border border-ink/15 bg-white/70 px-5 py-3.5 text-sm font-semibold text-ink shadow-sm transition hover:bg-white hover:border-ink/30"
            >
              View Sample Itineraries
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-ink/60 border-t border-ink/10 pt-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="h-3.5 w-3.5 text-clay" />
              Relaxed, Moderate & Fast Pacing
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-moss" />
              Verified Dietary Accommodations
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-pine" />
              Mobility & Step-Free Routing
            </span>
          </div>
        </div>

        {/* Visual Showcase Card */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white/80 p-3 shadow-2xl backdrop-blur-md">
            <img
              src="/travel_hero.jpg"
              alt="Daytrail AI Trip Planner Interface"
              className="w-full rounded-2xl object-cover shadow-sm transition hover:scale-[1.01] duration-300"
            />
            <div className="mt-3 flex items-center justify-between px-2 py-1 text-xs text-ink/70">
              <span className="flex items-center gap-1 font-semibold text-pine">
                <Compass className="h-3.5 w-3.5" />
                Kyoto & Rome Live Itinerary Blueprint
              </span>
              <span className="rounded-full bg-clay/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-clay">
                ⚡ FastAPI + Gemini AI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="mt-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-pine">Architecture & Intelligence</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Built For Personalized Travel</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-sm hover:border-pine/30 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pine/10 text-pine mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-ink">Dynamic AI Prompt Layer</h3>
            <p className="mt-2 text-sm text-ink/70 leading-relaxed">
              Synthesizes user destination, group size, budget, and passions into structured natural-language directives with schema-enforced output.
            </p>
          </article>

          <article className="rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-sm hover:border-clay/30 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-clay/10 text-clay mb-4">
              <Footprints className="h-5 w-5" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-ink">Activity Pacing Logic</h3>
            <p className="mt-2 text-sm text-ink/70 leading-relaxed">
              Calibrates morning starts, inter-stop buffers, and stop density from relaxed 2-3 stops with 90m downtime to fast 5-6 high-energy stops.
            </p>
          </article>

          <article className="rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-sm hover:border-moss/30 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-moss/10 text-moss mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-ink">Dietary & Mobility Safety</h3>
            <p className="mt-2 text-sm text-ink/70 leading-relaxed">
              Actively tags vegan, halal, kosher, and allergy constraints on food stops, and enforces step-free, elevator-accessible routing.
            </p>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-ink/10 pt-6 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs text-ink/50 gap-4">
        <p>© 2026 Daytrail Itinerary Planner. All rights reserved.</p>
        <p>Built with React, FastAPI, Framer Motion, and Tailwind CSS.</p>
      </footer>
    </div>
  );
}
