import {
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Utensils,
  Landmark,
  Compass,
  Coffee,
  Footprints,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type { Activity } from "@shared/types";
import { ACTIVITY_CATEGORIES } from "@shared/constants";
import { timeLabel } from "../../utils/dates";

const CATEGORY_ICONS: Record<string, typeof MapPin> = {
  sightseeing: MapPin,
  food: Utensils,
  transport: Footprints,
  culture: Landmark,
  nature: Compass,
  leisure: Coffee,
  lodging: Landmark,
  other: MapPin,
};

export function ActivityCard({
  activity,
  onChange,
  onDelete,
}: {
  activity: Activity;
  onChange: (patch: Partial<Activity>) => void;
  onDelete: () => void;
}) {
  const Icon = CATEGORY_ICONS[activity.category] || MapPin;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-white p-4 shadow-sm transition hover:border-pine/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-pine border border-ink/5">
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <input
              className="w-full bg-transparent font-medium text-ink outline-none text-base focus:border-b focus:border-pine"
              value={activity.title}
              onChange={(event) => onChange({ title: event.target.value })}
            />
            {activity.location && (
              <p className="flex items-center gap-1 text-xs text-ink/50 mt-0.5">
                <MapPin className="h-3 w-3 text-pine/70" />
                <span>{activity.location}</span>
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-full p-1.5 text-ink/20 opacity-0 group-hover:opacity-100 transition hover:bg-sand hover:text-clay"
          aria-label="Remove activity"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Personalization Indicators & Badges */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {activity.pacing_tag && (
          <span className="inline-flex items-center gap-1 rounded-md bg-clay/10 px-2 py-0.5 text-[10px] font-semibold text-clay">
            ⚡ {activity.pacing_tag}
          </span>
        )}

        {activity.dietary_note && (
          <span className="inline-flex items-center gap-1 rounded-md bg-moss/10 px-2 py-0.5 text-[10px] font-semibold text-moss">
            <CheckCircle2 className="h-2.5 w-2.5" />
            {activity.dietary_note}
          </span>
        )}

        {activity.accessibility_note && (
          <span className="inline-flex items-center gap-1 rounded-md bg-pine/10 px-2 py-0.5 text-[10px] font-semibold text-pine">
            <ShieldCheck className="h-2.5 w-2.5" />
            {activity.accessibility_note}
          </span>
        )}

        {activity.estimated_cost !== null && activity.estimated_cost !== undefined && activity.estimated_cost > 0 && (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/70">
            <DollarSign className="h-2.5 w-2.5" />
            {activity.estimated_cost} {activity.currency || "USD"}
          </span>
        )}
      </div>

      {activity.notes && (
        <p className="mt-2 text-xs text-ink/65 italic bg-paper/50 rounded-lg p-2 border border-ink/5">
          {activity.notes}
        </p>
      )}

      {/* Quick edit row */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink/5 pt-3 sm:grid-cols-4">
        <div className="flex items-center gap-1 rounded-lg border border-ink/10 bg-paper/60 px-2 py-1 text-xs">
          <Clock className="h-3 w-3 text-ink/40" />
          <input
            type="time"
            className="w-full bg-transparent text-xs outline-none"
            value={timeLabel(activity.start_time)}
            onChange={(event) => onChange({ start_time: event.target.value || null })}
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-ink/10 bg-paper/60 px-2 py-1 text-xs">
          <Clock className="h-3 w-3 text-ink/40" />
          <input
            type="time"
            className="w-full bg-transparent text-xs outline-none"
            value={timeLabel(activity.end_time)}
            onChange={(event) => onChange({ end_time: event.target.value || null })}
          />
        </div>
        <select
          className="rounded-lg border border-ink/10 bg-paper/60 px-2 py-1 text-xs outline-none capitalize"
          value={activity.category}
          onChange={(event) => onChange({ category: event.target.value as Activity["category"] })}
        >
          {ACTIVITY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border border-ink/10 bg-paper/60 px-2 py-1 text-xs outline-none"
          placeholder="Location"
          value={activity.location ?? ""}
          onChange={(event) => onChange({ location: event.target.value })}
        />
      </div>
    </article>
  );
}
