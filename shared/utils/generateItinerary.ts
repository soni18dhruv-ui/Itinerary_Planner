import type { ActivityCategory, BudgetLevel, GeneratedDay, TravelStyle } from "../types";

type GenerateInput = {
  destination: string;
  startDate: string;
  endDate: string;
  travelStyle: TravelStyle;
  budgetLevel: BudgetLevel;
  interests: string[];
};

const COST: Record<BudgetLevel, number> = {
  budget: 0.55,
  moderate: 1,
  luxury: 2.4,
};

function addDays(iso: string, amount: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
}

function countDays(start: string, end: string) {
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T00:00:00`);
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1);
}

function money(base: number, budget: BudgetLevel) {
  return Math.round(base * COST[budget]);
}

function pickInterest(interests: string[], fallback: string) {
  if (!interests.length) return fallback;
  return interests[Math.floor(Math.random() * interests.length)] ?? fallback;
}

type Slot = {
  title: string;
  category: ActivityCategory;
  start_time: string;
  end_time: string;
  location: string;
  estimated_cost: number;
  notes: string;
};

function slotsFor(
  destination: string,
  style: TravelStyle,
  interests: string[],
  budget: BudgetLevel,
  dayIndex: number,
  totalDays: number,
): Slot[] {
  const place = destination;
  const interest = pickInterest(interests, style);
  const isArrival = dayIndex === 0;
  const isDeparture = dayIndex === totalDays - 1;
  const rotation = (["adventure", "culture", "food", "relaxation"] as TravelStyle[])[dayIndex % 4];
  const focus = style === "mixed" ? rotation : style;

  const breakfast: Slot = {
    title: isArrival ? `First breakfast in ${place}` : `Neighborhood cafe in ${place}`,
    category: "food",
    start_time: "08:30",
    end_time: "09:30",
    location: place,
    estimated_cost: money(18, budget),
    notes: interests.includes("coffee") ? "Look for a specialty coffee bar nearby." : "Keep it light if a long walking day is ahead.",
  };

  const morningByFocus: Record<TravelStyle, Slot> = {
    adventure: {
      title: `Morning hike or viewpoint above ${place}`,
      category: "nature",
      start_time: "09:45",
      end_time: "12:30",
      location: `${place} outskirts`,
      estimated_cost: money(12, budget),
      notes: "Pack water and wear shoes you can walk in for a few hours.",
    },
    culture: {
      title: `Flagship museum or historic quarter`,
      category: "culture",
      start_time: "10:00",
      end_time: "12:30",
      location: `Old town, ${place}`,
      estimated_cost: money(22, budget),
      notes: "Book timed entry if the city is busy this season.",
    },
    food: {
      title: `${place} morning market walk`,
      category: "food",
      start_time: "09:45",
      end_time: "12:00",
      location: `Central market, ${place}`,
      estimated_cost: money(20, budget),
      notes: "Taste two or three stalls instead of a sit-down lunch later.",
    },
    relaxation: {
      title: `Slow garden or spa morning`,
      category: "leisure",
      start_time: "10:00",
      end_time: "12:30",
      location: place,
      estimated_cost: money(35, budget),
      notes: "Leave the afternoon unscheduled if this runs long.",
    },
    mixed: {
      title: `Open-air walk through ${place}`,
      category: "sightseeing",
      start_time: "10:00",
      end_time: "12:15",
      location: place,
      estimated_cost: money(0, budget),
      notes: `Lean into ${interest} wherever the neighborhood suggests it.`,
    },
  };

  const afternoonByFocus: Record<TravelStyle, Slot> = {
    adventure: {
      title: `Bike, boat, or neighborhood loop`,
      category: "nature",
      start_time: "14:00",
      end_time: "17:00",
      location: place,
      estimated_cost: money(40, budget),
      notes: "Choose the option with the best weather window.",
    },
    culture: {
      title: `Gallery hop or architecture walk`,
      category: "culture",
      start_time: "14:00",
      end_time: "16:45",
      location: place,
      estimated_cost: money(16, budget),
      notes: interests.includes("photography") ? "Late afternoon light is the brief." : "Duck into one smaller museum, not three.",
    },
    food: {
      title: `Cooking class or tasting crawl`,
      category: "food",
      start_time: "14:30",
      end_time: "17:30",
      location: place,
      estimated_cost: money(70, budget),
      notes: "Ask for a dietary-friendly menu when you book.",
    },
    relaxation: {
      title: `Bookstore, bathhouse, or long lunch terrace`,
      category: "leisure",
      start_time: "13:30",
      end_time: "16:30",
      location: place,
      estimated_cost: money(28, budget),
      notes: "One unhurried stop beats a packed checklist.",
    },
    mixed: {
      title: `Signature ${place} landmark`,
      category: "sightseeing",
      start_time: "14:00",
      end_time: "16:30",
      location: place,
      estimated_cost: money(25, budget),
      notes: "Go late enough to skip the first tour-bus wave.",
    },
  };

  const dinner: Slot = {
    title: budget === "luxury" ? `Reservation dinner in ${place}` : `Local dinner in ${place}`,
    category: "food",
    start_time: "19:00",
    end_time: "21:00",
    location: place,
    estimated_cost: money(budget === "budget" ? 22 : 48, budget),
    notes: interests.includes("live music") ? "Pick a room with a set after dessert." : "Walkable from tonight's stay.",
  };

  const evening: Slot = {
    title: interests.includes("nightlife") ? `Nightcap neighborhood in ${place}` : `Sunset lookout`,
    category: interests.includes("nightlife") ? "leisure" : "sightseeing",
    start_time: "21:15",
    end_time: "22:30",
    location: place,
    estimated_cost: money(14, budget),
    notes: "Keep the next morning's start time in mind.",
  };

  if (isArrival) {
    return [
      {
        title: `Arrive and drop bags in ${place}`,
        category: "transport",
        start_time: "11:00",
        end_time: "12:30",
        location: place,
        estimated_cost: money(30, budget),
        notes: "Do not over-schedule day one. Walk the immediate streets instead.",
      },
      {
        title: `Orientation walk`,
        category: "sightseeing",
        start_time: "15:00",
        end_time: "17:00",
        location: `Around your stay, ${place}`,
        estimated_cost: 0,
        notes: "Find a grocery, a pharmacy, and a backup cafe.",
      },
      dinner,
    ];
  }

  if (isDeparture) {
    return [
      breakfast,
      {
        title: `Last neighborhood loop`,
        category: "leisure",
        start_time: "10:00",
        end_time: "12:00",
        location: place,
        estimated_cost: money(10, budget),
        notes: "Leave a buffer before the airport or station.",
      },
      {
        title: `Depart ${place}`,
        category: "transport",
        start_time: "14:00",
        end_time: "16:00",
        location: place,
        estimated_cost: money(30, budget),
        notes: "Confirm baggage rules and transit time the night before.",
      },
    ];
  }

  return [breakfast, morningByFocus[focus], afternoonByFocus[focus], dinner, evening];
}

export function generateItinerary(input: GenerateInput): GeneratedDay[] {
  const total = countDays(input.startDate, input.endDate);
  return Array.from({ length: total }, (_, index) => {
    const date = addDays(input.startDate, index);
    const activities = slotsFor(
      input.destination,
      input.travelStyle,
      input.interests,
      input.budgetLevel,
      index,
      total,
    ).map((slot, sort_order) => ({ ...slot, sort_order }));

    const title =
      index === 0
        ? `Arrive in ${input.destination}`
        : index === total - 1
          ? `Depart ${input.destination}`
          : `Day in ${input.destination}`;

    return {
      day_number: index + 1,
      date,
      title,
      notes: `Built around a ${input.travelStyle} pace and a ${input.budgetLevel} budget.`,
      activities,
    };
  });
}
