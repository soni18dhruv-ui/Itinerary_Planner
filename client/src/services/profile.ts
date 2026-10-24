import type { Profile } from "@shared/types";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { tripsAPI } from "./tripsAPI";

const LOCAL_STORAGE_KEY = "daytrail_cached_profile";

export async function fetchProfile(userId: string): Promise<Profile> {
  // 1. Try FastAPI backend first
  try {
    const prof = await tripsAPI.getProfile(userId);
    if (prof) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prof));
      return prof;
    }
  } catch (err) {
    console.debug("FastAPI profile fetch error, checking Supabase/local fallback:", err);
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data as Profile;
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback to localStorage or default
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as Profile;
    } catch {
      // ignore
    }
  }

  return {
    id: userId,
    full_name: "Alex Vance",
    home_city: "San Francisco",
    travel_style: "culture",
    budget_level: "moderate",
    interests: ["history", "photography", "markets", "coffee"],
    dietary_notes: "Vegetarian",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function updateProfile(userId: string, patch: Partial<Profile>): Promise<Profile> {
  // 1. Try FastAPI backend first
  try {
    const updated = await tripsAPI.updateProfile(userId, patch);
    if (updated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch (err) {
    console.debug("FastAPI profile update error, falling back to Supabase/local:", err);
  }

  // 2. Try Supabase if configured
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: patch.full_name,
        home_city: patch.home_city,
        travel_style: patch.travel_style,
        budget_level: patch.budget_level,
        interests: patch.interests,
        dietary_notes: patch.dietary_notes,
      })
      .eq("id", userId)
      .select("*")
      .single();
    if (!error && data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data as Profile;
    }
  }

  // 3. Save to localStorage
  const current = await fetchProfile(userId);
  const merged: Profile = {
    ...current,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
