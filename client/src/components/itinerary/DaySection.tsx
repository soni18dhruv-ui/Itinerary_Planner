import { Plus } from "lucide-react";
import { useState } from "react";
import type { Activity, ItineraryDay } from "@shared/types";
import { formatLongDate } from "../../utils/dates";
import { ActivityCard } from "./ActivityCard";

export function DaySection({
  day,
  onAdd,
  onChangeActivity,
  onDeleteActivity,
}: {
  day: ItineraryDay & { activities: Activity[] };
  onAdd: (title: string) => Promise<void>;
  onChangeActivity: (id: string, patch: Partial<Activity>) => void;
  onDeleteActivity: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <section className="relative pl-8">
      <div className="absolute left-0 top-2 h-full w-px bg-ink/10" />
      <div className="absolute left-[-5px] top-3 h-2.5 w-2.5 rounded-full bg-clay" />
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">
        Day {day.day_number} · {formatLongDate(day.date)}
      </p>
      <h2 className="mt-1 font-display text-3xl">{day.title}</h2>
      {day.notes ? <p className="mt-2 max-w-2xl text-sm text-ink/60">{day.notes}</p> : null}
      <div className="mt-4 space-y-3">
        {day.activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onChange={(patch) => onChangeActivity(activity.id, patch)}
            onDelete={() => onDeleteActivity(activity.id)}
          />
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          void onAdd(draft.trim()).then(() => setDraft(""));
        }}
      >
        <input
          className="flex-1 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm"
          placeholder="Add a stop"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className="rounded-full bg-pine px-3 text-paper">
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
