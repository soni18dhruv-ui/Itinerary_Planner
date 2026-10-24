import type {
  Activity,
  HistoryItem,
  Profile,
  PromptPreviewResponse,
  TravelPreferences,
  Trip,
} from "@shared/types";


export type CreateTripPayload = {
  title: string;
  destination: string;
  country?: string | null;
  start_date: string;
  end_date: string;
  travelers_count: number;
  budget_amount?: number | null;
  currency: string;
  preferences: TravelPreferences;
  generate?: boolean;
  user_id?: string;
};

export type PromptPreviewPayload = {
  destination: string;
  country?: string | null;
  start_date: string;
  end_date: string;
  travelers_count: number;
  budget_amount?: number | null;
  currency: string;
  preferences: TravelPreferences;
};

const BASE_URL = "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = `API error: ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const tripsAPI = {
  /**
   * Creates a new trip and optionally triggers AI itinerary generation.
   */
  async createTrip(payload: CreateTripPayload): Promise<Trip> {
    try {
      return await request<Trip>("/trips", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("FastAPI backend error, attempting direct connection:", err);
      // Try direct port 8000 if proxy had an issue
      const directUrl = "http://127.0.0.1:8000/api/trips";
      const resp = await fetch(directUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resp.ok) return resp.json();
      throw err;
    }
  },

  /**
   * Fetches all trips from FastAPI backend.
   */
  async getTrips(userId?: string): Promise<Trip[]> {
    const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    try {
      const data = await request<{ trips: Trip[]; total: number }>(`/trips${qs}`);
      return data.trips;
    } catch (err) {
      // Fallback attempt to direct port
      try {
        const resp = await fetch(`http://127.0.0.1:8000/api/trips${qs}`);
        if (resp.ok) {
          const data = await resp.json();
          return data.trips;
        }
      } catch {
        // ignore
      }
      throw err;
    }
  },

  /**
   * Fetches a single trip with its days and activities.
   */
  async getTrip(tripId: string): Promise<Trip> {
    try {
      return await request<Trip>(`/trips/${tripId}`);
    } catch (err) {
      try {
        const resp = await fetch(`http://127.0.0.1:8000/api/trips/${tripId}`);
        if (resp.ok) return resp.json();
      } catch {
        // ignore
      }
      throw err;
    }
  },

  /**
   * Updates trip properties.
   */
  async updateTrip(tripId: string, patch: Partial<Trip>): Promise<Trip> {
    return request<Trip>(`/trips/${tripId}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  },

  /**
   * Deletes a trip.
   */
  async deleteTrip(tripId: string): Promise<void> {
    await request<void>(`/trips/${tripId}`, {
      method: "DELETE",
    });
  },

  /**
   * Triggers or regenerates the AI itinerary for a trip.
   */
  async generateItinerary(tripId: string): Promise<Trip> {
    return request<Trip>(`/trips/${tripId}/generate`, {
      method: "POST",
    });
  },

  /**
   * Previews the dynamic AI prompt and personalization directives.
   */
  async previewPrompt(payload: PromptPreviewPayload): Promise<PromptPreviewResponse> {
    try {
      return await request<PromptPreviewResponse>("/itinerary/preview-prompt", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      const resp = await fetch("http://127.0.0.1:8000/api/itinerary/preview-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resp.ok) return resp.json();
      throw new Error("Unable to preview prompt");
    }
  },

  /**
   * Adds an activity to a day.
   */
  async addActivity(
    tripId: string,
    dayId: string,
    activity: {
      title: string;
      category?: string;
      start_time?: string;
      end_time?: string;
      location?: string;
      estimated_cost?: number;
      notes?: string;
    },
  ): Promise<Activity> {
    return request<Activity>(`/trips/${tripId}/days/${dayId}/activities`, {
      method: "POST",
      body: JSON.stringify(activity),
    });
  },

  /**
   * Updates an activity in an itinerary day.
   */
  async updateActivity(
    tripId: string,
    activityId: string,
    patch: Partial<Activity>,
  ): Promise<Activity> {
    return request<Activity>(`/trips/${tripId}/activities/${activityId}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  },

  /**
   * Deletes an activity from an itinerary day.
   */
  async deleteActivity(tripId: string, activityId: string): Promise<void> {
    await request<void>(`/trips/${tripId}/activities/${activityId}`, {
      method: "DELETE",
    });
  },

  /**
   * Fetches recent AI itinerary generation history logs.
   */
  async getHistory(): Promise<HistoryItem[]> {
    try {
      return await request<HistoryItem[]>("/history");
    } catch {
      const resp = await fetch("http://127.0.0.1:8000/api/history");
      if (resp.ok) return resp.json();
      return [];
    }
  },

  /**
   * Fetches traveler profile from FastAPI backend.
   */
  async getProfile(userId: string): Promise<Profile> {
    return request<Profile>(`/profile/${encodeURIComponent(userId)}`);
  },

  /**
   * Updates traveler profile in FastAPI backend.
   */
  async updateProfile(userId: string, patch: Partial<Profile>): Promise<Profile> {
    return request<Profile>(`/profile/${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  },


  /**
   * Logs in a user with email and password.
   */
  async login(payload: { email: string; password: string }): Promise<{
    token: string;
    user: { id: string; email: string; full_name?: string };
    profile: Profile;
  }> {
    try {
      return await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const resp = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resp.ok) return resp.json();
      throw err;
    }
  },

  /**
   * Registers a new user account.
   */
  async signup(payload: {
    full_name: string;
    email: string;
    password: string;
  }): Promise<{
    token: string;
    user: { id: string; email: string; full_name?: string };
    profile: Profile;
  }> {
    try {
      return await request("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const resp = await fetch("http://127.0.0.1:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resp.ok) return resp.json();
      throw err;
    }
  },
};


