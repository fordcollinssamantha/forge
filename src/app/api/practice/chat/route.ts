import Anthropic from "@anthropic-ai/sdk";
import { getScenario } from "@/lib/practice-data";

const anthropic = new Anthropic();

const TEMPERATURE_PROMPTS: Record<string, string> = {
  warm:
    "RECEPTION TEMPERATURE: Friendly. You are friendly and engaged. Ask follow-up questions. Make the conversation easy. Show genuine interest. Smile. You're having a good day and open to meeting someone new. If the user is awkward or stiff, be patient. Don't bail on the conversation and don't carry it for them either — give them room to find their footing. If they make you laugh or find common ground, show it.",
  medium:
    `RECEPTION TEMPERATURE: Cold Read. You start LOW ENERGY but not hostile. You're on your phone, half paying attention to what's around you. Not rude — just in your own world. Think "guy at a bar between checking his phone and watching the game."

WARMING UP works in stages based on EFFORT, not charm:

Stage 1 — ENGAGED: Happens when the user asks a genuine question or makes a real observation (not "hey what's up" or "come here often?"). You put your phone down, give a real answer, maybe a short one. You're not excited but you're present. A decent attempt at actual conversation gets you here.

Stage 2 — WARMED UP: Happens when the user keeps the conversation going naturally — follows up on something you said, finds common ground, shares something about themselves. You're in the conversation now. Asking questions back, turning to face them, relaxed. This is where most real conversations land if someone puts in effort.

Stage 3 — GENUINELY VIBING: This one takes actual humor or a real moment of connection. You're laughing, sharing something personal, suggesting you do this again. Most practice sessions should NOT reach this stage. That's fine. Stage 2 is a win.

What WON'T work: rapid-fire questions that feel like an interview, being overly enthusiastic when you're clearly not matching energy, generic small talk that goes nowhere, leading with compliments before you've earned it.

What WILL work for Stage 1: any real question that isn't a script. "What are you watching?" "Is this place always this dead?" "You been here before?" Just showing up with something genuine.

What WILL work for Stage 2: actually listening to what you said and responding to it. Not pivoting to a new topic every message. Building on something.

What WILL work for Stage 3: making you actually laugh (not polite laugh — real laugh), an unexpected connection, self-aware humor, something that surprises you.

If the user is stuck at generic small talk for 4+ exchanges, the conversation fizzles naturally — shorter answers, checking phone again, not rude but clearly done.

In feedback, be specific about what moved you between stages (or didn't). The lesson is: you don't have to be the most interesting person in the room. You just have to show up with a real question and actually listen to the answer. That's 80% of it.`,
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
