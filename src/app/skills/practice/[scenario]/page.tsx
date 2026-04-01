"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, RotateCcw, BookOpen } from "lucide-react";
import {
  getScenario,
  TEMPERATURE_OPTIONS,
  resolveTemperature,
  type ReceptionTemperature,
} from "@/lib/practice-data";
import TemperatureSelect from "@/components/temperature-select";

interface Message {
  role: "user" | "character";
  content: string;
}

async function streamPracticeResponse(
  messages: Message[],
  scenarioId: string,
  temperature: string,
  isSurprise: boolean,
  onToken: (token: string) => void
): Promise<string> {
  const res = await fetch("/api/practice/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      scenarioId,
      temperature,
      isSurprise,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error("Failed to get response");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onToken(chunk);
  }

  return full;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-full bg-steel/10 flex items-center justify-center shrink-0">
        <span className="text-sm">🎭</span>
      </div>
      <div className="bg-white border border-navy/8 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-navy/30 rounded-full typing-dot" />
          <div className="w-2 h-2 bg-navy/30 rounded-full typing-dot" />
          <div className="w-2 h-2 bg-navy/30 rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-steel text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  // Check if message contains feedback (after "---")
  const feedbackSplit = message.content.split(/\n---\n/);
  const hasEnded = feedbackSplit.length > 1;
  const dialogue = feedbackSplit[0];
  const feedback = hasEnded ? feedbackSplit.slice(1).join("\n") : null;

  return (
    <>
      {dialogue.trim() && (
        <div className="flex items-end gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-steel/10 flex items-center justify-center shrink-0">
            <span className="text-sm">🎭</span>
          </div>
          <div className="bg-white border border-navy/8 rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] shadow-sm">
            <p className="text-[15px] leading-relaxed text-navy">
              {dialogue.trim()}
            </p>
          </div>
        </div>
      )}
      {feedback && (
        <div className="mx-2 mb-4 bg-gradient-to-r from-steel/5 to-steel/10 border border-steel/20 rounded-2xl p-4">
          <p className="text-xs font-semibold text-steel uppercase tracking-wide mb-2">
            Feedback
          </p>
          <p className="text-[14px] leading-relaxed text-navy/80 whitespace-pre-line">
            {feedback.trim()}
          </p>
        </div>
      )}
    </>
  );
}

export default function PracticeChat() {
  const router = useRouter();
  const params = useParams();
  const scenarioId = params.scenario as string;
  const scenario = getScenario(scenarioId);

  const [phase, setPhase] = useState<"select" | "chat">("select");
  const [selectedTemp, setSelectedTemp] =
    useState<ReceptionTemperature | null>(null);
  const [resolvedTemp, setResolvedTemp] = useState<
    "warm" | "medium" | "cold" | null
  >(null);
  const [isSurprise, setIsSurprise] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceEnded, setPracticeEnded] = useState(false);
  const lastUserInputRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Detect feedback in messages — award points when practice ends
  const pointsAwardedRef = useRef(false);
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === "character" &&
      lastMessage.content.includes("\n---\n")
    ) {
      setPracticeEnded(true);
      if (!pointsAwardedRef.current) {
        pointsAwardedRef.current = true;
        fetch("/api/points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionType: "practice", referenceId: scenarioId }),
        })
          .then((res) => {
            if (!res.ok) console.error("Practice points failed:", res.status);
          })
          .catch(() => {});
      }
    }
  }, [messages, scenarioId]);

  function handleTemperatureSelect(temp: ReceptionTemperature) {
    setSelectedTemp(temp);
    const surprise = temp === "surprise";
    setIsSurprise(surprise);
    const resolved = resolveTemperature(temp);
    setResolvedTemp(resolved);
    setMessages([]);
    setPhase("chat");
    // Focus input after transition
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function resetScenario() {
    pointsAwardedRef.current = false;
    setPracticeEnded(false);
    setError(null);
    setInput("");
    setMessages([]);
    setSelectedTemp(null);
    setResolvedTemp(null);
    setIsSurprise(false);
    setPhase("select");
  }

  async function handleSend(retryText?: string) {
    const text = retryText || input.trim();
    if (!text || isTyping || practiceEnded || !resolvedTemp) return;

    setError(null);
    lastUserInputRef.current = text;

    const userMessage: Message = { role: "user", content: text };
    const withUser = retryText ? messages : [...messages, userMessage];
    if (!retryText) {
      setMessages(withUser);
      setInput("");
    }
    setIsTyping(true);

    try {
      const streamingMessage: Message = { role: "character", content: "" };
      setMessages([...withUser, streamingMessage]);

      const fullResponse = await streamPracticeResponse(
        withUser,
        scenarioId,
        resolvedTemp,
        isSurprise,
        (token) => {
          streamingMessage.content += token;
          setMessages([...withUser, { ...streamingMessage }]);
        }
      );

      const characterMessage: Message = {
        role: "character",
        content: fullResponse,
      };
      setMessages([...withUser, characterMessage]);
      setIsTyping(false);
    } catch {
      setIsTyping(false);
      setMessages(withUser);
      setError("Give me a sec — lost my train of thought.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!scenario) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-cream items-center justify-center">
        <p className="text-navy/50">Scenario not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-navy/8">
        <button
          onClick={() =>
            phase === "chat" && !practiceEnded
              ? resetScenario()
              : router.push("/skills/practice")
          }
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-navy/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-steel to-steel-dark flex items-center justify-center">
          <span className="text-white text-sm">🎭</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-navy leading-tight truncate">
            {scenario.title}
          </h1>
          <p className="text-[11px] text-steel font-medium">Practice Mode</p>
        </div>
        {phase === "chat" && resolvedTemp && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isSurprise
                ? "bg-purple-100 text-purple-700"
                : resolvedTemp === "warm"
                  ? "bg-green-100 text-green-700"
                  : resolvedTemp === "cold"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
            }`}
          >
            {isSurprise ? "Surprise" : resolvedTemp === "warm" ? "Friendly" : resolvedTemp === "medium" ? "Cold Read" : "Tough Crowd"}
          </span>
        )}
      </div>

      {/* Temperature selection phase */}
      {phase === "select" && (
        <>
          {/* Scenario context */}
          <div className="px-4 py-2.5 bg-steel/5 border-b border-steel/10">
            <p className="text-xs text-navy/50 leading-relaxed">
              {scenario.setting}
            </p>
          </div>
          <TemperatureSelect onSelect={handleTemperatureSelect} />
        </>
      )}

      {/* Chat phase */}
      {phase === "chat" && (
        <>
          {/* Scene description banner */}
          <div className="px-4 py-3 bg-steel/5 border-b border-steel/10">
            <p className="text-[13px] text-navy/60 leading-relaxed italic">
              {scenario.sceneDescription}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
            {messages.length === 0 && !isTyping && (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-navy/30 text-center px-8">
                  You make the first move. What do you say?
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mb-3 bg-cream-dark/80 border border-navy/10 rounded-2xl p-4 flex items-center justify-between gap-3">
              <p className="text-sm text-navy/60">{error}</p>
              <button
                onClick={() => handleSend(lastUserInputRef.current)}
                className="text-sm font-semibold text-steel hover:text-steel-dark transition-colors px-4 py-2 bg-white rounded-xl border border-navy/10 shrink-0"
              >
                Try again
              </button>
            </div>
          )}

          {/* End-of-practice actions */}
          {practiceEnded && (
            <div className="px-4 pb-2">
              <div className="flex gap-2.5">
                <button
                  onClick={resetScenario}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-navy/10 rounded-xl text-[14px] font-semibold text-navy/60 hover:bg-navy/5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try again
                </button>
                <button
                  onClick={() => router.push("/skills")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-steel text-white rounded-xl text-[14px] font-semibold hover:bg-steel-dark transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Back to skills
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          {!practiceEnded && (
            <div className="border-t border-navy/8 bg-white px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Say something..."
                  rows={1}
                  className="flex-1 bg-cream-dark/60 text-navy placeholder:text-navy/30 rounded-2xl px-4 py-3 text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-steel/30 transition-all max-h-[120px]"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-steel rounded-full text-white transition-all hover:bg-steel-dark active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[11px] text-navy/25 text-center mt-2">
                This is practice — no pressure, no judgment.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
