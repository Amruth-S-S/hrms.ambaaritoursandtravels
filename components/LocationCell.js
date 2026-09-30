import { MapPin } from "lucide-react";
import { mapsUrl, shortAddress } from "@/lib/format";
import { Badge } from "./ui";

export default function LocationCell({ block }) {
  if (!block || block.latitude === undefined || block.latitude === null) return <span className="text-ink-muted">—</span>;
  return (
    <div className="max-w-[240px]">
      <a
        href={mapsUrl(block.latitude, block.longitude)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-start gap-1 text-brand hover:underline"
      >
        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
        <span className="text-xs leading-snug">
          {shortAddress(block.address) || `${block.latitude.toFixed(5)}, ${block.longitude.toFixed(5)}`}
        </span>
      </a>
      {block.distance_from_office_m !== null && block.distance_from_office_m !== undefined && (
        <div className="mt-1">
          <Badge tone={block.within_geofence ? "green" : "red"}>
            {block.within_geofence ? "At office" : `${block.distance_from_office_m} m away`}
          </Badge>
        </div>
      )}
    </div>
  );
}
