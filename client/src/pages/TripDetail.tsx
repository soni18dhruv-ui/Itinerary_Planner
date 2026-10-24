import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Trash2,
  ArrowLeft,
  Compass,
  Printer,
  Download,
} from "lucide-react";

import type { TripWithDays } from "@shared/types";
import { TRIP_STATUSES } from "@shared/constants";
import { DaySection } from "../components/itinerary/DaySection";
import { tripsAPI } from "../services/tripsAPI";
import {
  addActivity,
  deleteActivity,
  deleteTrip,
  getTrip,
  updateActivity,
  updateTrip,
} from "../services/trips";
import { formatMoney, formatRange } from "../utils/dates";

export function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripWithDays | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  async function reload() {
    if (!id) return;
    const next = await getTrip(id);
    setTrip(next);
  }

  useEffect(() => {
    reload().catch((err: Error) => setError(err.message));
  }, [id]);

  async function handleRegenerate() {
    if (!trip) return;
    setRegenerating(true);
    setError(null);
    try {
      // Trigger FastAPI AI itinerary generation
      const updated = await tripsAPI.generateItinerary(trip.id);
      setTrip(updated as TripWithDays);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate itinerary");
    } finally {
      setRegenerating(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadJSON() {
    if (!trip) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trip, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${trip.destination.toLowerCase().replace(/\s+/g, "_")}_itinerary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  const totalEstimatedCost = trip?.itinerary_days?.reduce(
    (daySum, day) =>
      daySum +
      (day.activities?.reduce((actSum, a) => actSum + (a.estimated_cost || 0), 0) || 0),
    0
  ) || 0;


  if (error) {
    return (
      <div className="rounded-2xl border border-clay/20 bg-clay/5 p-6 text-center">
        <p className="text-clay font-medium">{error}</p>
        <button
          onClick={() => navigate("/app")}
          className="mt-3 text-sm text-pine underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine border-t-transparent" />
        <p className="text-sm text-ink/50">Loading trip itinerary…</p>
      </div>
    );
  }

  const prefs = trip.preferences;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate("/app")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/60 transition hover:text-pine"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Trips
      </button>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Left Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-clay">
              <MapPin className="h-3.5 w-3.5" />
              {trip.destination}
              {trip.country ? `, ${trip.country}` : ""}
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              {trip.title}
            </h1>
            
            <div className="mt-4 space-y-2 text-xs text-ink/70">
              <p className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-pine" />
                {formatRange(trip.start_date, trip.end_date)}
              </p>
              <p className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-pine" />
                {trip.travelers_count} traveler{trip.travelers_count === 1 ? "" : "s"}
              </p>
              <p className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-pine" />
                {formatMoney(trip.budget_amount, trip.currency)}
              </p>
            </div>

            {/* Pacing & Preferences Pill Box */}
            {prefs && (
              <div className="mt-4 rounded-2xl border border-ink/5 bg-paper/60 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink/60">Pacing:</span>
                  <span className="font-semibold capitalize text-clay">
                    ⚡ {prefs.pacing}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink/60">Style:</span>
                  <span className="font-semibold capitalize text-pine">
                    {prefs.travel_style}
                  </span>
                </div>
                {prefs.dietary_restrictions?.length > 0 && (
                  <div className="text-xs pt-1 border-t border-ink/5">
                    <span className="text-ink/50 block text-[10px] uppercase">Dietary Focus:</span>
                    <span className="text-moss font-medium">
                      {prefs.dietary_restrictions.join(", ")}
                    </span>
                  </div>
                )}
                {prefs.mobility_concerns?.length > 0 && (
                  <div className="text-xs pt-1 border-t border-ink/5">
                    <span className="text-ink/50 block text-[10px] uppercase">Mobility Focus:</span>
                    <span className="text-pine font-medium">
                      {prefs.mobility_concerns.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Status Dropdown */}
            <div className="mt-5">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink/50 mb-1">
                Trip Status
              </label>
              <select
                className="w-full rounded-xl border border-ink/10 bg-paper px-3 py-2 text-xs font-medium text-ink outline-none capitalize"
                value={trip.status}
                onChange={(event) => {
                  const status = event.target.value as TripWithDays["status"];
                  setTrip({ ...trip, status });
                  void updateTrip(trip.id, { status });
                }}
              >
                {TRIP_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget & Cost Tracker */}
            <div className="mt-4 rounded-2xl border border-ink/5 bg-paper/60 p-3 text-xs">
              <div className="flex items-center justify-between text-ink/60">
                <span>Planned Costs:</span>
                <span className="font-semibold text-ink">
                  {totalEstimatedCost.toLocaleString()} {trip.currency}
                </span>
              </div>
              {trip.budget_amount && trip.budget_amount > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-ink/50 mb-1">
                    <span>Budget Utilized</span>
                    <span>
                      {Math.min(100, Math.round((totalEstimatedCost / trip.budget_amount) * 100))}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-ink/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        totalEstimatedCost > trip.budget_amount ? "bg-clay" : "bg-pine"
                      }`}
                      style={{
                        width: `${Math.min(100, (totalEstimatedCost / trip.budget_amount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {trip.notes && (
              <div className="mt-4 text-xs text-ink/70 bg-paper/40 rounded-xl p-3 border border-ink/5">
                <p className="font-medium text-ink/50 uppercase text-[10px] mb-1">Notes</p>
                {trip.notes}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <button
                type="button"
                disabled={regenerating}
                onClick={handleRegenerate}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-pine px-4 py-2.5 text-xs font-semibold text-paper shadow-sm transition hover:bg-pine/90 disabled:opacity-50"
              >
                {regenerating ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper border-t-transparent" />
                    Regenerating with AI…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Regenerate AI Itinerary
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white/70 px-3 py-2 text-xs font-medium text-ink/75 transition hover:bg-white hover:text-ink"
                  title="Print or save as PDF"
                >
                  <Printer className="h-3.5 w-3.5 text-pine" />
                  Print / PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white/70 px-3 py-2 text-xs font-medium text-ink/75 transition hover:bg-white hover:text-ink"
                  title="Export itinerary as JSON file"
                >
                  <Download className="h-3.5 w-3.5 text-clay" />
                  Export JSON
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!confirm("Are you sure you want to delete this trip?")) return;
                  void deleteTrip(trip.id).then(() => navigate("/app"));
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-ink/10 px-4 py-2 text-xs font-medium text-ink/60 transition hover:bg-sand/30 hover:text-clay"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete trip
              </button>
            </div>
          </div>
        </aside>


        {/* Right Main Days Section */}
        <div className="space-y-10">
          {trip.itinerary_days?.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-ink/20 bg-white/50 p-12 text-center">
              <Compass className="mx-auto h-10 w-10 text-pine/40 mb-3" />
              <p className="font-display text-2xl text-ink">No days generated yet</p>
              <p className="mt-2 text-sm text-ink/60 max-w-md mx-auto">
                Daytrail can synthesize a comprehensive personalized itinerary adhering to your preferences.
              </p>
              <button
                type="button"
                disabled={regenerating}
                onClick={handleRegenerate}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-clay px-6 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-clay/90"
              >
                <Sparkles className="h-4 w-4" />
                Generate Itinerary Now
              </button>
            </div>
          ) : (
            trip.itinerary_days?.map((day) => (
              <DaySection
                key={day.id}
                day={day}
                onAdd={async (title) => {
                  const created = await addActivity(trip.id, day.id, title);
                  setTrip((current) =>
                    current
                      ? {
                          ...current,
                          itinerary_days: current.itinerary_days.map((item) =>
                            item.id === day.id
                              ? { ...item, activities: [...item.activities, created] }
                              : item,
                          ),
                        }
                      : current,
                  );
                }}
                onChangeActivity={(activityId, patch) => {
                  setTrip((current) =>
                    current
                      ? {
                          ...current,
                          itinerary_days: current.itinerary_days.map((item) =>
                            item.id === day.id
                              ? {
                                  ...item,
                                  activities: item.activities.map((activity) =>
                                    activity.id === activityId ? { ...activity, ...patch } : activity,
                                  ),
                                }
                              : item,
                          ),
                        }
                      : current,
                  );
                  void updateActivity(trip.id, activityId, patch);
                }}
                onDeleteActivity={(activityId) => {
                  setTrip((current) =>
                    current
                      ? {
                          ...current,
                          itinerary_days: current.itinerary_days.map((item) =>
                            item.id === day.id
                              ? {
                                  ...item,
                                  activities: item.activities.filter(
                                    (activity) => activity.id !== activityId,
                                  ),
                                }
                              : item,
                          ),
                        }
                      : current,
                  );
                  void deleteActivity(trip.id, activityId);
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
