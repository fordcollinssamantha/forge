export interface GoEvent {
  id: string;
  title: string;
  type: string;
  venue: string;
  date: string;
  time: string;
  vibe_tags: string[];
  going_solo_count: number;
  image_url: string;
  description: string;
}

// Helper: get a date N days from now as YYYY-MM-DD
function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

export const SEED_EVENTS: GoEvent[] = [
  {
    id: "pickup-basketball",
    title: "Pickup Basketball",
    type: "sports",
    venue: "Mission Playground",
    date: futureDate(1),
    time: "6:00 PM",
    vibe_tags: ["active", "casual", "competitive"],
    going_solo_count: 4,
    image_url: "https://picsum.photos/seed/basketball/400/250",
    description: "Run 5v5 with whoever shows up. All skill levels welcome — just bring water and be ready to move.",
  },
  {
    id: "trivia-night",
    title: "Trivia Night",
    type: "social",
    venue: "Teeth Bar",
    date: futureDate(2),
    time: "7:30 PM",
    vibe_tags: ["social", "chill", "fun"],
    going_solo_count: 3,
    image_url: "https://picsum.photos/seed/trivia/400/250",
    description: "Solo players get matched into teams. No pressure, just good questions and cheap drinks.",
  },
  {
    id: "group-hike",
    title: "Group Hike",
    type: "outdoors",
    venue: "Lands End Trail",
    date: futureDate(3),
    time: "9:00 AM",
    vibe_tags: ["active", "outdoors", "chill"],
    going_solo_count: 5,
    image_url: "https://picsum.photos/seed/hike/400/250",
    description: "Moderate 3-mile coastal hike with Golden Gate views. We stop for photos and conversation.",
  },
  {
    id: "climbing-session",
    title: "Climbing Session",
    type: "fitness",
    venue: "Dogpatch Boulders",
    date: futureDate(4),
    time: "5:30 PM",
    vibe_tags: ["active", "focused", "social"],
    going_solo_count: 2,
    image_url: "https://picsum.photos/seed/climbing/400/250",
    description: "Bouldering session for beginners and intermediates. People share beta and spot each other.",
  },
  {
    id: "comedy-open-mic",
    title: "Comedy Open Mic",
    type: "entertainment",
    venue: "The Setup at Milk Bar",
    date: futureDate(5),
    time: "8:00 PM",
    vibe_tags: ["creative", "social", "fun"],
    going_solo_count: 3,
    image_url: "https://picsum.photos/seed/comedy/400/250",
    description: "Watch or sign up to do 5 minutes. Low-key crowd, easy to talk to people between sets.",
  },
  {
    id: "rec-volleyball",
    title: "Rec League Volleyball",
    type: "sports",
    venue: "South Beach Park Courts",
    date: futureDate(6),
    time: "11:00 AM",
    vibe_tags: ["active", "team", "competitive"],
    going_solo_count: 6,
    image_url: "https://picsum.photos/seed/volleyball/400/250",
    description: "Outdoor 6v6 pickup. Teams rotate every few games. Show up solo and you'll get put on a squad.",
  },
  {
    id: "grill-hang",
    title: "Grill & Hang",
    type: "social",
    venue: "Dolores Park Picnic Area",
    date: futureDate(7),
    time: "1:00 PM",
    vibe_tags: ["social", "chill", "food"],
    going_solo_count: 4,
    image_url: "https://picsum.photos/seed/grill/400/250",
    description: "BYOB cookout. Someone always brings a speaker. Easy spot to meet people without forced conversation.",
  },
  {
    id: "gaming-tournament",
    title: "Gaming Tournament",
    type: "gaming",
    venue: "Folsom Street Foundry",
    date: futureDate(8),
    time: "6:00 PM",
    vibe_tags: ["gaming", "competitive", "social"],
    going_solo_count: 5,
    image_url: "https://picsum.photos/seed/gaming/400/250",
    description: "Smash Bros & Street Fighter brackets. Casual setups on the side if you just want to play.",
  },
  {
    id: "open-build-night",
    title: "Open Build Night",
    type: "maker",
    venue: "Noisebridge Hackerspace",
    date: futureDate(9),
    time: "7:00 PM",
    vibe_tags: ["creative", "learning", "social"],
    going_solo_count: 3,
    image_url: "https://picsum.photos/seed/maker/400/250",
    description: "Bring a project or just hang out and learn. Electronics, 3D printing, coding — whatever you're into.",
  },
  {
    id: "board-game-night",
    title: "Board Game Night",
    type: "social",
    venue: "Victory Point Cafe",
    date: futureDate(10),
    time: "6:30 PM",
    vibe_tags: ["social", "chill", "gaming"],
    going_solo_count: 3,
    image_url: "https://picsum.photos/seed/boardgame/400/250",
    description: "Hundreds of games to pick from. Staff helps match you into a table if you come alone.",
  },
  {
    id: "cars-coffee",
    title: "Cars & Coffee Meetup",
    type: "automotive",
    venue: "Fort Mason Center",
    date: futureDate(11),
    time: "8:00 AM",
    vibe_tags: ["social", "chill", "auto"],
    going_solo_count: 4,
    image_url: "https://picsum.photos/seed/cars/400/250",
    description: "Bring your ride or just come to look. Easy conversations — everyone wants to talk about their car.",
  },
  {
    id: "live-music-night",
    title: "Live Music Night",
    type: "entertainment",
    venue: "Bottom of the Hill",
    date: futureDate(13),
    time: "9:00 PM",
    vibe_tags: ["social", "creative", "fun"],
    going_solo_count: 3,
    image_url: "https://picsum.photos/seed/livemusic/400/250",
    description: "Three local bands, small venue. The kind of place where you end up talking to strangers at the bar.",
  },
];
