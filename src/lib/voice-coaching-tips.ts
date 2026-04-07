/**
 * Rotating voice-specific coaching tips — one per session.
 * These focus on spoken conversation mechanics, not generic encouragement.
 */

export const VOICE_COACHING_TIPS: string[] = [
  // Pacing
  "Here's something most people miss about talking out loud: pacing matters more than words. When you slow down — even just slightly — people actually lean in. Speed reads as nervous. A deliberate pause before your point lands harder than any filler word.",

  // Pauses
  "Silence isn't awkward — rushing to fill it is. The best conversationalists let a beat hang after the other person finishes. That tiny pause says 'I'm actually thinking about what you said' instead of 'I was just waiting for my turn.' Try letting one silence breathe next time.",

  // Energy matching
  "Energy matching is the cheat code nobody talks about. If someone's chill and low-key, coming in loud and hyped feels off — even if what you're saying is great. Match their volume and speed first, then you can nudge the energy up together. Read the room before you set the tone.",

  // Turn-taking
  "In spoken conversations, the best moments happen in the handoff — when you finish a thought and leave just enough space for the other person to jump in. If you're stacking sentences without a gap, you're monologuing. Short thought, pause, let them respond. That rhythm is what makes it feel like a real conversation.",

  // First 60 seconds
  "The first 60 seconds set the whole vibe. People decide fast whether they're into a conversation or looking for the exit. You don't need a perfect opener — you need to sound like you actually want to be there. Relaxed voice, eye contact, and one genuine question beats any rehearsed line.",
];

/**
 * Pick a coaching tip based on a rotating index.
 * Uses the current day-of-year so the same user sees a different tip each session
 * (but the same tip within a given day for consistency).
 */
export function getVoiceCoachingTip(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / 86400000
  );
  return VOICE_COACHING_TIPS[dayOfYear % VOICE_COACHING_TIPS.length];
}
