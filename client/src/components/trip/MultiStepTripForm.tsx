import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Sparkles,
  DollarSign,
  Users,
  Compass,
  Coffee,
  Landmark,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
  Footprints,
  Eye,
  ShieldCheck,
  Clock,
} from "lucide-react";
import {
  TRAVEL_STYLES,
  PACING_LEVELS,
  BUDGET_LEVELS,
  INTERESTS,
  DIETARY_OPTIONS,
  MOBILITY_OPTIONS,
  POPULAR_DESTINATIONS,
  CURRENCIES,
} from "@shared/constants";
import type {
  TravelStyle,
  PacingLevel,
  BudgetLevel,
  PromptPreviewResponse,
} from "@shared/types";
import { tripsAPI } from "../../services/tripsAPI";
import { useAuth } from "../../hooks/useAuth";

const STEPS = [
  { id: 1, title: "Destination & Dates", subtitle: "Where & when you travel" },
  { id: 2, title: "Style & Pacing", subtitle: "Travel tempo & group size" },
  { id: 3, title: "Budget & Interests", subtitle: "Spending & passions" },
  { id: 4, title: "Personalization", subtitle: "Dietary & mobility needs" },
  { id: 5, title: "AI Prompt Blueprint", subtitle: "Review & AI generation" },
];

export function MultiStepTripForm() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Navigation state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingPhase, setSubmittingPhase] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    destination: "Kyoto",
    country: "Japan",
    start_date: new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 86400000 * 18).toISOString().slice(0, 10),
    travelers_count: 2,
    travel_style: (profile?.travel_style || "culture") as TravelStyle,
    pacing: "moderate" as PacingLevel,
    budget_level: (profile?.budget_level || "moderate") as BudgetLevel,
    budget_amount: 2500,
    currency: "USD",
    interests: profile?.interests?.length
      ? [...profile.interests]
      : ["history", "photography", "markets", "coffee"],
    dietary_restrictions: profile?.dietary_notes
      ? [profile.dietary_notes]
      : (["Vegetarian"] as string[]),
    mobility_concerns: [] as string[],
    notes: "",
    generate_now: true,
  });

  // Prompt preview state
  const [promptPreview, setPromptPreview] = useState<PromptPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  // Auto-set title if empty
  useEffect(() => {
    if (formData.destination) {
      const days = calculateDuration(formData.start_date, formData.end_date);
      setFormData((prev) => ({
        ...prev,
        title: `${days}-Day ${formData.travel_style.charAt(0).toUpperCase() + formData.travel_style.slice(1)} in ${formData.destination}`,
      }));
    }
  }, [formData.destination, formData.travel_style, formData.start_date, formData.end_date]);

  // Load live prompt preview when reaching Step 5
  useEffect(() => {
    if (currentStep === 5) {
      loadPromptPreview();
    }
  }, [currentStep]);

  function calculateDuration(start: string, end: string) {
    try {
      const d1 = new Date(`${start}T00:00:00`);
      const d2 = new Date(`${end}T00:00:00`);
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, diff);
    } catch {
      return 1;
    }
  }

  async function loadPromptPreview() {
    setLoadingPreview(true);
    try {
      const preview = await tripsAPI.previewPrompt({
        destination: formData.destination,
        country: formData.country,
        start_date: formData.start_date,
        end_date: formData.end_date,
        travelers_count: formData.travelers_count,
        budget_amount: formData.budget_amount,
        currency: formData.currency,
        preferences: {
          travel_style: formData.travel_style,
          pacing: formData.pacing,
          budget_level: formData.budget_level,
          interests: formData.interests,
          dietary_restrictions: formData.dietary_restrictions,
          mobility_concerns: formData.mobility_concerns,
          special_requests: formData.notes,
        },
      });
      setPromptPreview(preview);
    } catch (err) {
      console.warn("Failed to load prompt preview:", err);
    } finally {
      setLoadingPreview(false);
    }
  }

  function toggleInterest(item: string) {
    setFormData((prev) => {
      const exists = prev.interests.includes(item);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((i) => i !== item) : [...prev.interests, item],
      };
    });
  }

  function toggleDietary(item: string) {
    setFormData((prev) => {
      const exists = prev.dietary_restrictions.includes(item);
      return {
        ...prev,
        dietary_restrictions: exists
          ? prev.dietary_restrictions.filter((i) => i !== item)
          : [...prev.dietary_restrictions, item],
      };
    });
  }

  function toggleMobility(item: string) {
    setFormData((prev) => {
      const exists = prev.mobility_concerns.includes(item);
      return {
        ...prev,
        mobility_concerns: exists
          ? prev.mobility_concerns.filter((i) => i !== item)
          : [...prev.mobility_concerns, item],
      };
    });
  }

  function nextStep() {
    setError(null);
    if (currentStep === 1) {
      if (!formData.destination.trim()) {
        setError("Please enter a travel destination.");
        return;
      }
      if (!formData.start_date || !formData.end_date) {
        setError("Please choose travel start and end dates.");
        return;
      }
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        setError("End date cannot be earlier than start date.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
  }

  function prevStep() {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    setSubmittingPhase("Constructing dynamic AI prompt package...");

    try {
      setTimeout(() => {
        setSubmittingPhase("Adjusting pacing directives & dietary guidelines...");
      }, 700);

      setTimeout(() => {
        setSubmittingPhase("Executing Daytrail AI Itinerary Engine...");
      }, 1400);

      const trip = await tripsAPI.createTrip({
        title: formData.title || `${formData.destination} Getaway`,
        destination: formData.destination,
        country: formData.country,
        start_date: formData.start_date,
        end_date: formData.end_date,
        travelers_count: formData.travelers_count,
        budget_amount: formData.budget_amount,
        currency: formData.currency,
        preferences: {
          travel_style: formData.travel_style,
          pacing: formData.pacing,
          budget_level: formData.budget_level,
          interests: formData.interests,
          dietary_restrictions: formData.dietary_restrictions,
          mobility_concerns: formData.mobility_concerns,
          special_requests: formData.notes,
        },
        generate: formData.generate_now,
        user_id: user?.id || "guest-traveler",
      });

      navigate(`/app/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trip and generate itinerary");
      setIsSubmitting(false);
    }
  }

  const durationDays = calculateDuration(formData.start_date, formData.end_date);

  return (
    <div className="mx-auto max-w-4xl pb-16">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-pine/20 bg-pine/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-pine">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Trip Architect
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Craft Your Personalized Journey
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          Tailored to your pacing, mobility, dietary preferences, and travel style.
        </p>
      </div>

      {/* Progress Bar & Steps Navigation */}
      <div className="mb-8 rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-sm backdrop-blur-md">
        <div className="grid grid-cols-5 gap-2">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.id;
            const isActive = currentStep === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => !isSubmitting && setCurrentStep(s.id)}
                className={`group relative flex flex-col items-center p-2 text-center transition-all sm:items-start ${
                  isActive ? "opacity-100" : isCompleted ? "opacity-90" : "opacity-40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-pine text-paper shadow-md shadow-pine/20 ring-2 ring-pine/30"
                        : isCompleted
                          ? "bg-moss text-paper"
                          : "bg-ink/10 text-ink/60"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : s.id}
                  </div>
                  <span className="hidden text-xs font-semibold sm:inline">{s.title}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted ? "w-full bg-moss" : isActive ? "w-full bg-pine" : "w-0"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Container with Animated Transitions */}
      <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-ticket backdrop-blur-md sm:p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: DESTINATION & DATES */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-2xl font-medium text-ink">
                  Where & when would you like to travel?
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Pick a dream destination or choose from popular traveler favorites.
                </p>
              </div>

              {/* Destination & Country */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/70">
                    <MapPin className="h-3.5 w-3.5 text-pine" /> Destination City
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g. Kyoto, Rome, Paris..."
                    className="w-full rounded-xl border border-ink/15 bg-paper/50 px-4 py-2.5 text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Country (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. Japan, Italy, France..."
                    className="w-full rounded-xl border border-ink/15 bg-paper/50 px-4 py-2.5 text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  />
                </div>
              </div>

              {/* Quick Select Destinations */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Trending Destinations
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_DESTINATIONS.map((dest) => {
                    const isSelected = formData.destination.toLowerCase() === dest.name.toLowerCase();
                    return (
                      <button
                        key={dest.name}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, destination: dest.name, country: dest.country })
                        }
                        className={`group flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-pine bg-pine text-paper shadow-sm"
                            : "border-ink/10 bg-white/60 text-ink/80 hover:border-pine/40 hover:bg-white"
                        }`}
                      >
                        <MapPin className="h-3 w-3" />
                        <span>{dest.name}</span>
                        <span className={`text-[10px] ${isSelected ? "text-paper/80" : "text-ink/40"}`}>
                          • {dest.country}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates & Duration Banner */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/70">
                    <Calendar className="h-3.5 w-3.5 text-pine" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 bg-paper/50 px-4 py-2.5 text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/70">
                    <Calendar className="h-3.5 w-3.5 text-pine" /> End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 bg-paper/50 px-4 py-2.5 text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                    required
                  />
                </div>
              </div>

              {/* Duration Badge */}
              <div className="flex items-center justify-between rounded-xl border border-pine/20 bg-pine/5 px-4 py-3 text-sm text-pine">
                <span className="flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4" /> Trip Duration:
                </span>
                <span className="font-semibold">
                  {durationDays} Days / {Math.max(1, durationDays - 1)} Nights
                </span>
              </div>
            </motion.div>
          )}

          {/* STEP 2: TRAVEL STYLE & PACING & GROUP SIZE */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-2xl font-medium text-ink">
                  Set Your Travel Style & Activity Pacing
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Daytrail adjusts slot buffers and daily activity volume according to your chosen tempo.
                </p>
              </div>

              {/* Travel Style Selection */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink/70">
                  Select Travel Vibe
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {TRAVEL_STYLES.map((style) => {
                    const isSelected = formData.travel_style === style.id;
                    const icons: Record<string, typeof Compass> = {
                      adventure: Compass,
                      relaxation: Coffee,
                      culture: Landmark,
                      food: Utensils,
                      mixed: Sparkles,
                    };
                    const Icon = icons[style.id] || Sparkles;

                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, travel_style: style.id as TravelStyle })}
                        className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-pine bg-pine/5 ring-2 ring-pine shadow-sm"
                            : "border-ink/10 bg-white/60 hover:border-pine/30 hover:bg-white"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                            isSelected ? "bg-pine text-paper" : "bg-ink/5 text-ink/70"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="mt-3 font-semibold text-ink">{style.label}</span>
                        <span className="mt-1 text-xs text-ink/60">{style.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activity Pacing (Personalization Engine) */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Activity Pacing Tempo
                  </label>
                  <span className="text-xs text-pine font-medium">Applied to AI Generation</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PACING_LEVELS.map((pace) => {
                    const isSelected = formData.pacing === pace.id;
                    const icons: Record<string, typeof Zap> = {
                      relaxed: Coffee,
                      moderate: Footprints,
                      fast: Zap,
                    };
                    const Icon = icons[pace.id] || Footprints;

                    return (
                      <button
                        key={pace.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, pacing: pace.id as PacingLevel })}
                        className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-clay bg-clay/5 ring-2 ring-clay shadow-sm"
                            : "border-ink/10 bg-white/60 hover:border-clay/30 hover:bg-white"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                              isSelected ? "bg-clay text-paper" : "bg-ink/5 text-ink/70"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              isSelected ? "bg-clay/15 text-clay" : "bg-ink/5 text-ink/50"
                            }`}
                          >
                            {pace.stops}
                          </span>
                        </div>
                        <span className="mt-3 font-semibold text-ink">{pace.label}</span>
                        <span className="mt-1 text-xs text-ink/60">{pace.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group Size */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink/70">
                  Travelers & Group Size
                </label>
                <div className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-paper/40 p-4">
                  <Users className="h-5 w-5 text-pine" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {formData.travelers_count === 1
                        ? "Solo Traveler"
                        : formData.travelers_count === 2
                          ? "Couple / Pair (2 Travelers)"
                          : `${formData.travelers_count} Travelers in Group`}
                    </p>
                    <p className="text-xs text-ink/50">
                      AI calibrates group logistics, dining reservations, and transfers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          travelers_count: Math.max(1, formData.travelers_count - 1),
                        })
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-ink hover:bg-paper"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-semibold text-ink">
                      {formData.travelers_count}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          travelers_count: Math.min(20, formData.travelers_count + 1),
                        })
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-ink hover:bg-paper"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: BUDGET & PASSIONS / INTERESTS */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-2xl font-medium text-ink">
                  Budget Tiers & Core Interests
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Select your spending style and tag what excites you most.
                </p>
              </div>

              {/* Budget Levels */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink/70">
                  Spending Tier
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {BUDGET_LEVELS.map((tier) => {
                    const isSelected = formData.budget_level === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, budget_level: tier.id as BudgetLevel })
                        }
                        className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-pine bg-pine/5 ring-2 ring-pine shadow-sm"
                            : "border-ink/10 bg-white/60 hover:border-pine/30 hover:bg-white"
                        }`}
                      >
                        <span className="font-semibold text-ink">{tier.label}</span>
                        <span className="mt-1 text-xs text-ink/60">{tier.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Budget Amount & Currency */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/70">
                    <DollarSign className="h-3.5 w-3.5 text-pine" /> Target Budget Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={formData.budget_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, budget_amount: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-ink/15 bg-paper/50 px-4 py-2.5 text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 bg-paper/50 px-4 py-2.5 text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interests Multi-Select */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink/70">
                  Select Interests & Passions ({formData.interests.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-medium capitalize transition-all ${
                          isSelected
                            ? "border-pine bg-pine text-paper shadow-sm"
                            : "border-ink/10 bg-white/60 text-ink/70 hover:border-pine/30 hover:bg-white"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PERSONALIZATION (DIETARY & MOBILITY) */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-2xl font-medium text-ink">
                  Accessibility & Dietary Directives
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  AI will actively filter dining venues, avoid physical obstacles, and tailor transit.
                </p>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Dietary Requirements
                  </label>
                  <span className="text-xs text-moss font-medium">Verified Restaurant Matches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((diet) => {
                    const isSelected = formData.dietary_restrictions.includes(diet);
                    return (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => toggleDietary(diet)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-moss bg-moss text-paper shadow-sm"
                            : "border-ink/10 bg-white/60 text-ink/70 hover:border-moss/40 hover:bg-white"
                        }`}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : null}
                        <span>{diet}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobility & Physical Accessibility */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Mobility & Physical Considerations
                  </label>
                  <span className="text-xs text-clay font-medium">Obstacle-Free Routing</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MOBILITY_OPTIONS.map((mob) => {
                    const isSelected = formData.mobility_concerns.includes(mob);
                    return (
                      <button
                        key={mob}
                        type="button"
                        onClick={() => toggleMobility(mob)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-clay bg-clay text-paper shadow-sm"
                            : "border-ink/10 bg-white/60 text-ink/70 hover:border-clay/40 hover:bg-white"
                        }`}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : null}
                        <span>{mob}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Notes */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/70">
                  Special Requests & Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Prefer quiet mornings, love art deco architecture, celebrating an anniversary..."
                  className="w-full rounded-xl border border-ink/15 bg-paper/50 p-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 5: AI PROMPT BLUEPRINT & LAUNCH */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-2xl font-medium text-ink">
                  AI Prompt Blueprint & Review
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Review the dynamic prompt generated by the prompt-engineering layer before launch.
                </p>
              </div>

              {/* Trip Blueprint Summary Card */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-ink/10 bg-paper/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-ink/50">Destination & Dates</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formData.destination}, {formData.country}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/60">
                    {formData.start_date} to {formData.end_date} ({durationDays} days)
                  </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-paper/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-ink/50">Pacing & Style</p>
                  <p className="mt-1 font-semibold capitalize text-ink">
                    {formData.pacing} Pace • {formData.travel_style}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/60">
                    {formData.travelers_count} Traveler(s)
                  </p>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-paper/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-ink/50">Budget & Currency</p>
                  <p className="mt-1 font-semibold capitalize text-ink">
                    {formData.budget_level} Tier
                  </p>
                  <p className="mt-0.5 text-xs text-ink/60">
                    {formData.budget_amount} {formData.currency}
                  </p>
                </div>
              </div>

              {/* Personalization Directives Inspection */}
              <div className="rounded-2xl border border-pine/20 bg-pine/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-pine text-sm">
                    <ShieldCheck className="h-4 w-4" /> Personalization Directives Applied:
                    {loadingPreview && (
                      <span className="text-[10px] text-pine/60 font-normal animate-pulse">Loading blueprint…</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPromptDetails(!showPromptDetails)}
                    className="flex items-center gap-1 text-xs font-semibold text-pine hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {showPromptDetails ? "Hide Raw AI Prompt" : "Inspect Raw AI Prompt"}
                  </button>
                </div>

                <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                  <div className="rounded-xl bg-white/70 p-3">
                    <p className="font-semibold text-clay uppercase tracking-wider text-[10px]">
                      ⚡ Pacing Constraints
                    </p>
                    <ul className="mt-1 space-y-1 text-ink/80">
                      {promptPreview?.pacing_rules?.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-clay">•</span>
                          <span>{rule}</span>
                        </li>
                      )) || <li>Adjusting tempo for {formData.pacing} pacing.</li>}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-white/70 p-3">
                    <p className="font-semibold text-moss uppercase tracking-wider text-[10px]">
                      🥗 Dietary & Mobility Rules
                    </p>
                    <ul className="mt-1 space-y-1 text-ink/80">
                      {formData.dietary_restrictions.length > 0 ? (
                        <li className="flex items-start gap-1.5">
                          <span className="text-moss">✓</span>
                          <span>Diet: {formData.dietary_restrictions.join(", ")}</span>
                        </li>
                      ) : (
                        <li className="text-ink/50">No dietary restrictions</li>
                      )}
                      {formData.mobility_concerns.length > 0 ? (
                        <li className="flex items-start gap-1.5">
                          <span className="text-moss">✓</span>
                          <span>Mobility: {formData.mobility_concerns.join(", ")}</span>
                        </li>
                      ) : (
                        <li className="text-ink/50">Standard walkability</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Raw AI Prompt Collapsible */}
                {showPromptDetails && promptPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 overflow-hidden rounded-xl border border-ink/10 bg-ink/90 p-3 font-mono text-[11px] text-paper/90"
                  >
                    <p className="text-pine font-bold uppercase mb-1">=== SYSTEM PROMPT ===</p>
                    <p className="mb-3 text-paper/70">{promptPreview.system_prompt}</p>
                    <p className="text-clay font-bold uppercase mb-1">=== CONSTRUCTED USER PROMPT ===</p>
                    <pre className="whitespace-pre-wrap text-paper/80">{promptPreview.user_prompt}</pre>
                  </motion.div>
                )}
              </div>

              {/* Generate Toggle */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-white/60 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={formData.generate_now}
                  onChange={(e) => setFormData({ ...formData, generate_now: e.target.checked })}
                  className="h-4 w-4 rounded accent-pine"
                />
                <div>
                  <span className="font-semibold text-ink">
                    Generate personalized day-by-day itinerary now
                  </span>
                  <p className="text-xs text-ink/50">
                    Daytrail AI engine will synthesize days, time slots, and activity notes.
                  </p>
                </div>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-xl border border-clay/30 bg-clay/10 p-3 text-sm text-clay">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 rounded-xl bg-pine px-6 py-2.5 text-sm font-semibold text-paper shadow-md shadow-pine/20 transition hover:bg-pine/90"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-clay px-8 py-3 text-sm font-semibold text-paper shadow-md shadow-clay/20 transition hover:bg-clay/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-paper border-t-transparent" />
                  Generating Itinerary…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Trip & Generate Itinerary
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Submitting Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex max-w-sm flex-col items-center rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-2xl"
          >
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pine/10 text-pine">
              <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: "3s" }} />
              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] text-paper">
                <Sparkles className="h-2.5 w-2.5" />
              </div>
            </div>
            <h3 className="font-display text-xl font-semibold text-ink">
              Crafting Your Itinerary
            </h3>
            <p className="mt-2 text-xs text-ink/60">{submittingPhase}</p>
            <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full w-full animate-pulse bg-pine" />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
