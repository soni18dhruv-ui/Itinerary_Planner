import type {
  ACTIVITY_CATEGORIES,
  BUDGET_LEVELS,
  PACING_LEVELS,
  TRAVEL_STYLES,
  TRIP_STATUSES,
} from "../constants";

export type TravelStyle = (typeof TRAVEL_STYLES)[number]["id"];
export type PacingLevel = (typeof PACING_LEVELS)[number]["id"];
export type BudgetLevel = (typeof BUDGET_LEVELS)[number]["id"];
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];
export type TripStatus = (typeof TRIP_STATUSES)[number];

export type TravelPreferences = {
  travel_style: TravelStyle;
  pacing: PacingLevel;
  budget_level: BudgetLevel;
  interests: string[];
  dietary_restrictions: string[];
  mobility_concerns: string[];
  special_requests?: string | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  home_city: string | null;
  travel_style: TravelStyle;
  budget_level: BudgetLevel;
  interests: string[];
  dietary_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  day_id: string;
  title: string;
  category: ActivityCategory;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  estimated_cost: number | null;
  currency?: string | null;
  notes: string | null;
  sort_order: number;
  pacing_tag?: string | null;
  accessibility_note?: string | null;
  dietary_note?: string | null;
};

export type ItineraryDay = {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title: string | null;
  theme?: string | null;
  notes: string | null;
  activities: Activity[];
};

export type Trip = {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  country: string | null;
  start_date: string;
  end_date: string;
  travelers_count: number;
  budget_amount: number | null;
  currency: string;
  status: TripStatus;
  notes: string | null;
  preferences?: TravelPreferences;
  created_at: string;
  updated_at: string;
  itinerary_days?: ItineraryDay[];
};

export type TripWithDays = Trip & {
  itinerary_days: ItineraryDay[];
};

export type GeneratedActivity = Omit<Activity, "id" | "day_id">;
export type GeneratedDay = {
  day_number: number;
  date: string;
  title: string;
  theme?: string;
  notes: string;
  activities: GeneratedActivity[];
};

export type PromptPreviewResponse = {
  system_prompt: string;
  user_prompt: string;
  personalization_summary: Record<string, unknown>;
  pacing_rules: string[];
  dietary_directives: string[];
  mobility_directives: string[];
};

export type HistoryItem = {
  id: string;
  trip_id: string;
  destination: string;
  title: string;
  days_count: number;
  generated_at: string;
  model_used: string;
  summary: string;
};


