const INTERNAL_ORIGIN = "https://gridtwin.invalid";

export function getSafeNextRoute(candidate: string | null): string {
  if (!candidate || !candidate.startsWith("/")) return "/dashboard";

  try {
    const destination = new URL(candidate, INTERNAL_ORIGIN);
    if (destination.origin !== INTERNAL_ORIGIN) return "/dashboard";
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/dashboard";
  }
}
