# Daytrail — Intelligent AI Travel Itinerary Planner

**Daytrail** is a full-stack, AI-powered travel planner that drafts personalized, day-by-day travel itineraries based on how you actually travel. It accounts for your travel style, pacing directives (relaxed, moderate, fast), dietary accommodations, mobility needs, and budget constraints.

---

## 🌟 Key Features

- **5-Step Itinerary Architect:**
  - Destination & Dates picker with popular hub presets (Kyoto, Rome, Paris, Tokyo, Barcelona, New York).
  - Pacing levels with realistic stop counts and buffer schedules.
  - Granular budget amounts, currencies, and interest tags.
  - Dietary restrictions (e.g. Vegetarian, Gluten-Free, Halal) and mobility accessibility checks (e.g. Step-free, Wheelchair accessible).
  - Live AI prompt preview blueprint before generation.
- **AI Generation Engine:**
  - Integrates with Google Gemini (`gemini-1.5-flash`) for creative, personalized day-by-day plans.
  - High-fidelity built-in semantic fallback generator for instant, offline-capable itineraries.
  - Generation audit log recording timestamps, models used, and summary metadata in MySQL.
- **Interactive Trip Workspace:**
  - Inline editing of activity names, times, categories, locations, and costs.
  - Automatic budget utilization and planned cost calculator.
  - Activity badges highlighting verified dietary and accessibility compliance.
  - One-click **Export to JSON** and clean printable **Print / PDF** document view.
  - Trip regeneration to explore alternate routes.
- **Persistent Profiles & Preferences:**
  - Manage personal home city, preferred pace, budget tier, and dietary notes saved to MySQL.

---

## 🛠️ Stack & Architecture

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, React Router 6.
- **Backend:** FastAPI, Python 3.11, SQLAlchemy ORM, Uvicorn, Google Generative AI SDK (`google-generativeai`).
- **Database:** MySQL (`travel_planner` schema with `trips`, `itinerary_days`, `activities`, `profiles`, and `history_logs` tables).
- **Optional Cloud Backend:** Supabase (Postgres + Auth) support with automatic local fallback.

---

## 🚀 Quickstart Guide

### 1. Start the Backend API (FastAPI + MySQL)

Ensure MySQL is running (default: `localhost:3306`, database `travel_planner`).

```bash
cd server
pip install -r requirements.txt
python run.py
```

*API runs at `http://127.0.0.1:8000` with interactive docs at `http://127.0.0.1:8000/docs`.*

### 2. Start the Frontend Client (Vite + React)

In a new terminal:

```bash
cd client
npm install
npm run dev
```

*Frontend opens at `http://localhost:5173` with automatic API proxying.*

---

## 📁 Repository Layout

```
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── components/  # Itinerary, trip wizard, and common UI components
│   │   ├── pages/       # Dashboard, TripDetail, NewTrip, Profile, History, Auth, Landing
│   │   ├── services/    # FastAPI & Supabase API clients
│   │   └── store/       # AuthProvider & user profile state
├── server/              # FastAPI Python backend
│   ├── run.py           # Uvicorn entry point
│   └── src/
│       ├── config/      # Application settings & environment variables
│       ├── database.py  # SQLAlchemy engine & session manager
│       ├── models/      # SQLAlchemy ORM models & Pydantic schemas
│       ├── routes/      # Trips, itinerary, history, and profile API routes
│       └── services/    # AI generation, prompt builder, and trip data services
├── shared/              # Shared TypeScript types, constants, and utilities
└── supabase/            # Optional Supabase SQL migrations
```

---

## 🛡️ License

MIT License. Designed with care for curious, thoughtful travelers.
