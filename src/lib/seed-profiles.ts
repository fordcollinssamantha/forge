export interface SoloProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
}

export const SEED_PROFILES: SoloProfile[] = [
  {
    id: "marcus",
    name: "Marcus",
    age: 22,
    bio: "Just moved to SF for work. Looking for pickup games and people to grab food with.",
    interests: ["Basketball", "Cooking", "Hip-hop"],
  },
  {
    id: "darius",
    name: "Darius",
    age: 23,
    bio: "Software dev in SoMa. Trying to do more outside of my apartment that isn't just work.",
    interests: ["Climbing", "Gaming", "Live music"],
  },
  {
    id: "tyler",
    name: "Tyler",
    age: 20,
    bio: "SFSU sophomore. Transferred in this year so starting over on the social front.",
    interests: ["Running", "Trivia", "Comedy"],
  },
  {
    id: "jamal",
    name: "Jamal",
    age: 24,
    bio: "Marketing coordinator. Most of my friends are back in LA.",
    interests: ["Volleyball", "Hiking", "Board games"],
  },
  {
    id: "carlos",
    name: "Carlos",
    age: 21,
    bio: "Working at a restaurant in the Mission. Trying to find things to do on my days off that aren't just scrolling.",
    interests: ["Soccer", "Gaming", "Photography"],
  },
  {
    id: "nate",
    name: "Nate",
    age: 25,
    bio: "Remote worker. All my coworkers are in different cities. Need IRL people.",
    interests: ["Cycling", "Craft beer", "Trivia"],
  },
  {
    id: "ryan",
    name: "Ryan",
    age: 19,
    bio: "City College student. Took a gap year and lost touch with most of my high school friends.",
    interests: ["Skateboarding", "Music", "Building things"],
  },
  {
    id: "andre",
    name: "Andre",
    age: 22,
    bio: "Grad school at USF. Moved from the East Coast. Still figuring out the SF social scene.",
    interests: ["Basketball", "Reading", "Comedy"],
  },
];

/** Deterministic mapping: each event gets 1-2 profiles based on event id hash */
const EVENT_MATCH_MAP: Record<string, string[]> = {
  "pickup-basketball": ["marcus", "andre"],
  "trivia-night": ["tyler", "nate"],
  "group-hike": ["jamal", "darius"],
  "climbing-session": ["darius"],
  "comedy-open-mic": ["tyler", "andre"],
  "rec-volleyball": ["jamal", "carlos"],
  "grill-hang": ["marcus", "carlos"],
  "gaming-tournament": ["darius", "carlos"],
  "open-build-night": ["ryan", "nate"],
  "board-game-night": ["jamal", "tyler"],
  "cars-coffee": ["nate", "marcus"],
  "live-music-night": ["darius", "ryan"],
};

export function getMatchesForEvent(eventId: string): SoloProfile[] {
  const ids = EVENT_MATCH_MAP[eventId] ?? ["marcus"];
  return ids.map((id) => SEED_PROFILES.find((p) => p.id === id)!);
}
