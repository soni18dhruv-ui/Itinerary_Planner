import { FormEvent, useEffect, useState } from "react";
import { BUDGET_LEVELS, INTERESTS, TRAVEL_STYLES } from "@shared/constants";
import type { BudgetLevel, TravelStyle } from "@shared/types";
import { Button } from "../components/common/Button";
import { Field, TextArea, TextInput } from "../components/common/Field";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../services/profile";

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    home_city: profile?.home_city ?? "",
    travel_style: (profile?.travel_style ?? "mixed") as TravelStyle,
    budget_level: (profile?.budget_level ?? "moderate") as BudgetLevel,
    interests: profile?.interests ?? [],
    dietary_notes: profile?.dietary_notes ?? "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      home_city: profile.home_city ?? "",
      travel_style: profile.travel_style,
      budget_level: profile.budget_level,
      interests: profile.interests ?? [],
      dietary_notes: profile.dietary_notes ?? "",
    });
  }, [profile]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setMessage(null);
    try {
      await updateProfile(user.id, form);
      await refreshProfile();
      setMessage("Preferences saved. New trips will follow this mix.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  function toggleInterest(interest: string) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs uppercase tracking-[0.18em] text-pine">Preferences</p>
      <h1 className="mt-2 font-display text-4xl">How you like to travel</h1>
      <form className="mt-8 space-y-6 rounded-3xl border border-ink/10 bg-white/70 p-6" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <TextInput value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
          </Field>
          <Field label="Home city">
            <TextInput value={form.home_city} onChange={(event) => setForm({ ...form, home_city: event.target.value })} />
          </Field>
        </div>
        <fieldset>
          <legend className="text-xs uppercase tracking-[0.16em] text-ink/60">Travel style</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TRAVEL_STYLES.map((style) => (
              <label
                key={style.id}
                className={`cursor-pointer rounded-2xl border p-3 text-sm ${
                  form.travel_style === style.id ? "border-pine bg-pine/5" : "border-ink/10 bg-white"
                }`}
              >
                <input
                  type="radio"
                  className="mr-2"
                  checked={form.travel_style === style.id}
                  onChange={() => setForm({ ...form, travel_style: style.id })}
                />
                <span className="font-medium">{style.label}</span>
                <p className="mt-1 text-ink/55">{style.description}</p>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-xs uppercase tracking-[0.16em] text-ink/60">Budget</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {BUDGET_LEVELS.map((level) => (
              <label
                key={level.id}
                className={`cursor-pointer rounded-2xl border p-3 text-sm ${
                  form.budget_level === level.id ? "border-clay bg-clay/5" : "border-ink/10 bg-white"
                }`}
              >
                <input
                  type="radio"
                  className="mr-2"
                  checked={form.budget_level === level.id}
                  onChange={() => setForm({ ...form, budget_level: level.id })}
                />
                {level.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-xs uppercase tracking-[0.16em] text-ink/60">Interests</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {INTERESTS.map((interest) => {
              const on = form.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-3 py-1 text-sm ${on ? "bg-ink text-paper" : "bg-sand text-ink"}`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </fieldset>
        <Field label="Dietary notes">
          <TextArea
            value={form.dietary_notes}
            onChange={(event) => setForm({ ...form, dietary_notes: event.target.value })}
          />
        </Field>
        {message ? <p className="text-sm text-pine">{message}</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save preferences"}
        </Button>
      </form>
    </div>
  );
}
