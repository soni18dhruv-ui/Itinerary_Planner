export const TRAVEL_STYLES = [
  { id: "adventure", label: "Adventure", description: "Hikes, viewpoints, and outdoor days", icon: "Compass" },
  { id: "relaxation", label: "Relaxation", description: "Cafes, spas, and unhurried afternoons", icon: "Coffee" },
  { id: "culture", label: "Culture", description: "Museums, neighborhoods, and history", icon: "Landmark" },
  { id: "food", label: "Food", description: "Markets, tasting menus, and local kitchens", icon: "UtensilsCrossed" },
  { id: "mixed", label: "Mixed", description: "A balanced week of all of the above", icon: "Sparkles" },
] as const;

export const PACING_LEVELS = [
  {
    id: "relaxed",
    label: "Relaxed Pace",
    description: "2-3 stops per day. Gentle 10 AM starts with 90m scenic breaks.",
    icon: "Armchair",
    stops: "2-3 stops/day",
  },
  {
    id: "moderate",
    label: "Moderate Pace",
    description: "3-4 stops per day. Balanced rhythm of marquee sights and leisure.",
    icon: "Footprints",
    stops: "3-4 stops/day",
  },
  {
    id: "fast",
    label: "Fast / Packed",
    description: "5-6 stops per day. Early 8:30 AM starts for maximum exploration.",
    icon: "Zap",
    stops: "5-6 stops/day",
  },
] as const;

export const BUDGET_LEVELS = [
  { id: "budget", label: "Budget", description: "Public transit, street food, free sights" },
  { id: "moderate", label: "Moderate", description: "A mix of paid highlights and casual meals" },
  { id: "luxury", label: "Luxury", description: "Private transfers, tasting menus, iconic stays" },
] as const;

export const INTERESTS = [
  "architecture",
  "art",
  "beaches",
  "coffee",
  "hiking",
  "history",
  "live music",
  "markets",
  "nightlife",
  "photography",
  "shopping",
  "wildlife",
] as const;

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Halal",
  "Kosher",
  "Nut Allergy",
  "Dairy-Free",
  "Pescatarian",
] as const;

export const MOBILITY_OPTIONS = [
  "Wheelchair Accessible",
  "Minimal Walking",
  "Avoid Steep Stairs/Hills",
  "Elevator Priority",
  "Senior-Friendly",
] as const;

export const POPULAR_DESTINATIONS = [
  { name: "Kyoto", country: "Japan", tag: "Cultural & Zen Gardens" },
  { name: "Rome", country: "Italy", tag: "Ancient Ruins & Gastronomy" },
  { name: "Paris", country: "France", tag: "Art & Atmospheric Boulevards" },
  { name: "Tokyo", country: "Japan", tag: "Futuristic & Traditional Fusion" },
  { name: "Barcelona", country: "Spain", tag: "Gaudí & Mediterranean Vibes" },
  { name: "New York", country: "USA", tag: "Museums & Highline Energy" },
] as const;

export const ACTIVITY_CATEGORIES = [
  "sightseeing",
  "food",
  "transport",
  "lodging",
  "leisure",
  "culture",
  "nature",
  "other",
] as const;

export const TRIP_STATUSES = ["planning", "upcoming", "completed"] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"] as const;
