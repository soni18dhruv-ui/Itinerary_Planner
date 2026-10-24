import { MapPin } from "lucide-react";

export function PlaceMeta({ destination, country }: { destination: string; country?: string | null }) {
  return (
    <p className="flex items-center gap-2 text-sm text-ink/70">
      <MapPin className="h-4 w-4" />
      {destination}
      {country ? `, ${country}` : ""}
    </p>
  );
}
