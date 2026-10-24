# Data access

Tables (see `supabase/migrations`):

| Table | Purpose |
| --- | --- |
| `profiles` | One row per auth user; preferences |
| `trips` | A planned journey |
| `itinerary_days` | One row per calendar day on a trip |
| `activities` | Timed items on a day |

All access is through the Supabase JS client with the user's session. Policies require `auth.uid()` to own the parent trip.
