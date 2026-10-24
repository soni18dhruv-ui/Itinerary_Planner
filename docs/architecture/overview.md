# Architecture

The app is a React client that talks to Supabase (Postgres + Auth) with row-level security. There is no custom API required for core trip planning.

```
Browser (Vite + React)
        |
        |  anon key + user JWT
        v
Supabase
  - Auth (email/password)
  - Postgres (profiles, trips, itinerary_days, activities)
  - RLS: each user only sees their own rows
```

Personalization lives in `profiles` (travel style, budget, interests). The client uses those fields plus trip dates and destination to generate a first-pass itinerary, then saves days and activities to Postgres.
