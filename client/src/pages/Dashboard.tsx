import { Plus, Sparkles, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Trip } from "@shared/types";
import { Button } from "../components/common/Button";
import { TripCard } from "../components/trip/TripCard";
import { useAuth } from "../hooks/useAuth";
import { listTrips } from "../services/trips";

export function Dashboard() {
  const { user, profile } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listTrips(user?.id)
      .then((data) => {
        setTrips(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-pine">
            <Sparkles className="h-3 w-3" /> Daytrail AI Concierge
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {profile?.full_name ? `Welcome back, ${profile.full_name.split(" ")[0]}!` : "Your Itineraries"}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Intelligent travel planning with personalized pacing, accessibility, and dietary guidance.
          </p>
        </div>
        <Link to="/app/trips/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Plan New Trip
          </Button>
        </Link>
      </div>

      {/* Feature Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-pine/20 bg-gradient-to-r from-pine/10 via-moss/10 to-transparent p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-display text-lg font-semibold text-ink">
              Multi-Step Preference Planner & AI Engine Active
            </p>
            <p className="text-xs text-ink/70 max-w-xl">
              Specify your destination, exact travel dates, activity pacing (relaxed, moderate, fast), dietary restrictions, and mobility concerns. Daytrail constructs dynamic prompts and generates day-by-day itineraries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/history"
              className="rounded-xl border border-ink/15 bg-white/70 px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:bg-white"
            >
              Audit Log / History
            </Link>
            <Link
              to="/app/trips/new"
              className="shrink-0 rounded-xl bg-pine px-4 py-2 text-xs font-semibold text-paper shadow-sm transition hover:bg-pine/90"
            >
              Start Planner Wizard →
            </Link>
          </div>

        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-clay/20 bg-clay/5 p-4 text-sm text-clay">
          {error}
        </div>
      ) : null}

      {/* Trips Grid */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine border-t-transparent" />
        </div>
      ) : trips.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink/20 bg-white/50 p-12 text-center">
          <Compass className="mx-auto h-12 w-12 text-pine/30 mb-3" />
          <p className="font-display text-2xl text-ink">No itineraries planned yet</p>
          <p className="mt-2 text-sm text-ink/60 max-w-md mx-auto">
            Use the 5-step planner to create your first journey with custom pacing and dietary-aware recommendations.
          </p>
          <Link to="/app/trips/new" className="mt-6 inline-block">
            <Button>
              <Plus className="h-4 w-4" />
              Create First Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink/50">
              Active & Saved Itineraries ({trips.length})
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
