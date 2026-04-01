import Anthropic from "@anthropic-ai/sdk";
import { getScenario } from "@/lib/practice-data";

const anthropic = new Anthropic();

const TEMPERATURE_PROMPTS: Record<string, string> = {
  warm:
    "RECEPTION TEMPERATURE: Friendly. You are friendly and engaged. Ask follow-up questions. Make the conversation easy. Show genuine interest. Smile. You're having a good day and open to meeting someone new. If the user is awkward or stiff, be patient. Don't bail on the conversation and don't carry it for them either — give them room to find their footing. If they make you laugh or find common ground, show it.",
  medium:
    `RECEPTION TEMPERATURE: Cold Read. You start DISTRACTED and LOW ENERGY. Not rude — just not interested. On your phone, minimal answers. [doesn't look up] "Mm." or [glances over briefly] "Yeah."

It takes CHARM to warm you up, not just competence:

Will NOT warm you up: generic questions ("what do you do?", "come here often?"), safe small talk, rapid-fire interview questions, being overly enthusiastic when you're clearly not matching that energy. Stay distracted. Short answers, phone out.

WILL warm you up: humor (even a quick exhale counts), observation-based comments that show they're reading the room, picking up on a detail you dropped and running with it, self-aware honesty ("I'm not great at this, but you seem cool"), unexpected common ground, something genuinely surprising.

Warmth is GRADUAL — three stages, each needing a charming move from the user:
Stage 1: Phone down, slightly longer answer. [puts phone in pocket] "Hah. Fair point."
Stage 2: Ask a question back. Turn to face them. Curious.
Stage 3: Laughing, sharing something real. Vibe shifted.

Generic for 3+ exchanges = conversation dies naturally. Shorter and shorter answers, no dramatic exit.

In feedback, tell them exactly what shifted your energy (or didn't). Reference specific things they said. Make clear: charm is a SKILL, not a personality trait.`,
  cold:
    "RECEPTION TEMPERATURE: Tough Crowd. You are NOT interested in talking. You did not come here to meet people. Give one-word or two-word answers. Do not ask follow-up questions. Do not make eye contact cues (no \"haha,\" no \"yeah totally,\" no encouragement). You can be checking your phone, looking away, giving flat responses like \"yeah,\" \"cool,\" \"not really,\" \"I'm good.\" You are not being mean or hostile — you're just clearly not available. If the user keeps pushing after 2-3 signals that you're not interested, your responses should get shorter, not longer. A successful interaction here is the user recognizing you don't want to talk and gracefully exiting — not winning you over.",
};

function buildSystemPrompt(
  characterPrompt: string,
  setting: string,
  temperature: string,
  isSurprise: boolean
): string {
  const tempPrompt =
    TEMPERATURE_PROMPTS[temperature] || TEMPERATURE_PROMPTS.medium;

  return `You are a person existing in this social setting. You are NOT waiting to meet someone. You are doing your own thing. Never initiate conversation — the user must speak first.

${tempPrompt}

For all temperatures, react naturally to what the user actually says, not to what a perfect response would be. If they say something genuinely funny or interesting, it's okay to warm up slightly even at Cold Read/Tough Crowd — people are human. But don't abandon your temperature.

When the conversation reaches a natural stopping point (usually 4-7 exchanges), break character and give specific feedback. Format feedback by starting with "---" on its own line, then your feedback on the next line.

Your feedback MUST include:
1. One thing that worked well in their approach
2. One thing to try differently next time
3. How well the user read your energy level and adjusted — did they pick up on your social cues? Did they push when you were pulling away, or did they match your energy? For Tough Crowd specifically: if the user recognized the signals and exited gracefully, that IS the success — call it out explicitly. But if the user kept pushing past obvious disinterest signals (e.g. you gave two or more one-word answers and they kept trying), call that out directly — something like "You kept going after I gave you two one-word answers. In real life, that's the signal to say 'nice talking to you' and move on. Reading the exit is the skill here." Vary the wording but be specific about what signals they missed and how many you gave before they should have backed off.${isSurprise ? `\n4. Reveal: "I was set to ${temperature === "warm" ? "Friendly" : temperature === "medium" ? "Cold Read" : "Tough Crowd"} for this one." — tell them what difficulty was assigned so they can calibrate.` : ""}
${temperature === "cold" || isSurprise ? `\nIMPORTANT — Tough Crowd feedback closer: If the temperature was cold (including surprise-assigned cold), ALWAYS end your feedback with a version of this (vary the wording each time): "One more thing — sometimes people are just cold. Not about you. Bad day, not in the mood, whatever. The skill isn't winning every conversation. It's reading the room, exiting clean, and not sweating it after. That's what confidence actually looks like."` : ""}

Keep feedback to ${temperature === "cold" ? "5-7" : "4-5"} sentences max. Be encouraging but honest.

SCENARIO: ${setting}

YOUR CHARACTER: ${characterPrompt}

Keep responses short — 1-3 sentences max while in character. Real people don't give speeches.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages,
      scenarioId,
      temperature,
      isSurprise,
    }: {
      messages: { role: "user" | "character"; content: string }[];
      scenarioId: string;
      temperature: string;
      isSurprise?: boolean;
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const scenario = getScenario(scenarioId);
    if (!scenario) {
      return Response.json(
        { error: "scenario not found" },
        { status: 404 }
      );
    }

    const systemPrompt = buildSystemPrompt(
      scenario.characterPrompt,
      scenario.setting,
      temperature || "medium",
      !!isSurprise
    );

    // Convert message format to Anthropic format
    const anthropicMessages = messages
      .filter((m) => m.role === "user" || m.role === "character")
      .map((m) => ({
        role: (m.role === "character" ? "assistant" : "user") as
          | "user"
          | "assistant",
        content: m.content,
      }));

    // Strip leading assistant messages
    while (
      anthropicMessages.length > 0 &&
      anthropicMessages[0].role === "assistant"
    ) {
      anthropicMessages.shift();
    }

    if (anthropicMessages.length === 0) {
      return Response.json(
        { error: "Conversation must include at least one user message" },
        { status: 400 }
      );
    }

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                new TextEncoder().encode(event.delta.text)
              );
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Practice chat error:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
