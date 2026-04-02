export type ReceptionTemperature = "warm" | "medium" | "cold" | "surprise";

export interface PracticeScenario {
  id: string;
  title: string;
  setting: string;
  difficulty: "starter" | "intermediate" | "advanced";
  characterPrompt: string;
  sceneDescription: string;
}

export const TEMPERATURE_OPTIONS: {
  value: ReceptionTemperature;
  label: string;
  description: string;
}[] = [
  {
    value: "warm",
    label: "Friendly",
    description:
      "Open and friendly. They ask follow-up questions and make it easy. Good for building baseline confidence.",
  },
  {
    value: "medium",
    label: "Cold Read",
    description:
      "Distracted and low energy. Not rude — just in their own world. A genuine question gets you in the door. Listening keeps you there.",
  },
  {
    value: "cold",
    label: "Tough Crowd",
    description:
      "Not interested right now. Not hostile — just busy, or having a bad day. The skill is reading it and exiting gracefully.",
  },
  {
    value: "surprise",
    label: "Surprise me",
    description:
      "The AI picks a random temperature. You have to read the room in real-time and adjust. Hardest mode.",
  },
];

export const PRACTICE_SCENARIOS: PracticeScenario[] = [
  {
    id: "new-gym",
    title: "First Day at a New Gym",
    setting:
      "You just signed up at a new gym. You're figuring out the equipment and a regular notices you looking around.",
    difficulty: "starter",
    characterPrompt:
      "You're a gym regular, mid-20s. You've been coming here for about a year. You're between sets on the bench press. You have your earbuds in but only one is in your ear. You're scrolling your phone during your rest. You are NOT waiting to meet someone — you're in the middle of your workout.",
    sceneDescription:
      "You're at a new gym. The free weight area is busier than you expected. The person at the bench next to you just finished a set and is resting, scrolling their phone with one earbud out. Their water bottle is on the floor between your benches.",
  },
  {
    id: "rec-league",
    title: "Joining a Rec League Team",
    setting:
      "You just joined a rec league volleyball team. It's your first practice and everyone else already knows each other.",
    difficulty: "intermediate",
    characterPrompt:
      "You're on a rec league volleyball team, been playing with this group for a few months. You're stretching with a couple teammates before practice starts. You're mid-conversation with someone about last weekend's game. You are NOT waiting to welcome anyone — you're catching up with your friends.",
    sceneDescription:
      "You're at the gym for your first rec league volleyball practice. A group of four people are stretching together near the net, laughing about something. One of them glances your way for a second, then goes back to their conversation. Nobody's come over to introduce themselves.",
  },
  {
    id: "work-happy-hour",
    title: "Work Happy Hour",
    setting:
      "Your company's having a happy hour at a bar downtown. You know your team but nobody else. You're standing near the bar.",
    difficulty: "intermediate",
    characterPrompt:
      "You work at a mid-size tech company, different team from the user. You're at the company happy hour. You're standing at the bar waiting for your drink. You've already had three generic small-talk conversations tonight and you're a bit over it. You are NOT looking for conversation — you're just getting a drink before heading back to your group.",
    sceneDescription:
      "You're at your company's happy hour at a bar downtown. Your team left 10 minutes ago. The person next to you at the bar just ordered and is waiting, staring at the TV above the bar. They're wearing a company badge but you don't recognize them.",
  },
  {
    id: "board-game-night",
    title: "Board Game Night",
    setting:
      "Your friend invited you to their board game night. You know your friend but nobody else. Games haven't started yet.",
    difficulty: "intermediate",
    characterPrompt:
      "You're at a board game night at a friend's apartment. You've been coming for a few weeks. You're setting up Catan on the table — sorting resource cards and placing hex tiles. You're focused on getting the setup right. You are NOT looking up to greet people — you're in the middle of a task.",
    sceneDescription:
      "You're at your friend's apartment for board game night. Your friend disappeared into the kitchen. Someone you don't know is sitting at the table carefully setting up a board game you've never played. They haven't looked up yet. There are two open seats at the table.",
  },
  {
    id: "coffee-shop-band-shirt",
    title: "Coffee Shop — Band Shirt",
    setting:
      "You're at a coffee shop and notice someone wearing a shirt from a band you really like. They're waiting for their order.",
    difficulty: "starter",
    characterPrompt:
      "You're at a coffee shop waiting for your order. You're wearing a shirt from an indie band you saw live last month. You're in a decent mood, scrolling your phone. You are NOT expecting anyone to talk to you — you're just killing time waiting for your latte.",
    sceneDescription:
      "You're waiting for your order at a coffee shop. The person next to you at the pickup counter is wearing a shirt from a band you've been listening to nonstop. They're scrolling their phone. Your orders haven't been called yet.",
  },
  {
    id: "online-to-irl",
    title: "Online Friend Meets IRL",
    setting:
      "You've been gaming with someone online for months. They're in your city and suggested grabbing food. You just sat down at the restaurant.",
    difficulty: "intermediate",
    characterPrompt:
      "You've been gaming online with this person for about six months — mostly co-op and voice chat. You know their gamer tag way better than their real name. You suggested meeting up because you're visiting their city. You just sat down. You're a little awkward in person compared to voice chat — the dynamic is different without a game running in the background. You are NOT in your comfort zone — you're figuring out what to do with your hands.",
    sceneDescription:
      "You're at a casual restaurant. You just sat down across from someone you've been gaming with online for six months. You've spent hundreds of hours on voice chat but this is the first time you've seen each other in person. They just sat down too. Neither of you has said anything yet. The menus are on the table.",
  },
  {
    id: "concert-alone",
    title: "Concert — There Alone",
    setting:
      "You're at a concert by yourself. The opener just finished and the person next to you seems to be alone too.",
    difficulty: "starter",
    characterPrompt:
      "You're at a concert, also alone. The opening act just finished. You're checking your phone, looking at the setlist someone posted on Reddit. You are NOT looking to make friends — you're here for the music. But you're also between sets with nothing to do for 20 minutes.",
    sceneDescription:
      "You're at a concert by yourself. The opener just finished and the lights are up between sets. The person standing next to you is also alone — they just put their phone away and are looking around the venue. The main act won't start for another 20 minutes.",
  },
  {
    id: "coworking-regular",
    title: "Co-working Space Regular",
    setting:
      "You've been going to the same co-working space for a few weeks. The same person keeps sitting near you.",
    difficulty: "starter",
    characterPrompt:
      "You work remotely and go to this co-working space a few times a week. You've noticed this person around — they usually sit near you. You're in the kitchen area pouring coffee. You have a meeting in 20 minutes. You are NOT there to socialize — you're on a coffee break and need to get back to work.",
    sceneDescription:
      "You're at the co-working space you've been going to for a few weeks. The same person who's always at the table near yours just walked into the kitchen area where you're pouring coffee. They just took off their headphones. The coffee pot is almost empty.",
  },
];

// Map lesson IDs to practice scenario IDs
export const LESSON_TO_SCENARIO: Record<string, string> = {
  "at-the-gym": "new-gym",
  "at-a-rec-league": "rec-league",
  "at-a-work-event": "work-happy-hour",
  "at-a-friend-of-friend-hangout": "board-game-night",
  "at-a-bar-or-restaurant": "coffee-shop-band-shirt",
  "when-to-approach": "concert-alone",
  "when-to-hold-back": "coworking-regular",
  "the-second-hang": "online-to-irl",
};

export function getScenario(id: string): PracticeScenario | undefined {
  return PRACTICE_SCENARIOS.find((s) => s.id === id);
}

export function getScenarioForLesson(
  lessonId: string
): PracticeScenario | undefined {
  const scenarioId = LESSON_TO_SCENARIO[lessonId];
  if (!scenarioId) return undefined;
  return getScenario(scenarioId);
}

export function resolveTemperature(
  temp: ReceptionTemperature
): "warm" | "medium" | "cold" {
  if (temp === "surprise") {
    const options: ("warm" | "medium" | "cold")[] = ["warm", "medium", "cold"];
    return options[Math.floor(Math.random() * options.length)];
  }
  return temp;
}
