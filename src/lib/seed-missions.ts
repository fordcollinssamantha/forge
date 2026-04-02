export interface MissionTemplate {
  title: string;
  description: string;
}

export interface MissionCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  missions: MissionTemplate[];
}

export const MISSION_CATEGORIES: MissionCategory[] = [
  {
    id: "starter",
    label: "Starter Missions",
    emoji: "👋",
    description: "Low-stakes warm-ups to get you moving",
    missions: [
      {
        title: "Say hi to someone you see regularly but haven't talked to",
        description: "A neighbor, a barista, someone at the gym — just a simple hello.",
      },
      {
        title: "Learn one person's name today",
        description: "Ask someone you interact with but don't know by name.",
      },
      {
        title: "Ask someone a question that isn't about work or school",
        description: "What are you watching? Done anything fun lately? Keep it casual.",
      },
      {
        title: "Give someone a genuine compliment",
        description: "Notice something real — their shoes, their energy, their work.",
      },
      {
        title: "Make eye contact and nod at 3 people today",
        description: "Simple acknowledgment. No words needed — just presence.",
      },
    ],
  },
  {
    id: "conversation",
    label: "Conversation Missions",
    emoji: "💬",
    description: "Practice keeping a conversation going",
    missions: [
      {
        title: "Start a conversation with someone you don't know",
        description: "Comment on something in the moment — the line, the weather, the music.",
      },
      {
        title: "Ask a coworker what they did this weekend",
        description: "Simple follow-up questions go a long way.",
      },
      {
        title: "Find out something new about someone you already know",
        description: "Go one layer deeper with someone familiar.",
      },
      {
        title: "Keep a conversation going for 5+ minutes",
        description: "Stay curious. Ask follow-ups instead of letting it end.",
      },
      {
        title: "Ask someone to grab coffee or lunch",
        description: "Low commitment, easy to say yes to. Just ask.",
      },
    ],
  },
  {
    id: "showing-up",
    label: "Showing Up Missions",
    emoji: "🚶",
    description: "Get yourself into social situations",
    missions: [
      {
        title: "Go somewhere new by yourself",
        description: "A new coffee shop, park, gym, store — anywhere unfamiliar.",
      },
      {
        title: "Stay at a social event for at least 30 minutes",
        description: "Don't bail early. Give yourself time to settle in.",
      },
      {
        title: "Talk to someone at a bar, coffee shop, or gym",
        description: "You're already there. Say something to someone nearby.",
      },
      {
        title: "Attend something you found in Go Mode",
        description: "Follow through on an event you spotted. Just show up.",
      },
      {
        title: "Go back to a place for the second time",
        description: "Familiarity builds comfort. Regulars become connectors.",
      },
    ],
  },
  {
    id: "bold",
    label: "Bold Missions",
    emoji: "🔥",
    description: "Push your edge — these take real guts",
    missions: [
      {
        title: "Introduce yourself to a group",
        description: "Walk up, say your name, and ask what's going on.",
      },
      {
        title: "Organize something — even if it's just texting 2 people",
        description: "Be the one who makes plans happen.",
      },
      {
        title: "Ask someone to hang out one-on-one",
        description: "Not a group thing. Just you and someone you want to know better.",
      },
      {
        title: "Show up somewhere alone and stay until you talk to someone",
        description: "No escape hatch. Commit to making contact.",
      },
      {
        title: "Invite someone you recently met to do something",
        description: "Turn a new connection into a real one.",
      },
    ],
  },
];

/** Flat list of all mission templates */
export const ALL_MISSIONS = MISSION_CATEGORIES.flatMap((cat) =>
  cat.missions.map((m) => ({ ...m, category: cat.id }))
);
