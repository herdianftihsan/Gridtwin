import { Project } from "../../types/api";

export function formatLocation(location: Project['location']): string {
  if (!location) {
    return "Location unavailable";
  }

  if (typeof location === 'string') {
    // If it's still somehow the raw loc_ id, this is a fallback.
    // However, the backend should now resolve it.
    // If it's a legacy location (e.g., "Bekasi"), it will be returned here.
    return location;
  }

  if (typeof location === 'object' && location.name && location.province) {
    return `${location.name}, ${location.province}`;
  }

  return "Location unavailable";
}
