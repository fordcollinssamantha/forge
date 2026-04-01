import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface PatternResult {
  negative_predictions: number;
  catastrophizing: number;
  mind_reading: number;
  avoidance: number;
}

const PATTERN_MESSAGES: Record<string, string> = {
  negative_predictions:
    "You tend to predict the worst about social events. But looking back, your actual experiences are usually better than expected.",
  catastrophizing:
    "You sometimes jump to worst-case scenarios in social situations. The reality usually turns out way less dramatic than the fear.",
  mind_reading:
    "You often assume you know what others are thinking — usually something negative. But most people are way less focused on judging you than you expect.",
  avoidance:
    "You have a pattern of finding reasons to skip social situations. The discomfort of going is usually shorter than the regret of not going.",
};

export function getPatternMessage(patternType: string): string {
  return PATTERN_MESSAGES[patternType] || `Something I noticed about your ${patternType.replace(/_/g, " ")}.`;
}

export async function analyzePatterns(
  userMessages: string[]
): Promise<PatternResult> {
  if (userMessages.length === 0) {
    return {
      negative_predictions: 0,
      catastrophizing: 0,
      mind_reading: 0,
      avoidance: 0,
    };
  }

  const combined = userMessages.join("\n---\n");
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    system: `You are a CBT pattern detector. Analyze the user's messages for cognitive distortion patterns common in social anxiety. Return ONLY a JSON object with confidence scores (0-1) for each pattern type. Be conservative — only score above 0.5 if there's clear evidence.

Patterns to detect:
- negative_predictions: Predicting bad outcomes before they happen ("it'll go badly", "nobody will talk to me")
- catastrophizing: Imagining worst-case scenarios ("if I mess up everyone will hate me", "my life will be ruined")
- mind_reading: Assuming what others think ("they probably think I'm weird", "she was judging me")
- avoidance: Finding excuses to avoid situations ("I'm too tired", "it's not worth it", rationalizing staying home)

Respond with ONLY valid JSON, no other text.`,
    messages: [
      {
        role: "user",
        content: `Analyze these messages for CBT distortion patterns:\n\n${combined}`,
      },
    ],
  });

  let text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "").trim();

  try {
    const parsed = JSON.parse(text);
    return {
      negative_predictions: parsed.negative_predictions ?? 0,
      catastrophizing: parsed.catastrophizing ?? 0,
      mind_reading: parsed.mind_reading ?? 0,
      avoidance: parsed.avoidance ?? 0,
    };
  } catch {
    console.error("Failed to parse pattern analysis:", text);
    return {
      negative_predictions: 0,
      catastrophizing: 0,
      mind_reading: 0,
      avoidance: 0,
    };
  }
}
