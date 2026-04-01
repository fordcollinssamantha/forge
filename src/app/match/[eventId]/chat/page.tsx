"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { SEED_EVENTS } from "@/lib/seed-events";
import { SEED_PROFILES } from "@/lib/seed-profiles";

interface ChatMessage {
  id: string;
  from: "them" | "you";
  text: string;
}

export default function MiniChatPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profile");
  const bottomRef = useRef<HTMLDivElement>(null);

  const event = SEED_EVENTS.find((e) => e.id === eventId);
  const profile = SEED_PROFILES.find((p) => p.id === profileId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [hasPickedIceBreaker, setHasPickedIceBreaker] = useState(false);

  const iceBreakers = event
    ? [
        `Hey, I'm heading to ${event.title} too. Want to link up?`,
        `Down to meet up at ${event.venue} before it starts?`,
        `First time going to something like this solo. You?`,
      ]
    : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!event || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream text-navy/50">
        Not found.
      </div>
    );
  }

  function sendMessage(text: string) {
    setMessages((prev) => [
      ...prev,
      { id: `you-${Date.now()}`, from: "you", text },
    ]);
    setInput("");
    setHasPickedIceBreaker(true);

    // Simulate a reply after a short delay
    setTimeout(() => {
      const replies = [
        "Sounds good! See you there.",
        "Nice, I'll be there a few minutes early.",
        "Cool, looking forward to it.",
        "Awesome, let's do it.",
      ];
      setMessages((prev) => [
        ...prev,
        {
          id: `them-${Date.now()}`,
          from: "them",
          text: replies[Math.floor(Math.random() * replies.length)],
        },
      ]);
    }, 1500);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-navy/8">
        <button
          onClick={() => router.push(`/match/${eventId}`)}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-navy/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-steel/10 flex items-center justify-center">
            <span className="text-sm font-bold text-steel">
              {profile.name[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-navy">{profile.name}</p>
            <p className="text-[11px] text-navy/40">
              Before {event.title}
            </p>
          </div>
        </div>
      </div>

      {/* Context banner */}
      <div className="mx-4 mt-3 px-3 py-2 bg-steel/5 rounded-xl border border-steel/10">
        <p className="text-xs text-steel/70 text-center">
          You&apos;re both going to {event.title} at {event.venue}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {/* Ice-breaker prompt — shown before user sends first message */}
        {!hasPickedIceBreaker && messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-6 animate-msg-in">
            <p className="text-sm font-bold text-navy text-center">
              Break the ice — pick a message or write your own
            </p>
            <div className="flex flex-col gap-2 w-full">
              {iceBreakers.map((text, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(text)}
                  className="w-full px-4 py-3 min-h-[44px] text-left text-sm text-navy/70 bg-white border border-navy/8 rounded-xl hover:bg-navy/3 hover:border-navy/15 transition-colors active:scale-[0.98]"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex animate-msg-in ${msg.from === "you" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.from === "you"
                  ? "bg-coral text-white rounded-br-md"
                  : "bg-white text-navy border border-navy/8 rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-navy/8 pb-safe">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 min-h-[44px] bg-cream rounded-xl text-sm text-navy placeholder:text-navy/30 outline-none focus:ring-2 focus:ring-coral/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="min-w-[44px] min-h-[44px] p-2.5 bg-coral text-white rounded-xl hover:bg-coral-hover transition-colors disabled:opacity-30 disabled:hover:bg-coral flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Confirm meetup button */}
        <button
          onClick={() =>
            router.push(
              `/match/${eventId}/confirmed?profile=${profile.id}`
            )
          }
          className="w-full mt-3 py-3 min-h-[44px] bg-navy text-white text-sm font-bold rounded-xl hover:bg-navy-light transition-colors active:scale-[0.98]"
        >
          Lock it in — we&apos;re meeting up
        </button>
      </div>
    </div>
  );
}
