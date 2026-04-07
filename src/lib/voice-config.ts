// Phase 2: Replace with ElevenLabs voice IDs

export interface VoiceCharacter {
  id: string;
  name: string;
  description: string;
  /** Color for the avatar circle */
  color: string;
  /** Preferred Web Speech API voice gender */
  gender: "male" | "female" | "random";
  /** SpeechSynthesis pitch (0.1–2, default 1) */
  pitch: number;
  /** SpeechSynthesis rate (0.1–10, default 1) */
  rate: number;
}

export const VOICE_CHARACTERS: VoiceCharacter[] = [
  {
    id: "jake",
    name: "Jake",
    description:
      "Chill dude at the gym. Talks about sets, sports, weekend plans.",
    color: "bg-blue-500",
    gender: "male",
    pitch: 1,
    rate: 1,
  },
  {
    id: "marcus",
    name: "Marcus",
    description:
      "New guy on the rec league team. A little guarded but opens up if you're cool.",
    color: "bg-emerald-600",
    gender: "male",
    pitch: 0.9,
    rate: 0.95,
  },
  {
    id: "priya",
    name: "Priya",
    description:
      "Works the same office. Friendly but busy — you've got a small window.",
    color: "bg-amber-500",
    gender: "female",
    pitch: 1.1,
    rate: 1.1,
  },
  {
    id: "danielle",
    name: "Danielle",
    description:
      "At the bar watching the game alone. Not unfriendly, just not looking to talk.",
    color: "bg-rose-500",
    gender: "female",
    pitch: 1,
    rate: 1,
  },
  {
    id: "alex",
    name: "Alex",
    description:
      "Friend of a friend at a house party. Doesn't know anyone either.",
    color: "bg-violet-500",
    gender: "random",
    pitch: 1,
    rate: 1.05,
  },
];

export function getCharacter(id: string): VoiceCharacter | undefined {
  return VOICE_CHARACTERS.find((c) => c.id === id);
}

/**
 * Resolve the "random" gender for Alex — picked once per session.
 */
export function resolveGender(
  gender: VoiceCharacter["gender"]
): "male" | "female" {
  if (gender === "random") {
    return Math.random() < 0.5 ? "male" : "female";
  }
  return gender;
}

/**
 * Pick the best available SpeechSynthesis voice for a given gender.
 * Falls back to any available voice if no gender match is found.
 */
export function pickVoice(
  targetGender: "male" | "female"
): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Prefer English voices
  const english = voices.filter((v) => v.lang.startsWith("en"));
  const pool = english.length > 0 ? english : voices;

  // Heuristic: voice.name often contains "Male"/"Female" or gendered names
  const genderMatch = pool.filter((v) => {
    const lower = v.name.toLowerCase();
    if (targetGender === "female") {
      return (
        lower.includes("female") ||
        lower.includes("samantha") ||
        lower.includes("victoria") ||
        lower.includes("karen") ||
        lower.includes("moira") ||
        lower.includes("tessa") ||
        lower.includes("fiona") ||
        lower.includes("zira")
      );
    }
    return (
      lower.includes("male") ||
      lower.includes("daniel") ||
      lower.includes("david") ||
      lower.includes("james") ||
      lower.includes("tom") ||
      lower.includes("alex") ||
      lower.includes("fred") ||
      lower.includes("mark")
    );
  });

  if (genderMatch.length > 0) return genderMatch[0];

  // Fall back to any available voice
  return pool[0];
}

/**
 * Build the CHARACTER CONTEXT line to inject into the practice system prompt.
 */
export function buildCharacterContext(character: VoiceCharacter): string {
  return `CHARACTER CONTEXT: You are playing "${character.name}" — ${character.description}. Stay in this character. Your name is ${character.name} if asked.`;
}
