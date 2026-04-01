import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function summarizeConversation(
  messages: { role: string; content: string }[]
): Promise<string | null> {
  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length === 0) return null;

  const transcript = messages
    .map((m) => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`)
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 60,
      system:
        "Summarize what the user talked about in one short phrase (under 12 words). Focus on the main topic or situation they described. Examples: 'nervous about approaching people at a party', 'feeling left out of his friend group', 'avoided a networking event at work'. Respond with ONLY the summary phrase, no quotes or punctuation.",
      messages: [
        {
          role: "user",
          content: `Summarize the user's main topic:\n\n${transcript}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text.trim() : null;
    return text || null;
  } catch (err) {
    console.error("[summary] Claude API error:", err);
    return null;
  }
}
