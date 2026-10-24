import { ArrowUpRight, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Trip } from "@shared/types";
import { formatRange, tripLength, formatMoney } from "../../utils/dates";
import { PlaceMeta } from "../destination/PlaceMeta";

export function TripCard({ trip }: { trip: Trip }) {
  const prefs = trip.preferences;

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
      <Link
        to={`/app/trips/${trip.id}`}
        className="group flex flex-col justify-between h-full rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-ticket transition hover:border-pine/40 hover:shadow-lg"
      >
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-clay/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-clay">
                {trip.status}
              </span>
              {prefs?.pacing && (
                <span className="rounded-full bg-pine/10 px-2.5 py-0.5 text-[10px] font-semibold capitalize text-pine">
                  ⚡ {prefs.pacing} pace
                </span>
              )}
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink/40 transition group-hover:bg-pine group-hover:text-paper">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          <h3 className="mt-3 font-display text-2xl font-semibold text-ink group-hover:text-pine transition">
            {trip.title}
          </h3>

          <div className="mt-3">
            <PlaceMeta destination={trip.destination} country={trip.country} />
          </div>

          {/* Preferences Badges */}
          {prefs && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {prefs.travel_style && (
                <span className="rounded-md bg-ink/5 px-2 py-0.5 text-[10px] capitalize text-ink/70">
                  {prefs.travel_style}
                </span>
              )}
              {prefs.dietary_restrictions?.slice(0, 2).map((d) => (
                <span key={d} className="rounded-md bg-moss/10 px-2 py-0.5 text-[10px] font-medium text-moss">
                  🥗 {d}
                </span>
              ))}
              {prefs.mobility_concerns?.slice(0, 1).map((m) => (
                <span key={m} className="rounded-md bg-pine/10 px-2 py-0.5 text-[10px] font-medium text-pine">
                  ♿ {m}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-ink/5 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink/65">
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-pine" />
            {formatRange(trip.start_date, trip.end_date)} · {tripLength(trip.start_date, trip.end_date)} days
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-ink/40" />
              {trip.travelers_count}
            </span>
            {trip.budget_amount && (
              <span className="flex items-center font-medium text-ink">
                {formatMoney(trip.budget_amount, trip.currency)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
