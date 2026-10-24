import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Compass, ArrowRight, Clock, Cpu } from "lucide-react";


import type { HistoryItem } from "@shared/types";
import { tripsAPI } from "../services/tripsAPI";

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripsAPI
      .getHistory()
      .then((data) => {
        setHistory(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-pine">
            <Sparkles className="h-3 w-3" /> AI Engine Audit Log
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Generation History
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Chronological audit of itineraries synthesized by Google Gemini & the Daytrail Semantic Engine.
          </p>
        </div>
        <Link
          to="/app/trips/new"
          className="rounded-xl bg-pine px-4 py-2 text-xs font-semibold text-paper shadow-sm transition hover:bg-pine/90 flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Generate New Itinerary
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-clay/20 bg-clay/5 p-4 text-sm text-clay">
          {error}
        </div>
      ) : null}

      {/* History List */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine border-t-transparent" />
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink/20 bg-white/50 p-12 text-center">
          <Compass className="mx-auto h-12 w-12 text-pine/30 mb-3" />
          <p className="font-display text-2xl text-ink">No generation events yet</p>
          <p className="mt-2 text-sm text-ink/60 max-w-md mx-auto">
            When you create trips and generate day-by-day itineraries with custom pacing, generation logs and model metadata appear here.
          </p>
          <Link
            to="/app/trips/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pine px-5 py-2.5 text-xs font-semibold text-paper"
          >
            Start First Itinerary
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink/50">
              Recorded Generations ({history.length})
            </h2>
          </div>

          <div className="grid gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-sm transition hover:border-pine/30 hover:shadow-md backdrop-blur-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-pine/10 px-2 py-0.5 text-[10px] font-bold uppercase text-pine">
                        <Cpu className="h-2.5 w-2.5" />
                        {item.model_used}
                      </span>
                      <span className="rounded-md bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink/60">
                        {item.days_count} Days
                      </span>
                      <span className="text-[11px] text-ink/40 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.generated_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-ink group-hover:text-pine transition">
                      {item.title}
                    </h3>

                    {item.summary && (
                      <p className="mt-1 text-xs text-ink/65 leading-relaxed max-w-2xl">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      to={`/app/trips/${item.trip_id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 bg-paper/80 px-4 py-2 text-xs font-semibold text-ink transition hover:bg-pine hover:text-paper hover:border-pine shadow-sm"
                    >
                      View Itinerary
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
