"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, RotateCcw, BookOpen, Mic, MessageCircle, MapPin } from "lucide-react";
import {
  getScenario,
  resolveTemperature,
  type ReceptionTemperature,
} from "@/lib/practice-data";
import { type VoiceCharacter } from "@/lib/voice-config";
import TemperatureSelect from "@/components/temperature-select";
import CharacterPicker from "@/components/character-picker";
import VoicePractice from "@/components/voice-practice";

interface Message {
  role: "user" | "character";
  content: string;
}

type PracticeMode = "text" | "voice";
type Phase = "select" | "mode" | "character" | "chat" | "voice";

async function streamPracticeResponse(
  messages: Message[],
  scenarioId: string,
  temperature: string,
  isSurprise: boolean,
  characterId: string | null,
  onToken: (token: string) => void,
  mode: PracticeMode = "text"
): Promise<string> {
  const res = await fetch("/api/practice/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      scenarioId,
      temperature,
      isSurprise,
      characterId,
      mode,
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

function MessageBubble({ message, characterName }: { message: Message; characterName?: string }) {
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

  const feedbackSplit = message.content.split(/\n---\n/);
  const hasEnded = feedbackSplit.length > 1;
  const dialogue = feedbackSplit[0];
  const feedback = hasEnded ? feedbackSplit.slice(1).join("\n") : null;
  const avatarLabel = characterName ? characterName[0] : "🎭";
  const isEmoji = !characterName;

  return (
    <>
      {dialogue.trim() && (
        <div className="flex items-end gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-steel/10 flex items-center justify-center shrink-0">
            <span className={isEmoji ? "text-sm" : "text-sm font-bold text-steel"}>{avatarLabel}</span>
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

// ─── Mode toggle pill ────────────────────────────────────────
function ModeToggle({
  mode,
  onChange,
}: {
  mode: PracticeMode;
  onChange: (m: PracticeMode) => void;
}) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex bg-navy/5 rounded-full p-1">
        <button
          onClick={() => onChange("text")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            mode === "text"
              ? "bg-white text-navy shadow-sm"
              : "text-navy/40 hover:text-navy/60"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Text
        </button>
        <button
          onClick={() => onChange("voice")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            mode === "voice"
              ? "bg-white text-navy shadow-sm"
              : "text-navy/40 hover:text-navy/60"
          }`}
        >
          <Mic className="w-4 h-4" />
          Voice
        </button>
      </div>
    </div>
  );
}

// ─── Mic permission prompt ───────────────────────────────────
function MicPermissionPrompt({
  onAllow,
  onCancel,
}: {
  onAllow: () => void;
  onCancel: () => void;
}) {
  const [requesting, setRequesting] = useState(false);
  const [denied, setDenied] = useState(false);

  async function requestMic() {
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately — we just needed permission
      stream.getTracks().forEach((t) => t.stop());
      onAllow();
    } catch {
      setDenied(true);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mb-5">
        <Mic className="w-8 h-8 text-coral" />
      </div>
      <h2 className="text-lg font-bold text-navy text-center mb-2">
        Enable your microphone
      </h2>
      <p className="text-sm text-navy/50 text-center leading-relaxed mb-6">
        Forge needs your microphone to practice conversations. Nothing is
        recorded or stored.
      </p>
      {denied ? (
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">
            Microphone access needed for voice practice. You can also use text
            mode.
          </p>
          <button
            onClick={onCancel}
            className="text-sm font-semibold text-steel hover:text-steel-dark transition-colors"
          >
            Switch to text mode
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          <button
            onClick={requestMic}
            disabled={requesting}
            className="w-full py-3 bg-coral text-white font-semibold rounded-xl hover:bg-coral-hover transition-colors disabled:opacity-50"
          >
            {requesting ? "Requesting..." : "Allow microphone"}
          </button>
          <button
            onClick={onCancel}
            className="text-sm font-medium text-navy/40 hover:text-navy/60 transition-colors"
          >
            Use text instead
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────
export default function PracticeChat() {
  const router = useRouter();
  const params = useParams();
  const scenarioId = params.scenario as string;
  const scenario = getScenario(scenarioId);

  // Flow: select (temp) → mode (text/voice toggle) → character (voice only) → chat/voice
  const [phase, setPhase] = useState<Phase>("select");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("text");
  const [selectedTemp, setSelectedTemp] =
    useState<ReceptionTemperature | null>(null);
  const [resolvedTemp, setResolvedTemp] = useState<
    "warm" | "medium" | "cold" | null
  >(null);
  const [isSurprise, setIsSurprise] = useState(false);
  const [selectedCharacter, setSelectedCharacter] =
    useState<VoiceCharacter | null>(null);
  const [micPermitted, setMicPermitted] = useState(false);

  // Text chat state
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

  // Award points helper
  const pointsAwardedRef = useRef(false);
  const awardPoints = useCallback((mode: PracticeMode = "text") => {
    if (pointsAwardedRef.current) return;
    pointsAwardedRef.current = true;
    const modeLabel = mode === "voice" ? "Voice" : "Text";
    fetch("/api/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionType: "practice",
        referenceId: `${modeLabel} — ${scenario?.title || scenarioId}`,
      }),
    })
      .then((res) => {
        if (!res.ok) console.error("Practice points failed:", res.status);
      })
      .catch(() => {});
  }, [scenarioId, scenario?.title]);

  // Detect feedback in messages — award points when practice ends
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === "character" &&
      lastMessage.content.includes("\n---\n")
    ) {
      setPracticeEnded(true);
      awardPoints("text");
    }
  }, [messages, scenarioId, awardPoints]);

  const tempLabel = isSurprise
    ? "Surprise"
    : resolvedTemp === "warm"
      ? "Friendly"
      : resolvedTemp === "medium"
        ? "Cold Read"
        : "Tough Crowd";

  function handleTemperatureSelect(temp: ReceptionTemperature) {
    setSelectedTemp(temp);
    const surprise = temp === "surprise";
    setIsSurprise(surprise);
    const resolved = resolveTemperature(temp);
    setResolvedTemp(resolved);
    // Go to mode selection
    setPhase("mode");
  }

  function handleModeConfirm() {
    if (practiceMode === "voice") {
      // Need mic permission first, then character select
      if (!micPermitted) {
        setPhase("character"); // Will show mic prompt first
      } else {
        setPhase("character");
      }
    } else {
      // Text mode — go straight to chat
      setMessages([]);
      setPhase("chat");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleCharacterSelect(char: VoiceCharacter) {
    setSelectedCharacter(char);
    if (!micPermitted) {
      // Will show mic permission prompt, then start voice
      return; // MicPermissionPrompt handles the flow
    }
    setPhase("voice");
  }

  function handleMicAllowed() {
    setMicPermitted(true);
    if (selectedCharacter) {
      setPhase("voice");
    }
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
    setSelectedCharacter(null);
    setPracticeMode("text");
    setPhase("select");
  }

  function switchToText() {
    setPracticeMode("text");
    setSelectedCharacter(null);
    setMessages([]);
    setPhase("chat");
    setTimeout(() => inputRef.current?.focus(), 100);
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
        selectedCharacter?.id ?? null,
        (token) => {
          streamingMessage.content += token;
          setMessages([...withUser, { ...streamingMessage }]);
        },
        practiceMode
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

  // Voice practice ended — award points
  function handleVoicePracticeEnd(voiceMessages: Message[]) {
    awardPoints("voice");
  }

  if (!scenario) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-cream items-center justify-center">
        <p className="text-navy/50">Scenario not found.</p>
      </div>
    );
  }

  // ─── Voice mode ────────────────────────────────────────────
  if (phase === "voice" && selectedCharacter && resolvedTemp) {
    return (
      <VoicePractice
        character={selectedCharacter}
        scenarioId={scenarioId}
        scenarioTitle={scenario.title}
        sceneDescription={scenario.sceneDescription}
        resolvedTemp={resolvedTemp}
        isSurprise={isSurprise}
        tempLabel={tempLabel}
        onSwitchToText={switchToText}
        onEnd={resetScenario}
        onPracticeEnd={handleVoicePracticeEnd}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-navy/8">
        <button
          onClick={() => {
            if (phase === "chat" && !practiceEnded) {
              resetScenario();
            } else if (phase === "mode") {
              setPhase("select");
            } else if (phase === "character") {
              setPhase("mode");
            } else {
              router.push("/skills/practice");
            }
          }}
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
        {(phase === "chat" || phase === "voice") && resolvedTemp && (
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
            {tempLabel}
          </span>
        )}
      </div>

      {/* Temperature selection phase */}
      {phase === "select" && (
        <>
          <div className="px-4 py-2.5 bg-steel/5 border-b border-steel/10">
            <p className="text-xs text-navy/50 leading-relaxed">
              {scenario.setting}
            </p>
          </div>
          <TemperatureSelect onSelect={handleTemperatureSelect} />
        </>
      )}

      {/* Mode selection phase */}
      {phase === "mode" && (
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2.5 bg-steel/5 border-b border-steel/10">
            <p className="text-xs text-navy/50 leading-relaxed">
              {scenario.setting}
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <h2 className="text-base font-semibold text-navy text-center mb-1">
              How do you want to practice?
            </h2>
            <p className="text-xs text-navy/40 text-center mb-2">
              Text is the default. Voice uses your microphone.
            </p>
            <ModeToggle mode={practiceMode} onChange={setPracticeMode} />
            <button
              onClick={handleModeConfirm}
              className="w-full max-w-[280px] mt-4 py-3.5 bg-coral text-white font-semibold rounded-2xl text-base hover:bg-coral-hover transition-colors active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Character selection phase (voice only) */}
      {phase === "character" && !micPermitted && (
        <MicPermissionPrompt
          onAllow={() => {
            setMicPermitted(true);
            // If character already selected (shouldn't happen), go to voice
            // Otherwise stay on character phase to show picker
          }}
          onCancel={switchToText}
        />
      )}
      {phase === "character" && micPermitted && (
        <CharacterPicker
          onSelect={(char) => {
            setSelectedCharacter(char);
            setPhase("voice");
          }}
        />
      )}

      {/* Text chat phase */}
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
              <button
                onClick={() => router.push("/go-mode")}
                className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 text-[13px] font-medium text-coral hover:text-coral-hover transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                Want to find a real event to try this?
              </button>
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
