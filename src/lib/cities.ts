// Top 100 US cities by population
export const US_CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "Fort Worth",
  "Columbus",
  "Charlotte",
  "Indianapolis",
  "San Francisco",
  "Seattle",
  "Denver",
  "Washington DC",
  "Nashville",
  "Oklahoma City",
  "El Paso",
  "Boston",
  "Portland",
  "Las Vegas",
  "Memphis",
  "Louisville",
  "Baltimore",
  "Milwaukee",
  "Albuquerque",
  "Tucson",
  "Fresno",
  "Mesa",
  "Sacramento",
  "Atlanta",
  "Kansas City",
  "Colorado Springs",
  "Omaha",
  "Raleigh",
  "Virginia Beach",
  "Long Beach",
  "Miami",
  "Oakland",
  "Minneapolis",
  "Tampa",
  "Tulsa",
  "Arlington",
  "New Orleans",
  "Wichita",
  "Cleveland",
  "Bakersfield",
  "Aurora",
  "Anaheim",
  "Honolulu",
  "Santa Ana",
  "Riverside",
  "Corpus Christi",
  "Lexington",
  "Henderson",
  "Stockton",
  "Saint Paul",
  "Cincinnati",
  "St. Louis",
  "Pittsburgh",
  "Greensboro",
  "Lincoln",
  "Anchorage",
  "Plano",
  "Orlando",
  "Irvine",
  "Newark",
  "Durham",
  "Chula Vista",
  "Toledo",
  "Fort Wayne",
  "St. Petersburg",
  "Laredo",
  "Jersey City",
  "Chandler",
  "Madison",
  "Lubbock",
  "Scottsdale",
  "Reno",
  "Buffalo",
  "Gilbert",
  "Glendale",
  "North Las Vegas",
  "Winston-Salem",
  "Chesapeake",
  "Norfolk",
  "Fremont",
  "Garland",
  "Irving",
  "Hialeah",
  "Richmond",
  "Boise",
  "Spokane",
  "Baton Rouge",
  "Des Moines",
] as const;

// Common abbreviations/nicknames mapped to city names for fuzzy matching
const CITY_ALIASES: Record<string, string> = {
  nyc: "New York",
  ny: "New York",
  la: "Los Angeles",
  sf: "San Francisco",
  dc: "Washington DC",
  philly: "Philadelphia",
  vegas: "Las Vegas",
  nola: "New Orleans",
  jax: "Jacksonville",
  indy: "Indianapolis",
  kc: "Kansas City",
  stl: "St. Louis",
  pgh: "Pittsburgh",
  abq: "Albuquerque",
  atl: "Atlanta",
  "cos": "Colorado Springs",
};

export function searchCities(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Check aliases first
  const aliasMatch = CITY_ALIASES[q];

  const scored = US_CITIES.map((city) => {
    const lower = city.toLowerCase();
    let score = 0;

    // Exact alias match gets top priority
    if (aliasMatch && city === aliasMatch) score = 100;
    // Starts with query
    else if (lower.startsWith(q)) score = 90;
    // Word in city starts with query (e.g. "worth" matches "Fort Worth")
    else if (lower.split(" ").some((w) => w.startsWith(q))) score = 70;
    // Contains query
    else if (lower.includes(q)) score = 50;
    // Initials match (e.g. "sf" matches "San Francisco")
    else {
      const initials = city
        .split(" ")
        .map((w) => w[0]?.toLowerCase())
        .join("");
      if (initials.startsWith(q)) score = 80;
    }

    return { city, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((r) => r.city);
}
