// The canonical launch-city list for the WEBSITE.
//
// Keep in sync with the mobile app's `LaunchCities` in
// turf_booking_app/lib/core/constants.dart — same nine cities, same
// label/query split. The LABEL is what users see; the QUERY is what goes
// to the backend's city filter (turfs in the Aurangabad region are stored
// under "Aurangabad" while users know the venue as CSN).
//
// When a city goes live, add ONE entry here AND one LaunchCity in the app.

export interface LaunchCity {
  label: string;
  query: string;
}

export const LAUNCH_CITIES: LaunchCity[] = [
  { label: "Mumbai", query: "Mumbai" },
  { label: "Delhi", query: "Delhi" },
  { label: "Bangalore", query: "Bangalore" },
  { label: "Hyderabad", query: "Hyderabad" },
  { label: "Chennai", query: "Chennai" },
  { label: "Kolkata", query: "Kolkata" },
  { label: "Pune", query: "Pune" },
  { label: "Ahmedabad", query: "Ahmedabad" },
  { label: "CSN (Aurangabad)", query: "Aurangabad" },
];

export const LAUNCH_CITY_LABELS = LAUNCH_CITIES.map((c) => c.label);

/** Resolve a stored/displayed value to the backend query city. */
export function launchCityQueryFor(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  const first = v.split(",")[0]!.trim();
  for (const c of LAUNCH_CITIES) {
    if (v === c.label || v === c.query || first === c.label || first === c.query) {
      return c.query;
    }
  }
  switch (first.toLowerCase()) {
    case "bengaluru":
      return "Bangalore";
    case "delhi ncr":
      return "Delhi";
    case "aurangabad":
    case "sambhajinagar":
    case "chh. sambhajinagar":
      return "Aurangabad";
  }
  return first;
}
