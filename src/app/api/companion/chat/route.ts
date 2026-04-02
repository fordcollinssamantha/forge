import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, MissionContext } from "@/lib/companion-prompt";

const anthropic = new Anthropic();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages,
      checkin,
      behavioralCheckin,
      userName,
      city,
      motivation,
      missions,
      systemOverride,
    }: {
      messages: { role: "user" | "companion"; content: string }[];
      checkin?: { emoji?: string; emojis?: string[]; emotion_words?: string[] };
      behavioralCheckin?: { avoidance_response?: string };
      userName?: string;
      city?: string;
      motivation?: string;
      missions?: MissionContext;
      systemOverride?: string;
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const systemPrompt = systemOverride || buildSystemPrompt({
      userName: userName || "friend",
      behavioralResponse: behavioralCheckin?.avoidance_response,
      emoji: checkin?.emoji,
      emojis: checkin?.emojis,
      emotionWords: checkin?.emotion_words?.join(", "),
      city: city || undefined,
      motivation: motivation || undefined,
      missions: missions || undefined,
    });

    // Convert our message format to Anthropic format
    const anthropicMessages = messages
      .filter((m) => m.role === "user" || m.role === "companion")
      .map((m) => ({
        role: (m.role === "companion" ? "assistant" : "user") as
          | "user"
          | "assistant",
        content: m.content,
      }));

    // Strip leading assistant messages (e.g. the companion's opening message)
    while (anthropicMessages.length > 0 && anthropicMessages[0].role === "assistant") {
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

    // Create a ReadableStream that sends text deltas
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
    console.error("Companion chat error:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
