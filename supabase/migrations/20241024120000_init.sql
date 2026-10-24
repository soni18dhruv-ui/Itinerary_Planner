create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  home_city text,
  travel_style text not null default 'mixed'
    check (travel_style in ('adventure', 'relaxation', 'culture', 'food', 'mixed')),
  budget_level text not null default 'moderate'
    check (budget_level in ('budget', 'moderate', 'luxury')),
  interests text[] not null default '{}',
  dietary_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  destination text not null,
  country text,
  start_date date not null,
  end_date date not null,
  travelers_count integer not null default 1 check (travelers_count > 0),
  budget_amount numeric(12, 2),
  currency text not null default 'USD',
  status text not null default 'planning'
    check (status in ('planning', 'upcoming', 'completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_date_range check (end_date >= start_date)
);

create table public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  day_number integer not null check (day_number > 0),
  date date not null,
  title text,
  notes text,
  unique (trip_id, day_number)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.itinerary_days (id) on delete cascade,
  title text not null,
  category text not null default 'sightseeing'
    check (category in ('sightseeing', 'food', 'transport', 'lodging', 'leisure', 'culture', 'nature', 'other')),
  start_time time,
  end_time time,
  location text,
  estimated_cost numeric(12, 2),
  notes text,
  sort_order integer not null default 0
);

create index trips_user_id_idx on public.trips (user_id, start_date desc);
create index itinerary_days_trip_id_idx on public.itinerary_days (trip_id, day_number);
create index activities_day_id_idx on public.activities (day_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trips_updated_at
  before update on public.trips
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.activities enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can manage own trips"
  on public.trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage days on own trips"
  on public.itinerary_days for all
  using (
    exists (
      select 1 from public.trips t
      where t.id = itinerary_days.trip_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.trips t
      where t.id = itinerary_days.trip_id and t.user_id = auth.uid()
    )
  );

create policy "Users can manage activities on own trips"
  on public.activities for all
  using (
    exists (
      select 1
      from public.itinerary_days d
      join public.trips t on t.id = d.trip_id
      where d.id = activities.day_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.itinerary_days d
      join public.trips t on t.id = d.trip_id
      where d.id = activities.day_id and t.user_id = auth.uid()
    )
  );
