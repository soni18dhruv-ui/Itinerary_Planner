import type { Activity, ItineraryDay, Trip, TripWithDays, TravelPreferences } from "@shared/types";
import { generateItinerary } from "@shared/utils/generateItinerary";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { fetchProfile } from "./profile";
import { tripsAPI, type CreateTripPayload } from "./tripsAPI";

export async function listTrips(userId?: string): Promise<Trip[]> {
  // 1. Try FastAPI backend first
  try {
    const apiTrips = await tripsAPI.getTrips(userId);
    if (apiTrips && apiTrips.length > 0) {
      return apiTrips;
    }
  } catch (err) {
    console.debug("FastAPI trips fetch error, checking Supabase/local fallback:", err);
  }

  // 2. Fallback to Supabase if configured
  if (isSupabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false });
    if (!error && data) return data as Trip[];
  }

  // 3. Fallback: return default demo trip
  try {
    const directTrips = await tripsAPI.getTrips();
    return directTrips;
  } catch {
    return [];
  }
}

export async function getTrip(tripId: string): Promise<TripWithDays> {
  // 1. Try FastAPI backend first
  try {
    const apiTrip = await tripsAPI.getTrip(tripId);
    if (apiTrip) {
      return apiTrip as TripWithDays;
    }
  } catch (err) {
    console.debug("FastAPI getTrip failed, checking Supabase fallback:", err);
  }

  // 2. Supabase fallback
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("trips")
      .select("*, itinerary_days(*, activities(*))")
      .eq("id", tripId)
      .single();
    if (error) throw error;
    const trip = data as TripWithDays;
    trip.itinerary_days = [...(trip.itinerary_days ?? [])]
      .sort((a, b) => a.day_number - b.day_number)
      .map((day) => ({
        ...day,
        activities: [...(day.activities ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      }));
    return trip;
  }

  throw new Error(`Trip ${tripId} not found`);
}

export type NewTripInput = {
  title: string;
  destination: string;
  country?: string | null;
  start_date: string;
  end_date: string;
  travelers_count: number;
  budget_amount: number | null;
  currency: string;
  notes?: string | null;
  preferences?: TravelPreferences;
  generate?: boolean;
};

export async function createTrip(userId: string, input: NewTripInput): Promise<Trip> {
  const defaultPref: TravelPreferences = input.preferences || {
    travel_style: "mixed",
    pacing: "moderate",
    budget_level: "moderate",
    interests: [],
    dietary_restrictions: [],
    mobility_concerns: [],
  };

  const payload: CreateTripPayload = {
    title: input.title,
    destination: input.destination,
    country: input.country || null,
    start_date: input.start_date,
    end_date: input.end_date,
    travelers_count: input.travelers_count,
    budget_amount: input.budget_amount,
    currency: input.currency,
    preferences: defaultPref,
    generate: input.generate ?? true,
    user_id: userId,
  };

  // 1. Call FastAPI backend via tripsAPI
  try {
    const trip = await tripsAPI.createTrip(payload);
    return trip;
  } catch (err) {
    console.warn("FastAPI createTrip failed, attempting Supabase fallback:", err);
  }

  // 2. Supabase fallback
  if (isSupabaseConfigured && supabase) {
    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        user_id: userId,
        title: input.title,
        destination: input.destination,
        country: input.country || null,
        start_date: input.start_date,
        end_date: input.end_date,
        travelers_count: input.travelers_count,
        budget_amount: input.budget_amount,
        currency: input.currency,
        notes: input.notes || null,
        status: "planning",
      })
      .select("*")
      .single();
    if (error) throw error;

    if (input.generate) {
      await fillItinerary(userId, trip as Trip);
    }
    return trip as Trip;
  }

  throw new Error("Unable to create trip. Please ensure backend is running.");
}

export async function updateTrip(tripId: string, patch: Partial<Trip>): Promise<Trip> {
  try {
    return await tripsAPI.updateTrip(tripId, patch);
  } catch (err) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("trips")
        .update(patch)
        .eq("id", tripId)
        .select("*")
        .single();
      if (error) throw error;
      return data as Trip;
    }
    throw err;
  }
}

export async function deleteTrip(tripId: string): Promise<void> {
  try {
    await tripsAPI.deleteTrip(tripId);
    return;
  } catch (err) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("trips").delete().eq("id", tripId);
      if (error) throw error;
      return;
    }
    throw err;
  }
}

export async function fillItinerary(userId: string, trip: Trip) {
  if (isSupabaseConfigured && supabase) {
    const profile = await fetchProfile(userId);
    const generated = generateItinerary({
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      travelStyle: profile.travel_style,
      budgetLevel: profile.budget_level,
      interests: profile.interests,
    });

    const { data: existingDays, error: existingError } = await supabase
      .from("itinerary_days")
      .select("id")
      .eq("trip_id", trip.id);
    if (existingError) throw existingError;

    const dayIds = (existingDays ?? []).map((row) => row.id);
    if (dayIds.length) {
      const { error } = await supabase.from("activities").delete().in("day_id", dayIds);
      if (error) throw error;
    }

    const { error: deleteDaysError } = await supabase.from("itinerary_days").delete().eq("trip_id", trip.id);
    if (deleteDaysError) throw deleteDaysError;

    const { data: days, error: dayError } = await supabase
      .from("itinerary_days")
      .insert(
        generated.map((day) => ({
          trip_id: trip.id,
          day_number: day.day_number,
          date: day.date,
          title: day.title,
          notes: day.notes,
        })),
      )
      .select("*");
    if (dayError) throw dayError;

    const dayRows = (days ?? []) as ItineraryDay[];
    const activityRows = generated.flatMap((day) => {
      const saved = dayRows.find((row) => row.day_number === day.day_number);
      if (!saved) return [];
      return day.activities.map((activity) => ({
        day_id: saved.id,
        ...activity,
      }));
    });

    if (activityRows.length) {
      const { error } = await supabase.from("activities").insert(activityRows);
      if (error) throw error;
    }
  }
}

export async function addActivity(tripId: string, dayId: string, title: string): Promise<Activity> {
  try {
    return await tripsAPI.addActivity(tripId, dayId, { title, category: "other" });
  } catch (err) {
    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from("activities")
        .select("sort_order")
        .eq("day_id", dayId)
        .order("sort_order", { ascending: false })
        .limit(1);
      const sort_order = (existing?.[0]?.sort_order ?? -1) + 1;
      const { data, error } = await supabase
        .from("activities")
        .insert({
          day_id: dayId,
          title,
          category: "other",
          sort_order,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as Activity;
    }
    throw err;
  }
}

export async function updateActivity(
  tripId: string,
  activityId: string,
  patch: Partial<Activity>,
): Promise<void> {
  try {
    await tripsAPI.updateActivity(tripId, activityId, patch);
    return;
  } catch (err) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("activities").update(patch).eq("id", activityId);
      if (error) throw error;
      return;
    }
  }
}


export async function deleteActivity(tripId: string, activityId: string): Promise<void> {
  try {
    await tripsAPI.deleteActivity(tripId, activityId);
  } catch (err) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("activities").delete().eq("id", activityId);
      if (error) throw error;
      return;
    }
    throw err;
  }
}
