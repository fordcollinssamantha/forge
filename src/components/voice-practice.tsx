"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, X, MessageCircle, Lock, MapPin, RotateCcw } from "lucide-react";
import {
  type VoiceCharacter,
  resolveGender,
  pickVoice,
} from "@/lib/voice-config";

interface Message {
  role: "user" | "character";
  content: string;
}

interface VoicePracticeProps {
  character: VoiceCharacter;
  scenarioId: string;
  scenarioTitle: string;
  sceneDescription: string;
  resolvedTemp: "warm" | "medium" | "cold";
  isSurprise: boolean;
  tempLabel: string;
  onSwitchToText: () => void;
  onEnd: () => void;
  /** Called when practice ends (feedback received) with messages for parent to award points */
  onPracticeEnd: (messages: Message[]) => void;
}

type OrbState = "idle" | "listening" | "processing" | "speaking";

// Check browser support once
function hasSpeechRecognition(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  );
}

function hasSpeechSynthesis(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.speechSynthesis;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognitionClass(): any {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

// ─── Text parsing: separate [bracketed actions] from spoken dialogue ───
interface TextSegment {
  type: "narration" | "dialogue";
  text: string;
}

function parseCharacterText(raw: string): TextSegment[] {
  const segments: TextSegment[] = [];
  // Split on bracket groups, keeping the brackets
  const parts = raw.split(/(\[[^\]]*\])/g);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (/^\[.*\]$/.test(trimmed)) {
      segments.push({ type: "narration", text: trimmed });
    } else {
      segments.push({ type: "dialogue", text: trimmed });
    }
  }
  return segments;
}

function extractDialogueOnly(raw: string): string {
  return parseCharacterText(raw)
    .filter((s) => s.type === "dialogue")
    .map((s) => s.text)
    .join(" ")
    .trim();
}

// ─── TTS post-processing: punctuation hinting for more natural speech ───
function hintPunctuation(text: string): string {
  let out = text;
  // Add comma before conjunctions mid-sentence for natural pauses
  out = out.replace(/\b(but|and|so|because|though) /gi, ", $1 ");
  // Clean up double commas from existing punctuation
  out = out.replace(/,\s*,/g, ",");
  // Add slight pause after "I mean" / "you know" / "like" as filler
  out = out.replace(/\b(I mean|you know|like)\b(?!,)/gi, "$1,");
  // Convert "..." to proper ellipsis (TTS handles this better)
  out = out.replace(/\.{3,}/g, "…");
  // Convert double hyphens or em-dashes for interruption effect
  out = out.replace(/\s*[—–]\s*/g, "… ");
  return out;
}

// Split text into sentences for chunked TTS
function splitSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or end
  const raw = text.match(/[^.!?…]+[.!?…]+[\s]*/g);
  if (!raw) return text.trim() ? [text.trim()] : [];
  return raw.map((s) => s.trim()).filter(Boolean);
}

export default function VoicePractice({
  character,
  scenarioId,
  scenarioTitle,
  sceneDescription,
  resolvedTemp,
  isSurprise,
  tempLabel,
  onSwitchToText,
  onEnd,
  onPracticeEnd,
}: VoicePracticeProps) {
  const router = useRouter();
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [practiceEnded, setPracticeEnded] = useState(false);
  const [ttsUnavailable, setTtsUnavailable] = useState(false);
  const [requestingFeedback, setRequestingFeedback] = useState(false);
  // Track which message indices had TTS overflow (more than 2 sentences spoken)
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [overflowMessages, setOverflowMessages] = useState<Set<number>>(new Set());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const resolvedGenderRef = useRef<"male" | "female">(
    resolveGender(character.gender)
  );
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTranscript]);

  // Check TTS availability
  useEffect(() => {
    if (!hasSpeechSynthesis()) {
      setTtsUnavailable(true);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
      window.speechSynthesis?.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      setError("Didn\u2019t catch that. Tap the mic and try again.");
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      setOrbState("idle");
      setCurrentTranscript("");
    }, 10000);
  }, [clearSilenceTimer]);

  // Speak a single utterance
  const speakUtterance = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!hasSpeechSynthesis() || ttsUnavailable) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = character.pitch;
        utterance.rate = character.rate;

        const voice = pickVoice(resolvedGenderRef.current);
        if (voice) utterance.voice = voice;

        let settled = false;
        const settle = () => {
          if (!settled) {
            settled = true;
            clearTimeout(fallbackTimer);
            resolve();
          }
        };

        // iOS Safari often doesn't fire onend — fall back to a duration estimate
        // ~12 chars/sec at rate=1, plus 1.5s buffer
        const estimatedMs = (text.length / (12 * character.rate)) * 1000 + 1500;
        const fallbackTimer = setTimeout(settle, estimatedMs);

        utterance.onend = settle;
        utterance.onerror = () => {
          setTtsUnavailable(true);
          settle();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [character.pitch, character.rate, ttsUnavailable]
  );

  // Speak text: strips narration, hints punctuation, chunks into sentences,
  // caps at 2 sentences for dialogue (unlimited for feedback).
  // Returns the number of sentences that were NOT spoken (overflow).
  const speak = useCallback(
    async (text: string, opts?: { unlimited?: boolean }): Promise<number> => {
      if (!hasSpeechSynthesis() || ttsUnavailable) return 0;

      window.speechSynthesis.cancel();

      // Strip bracketed narration — only speak dialogue
      const dialogue = extractDialogueOnly(text);
      if (!dialogue) return 0;

      // Post-process for more natural speech
      const hinted = hintPunctuation(dialogue);
      const sentences = splitSentences(hinted);
      if (sentences.length === 0) return 0;

      const maxSpeak = opts?.unlimited ? sentences.length : 2;
      const toSpeak = sentences.slice(0, maxSpeak);
      const overflow = Math.max(0, sentences.length - maxSpeak);

      for (let i = 0; i < toSpeak.length; i++) {
        await speakUtterance(toSpeak[i]);
        // 200ms pause between sentences
        if (i < toSpeak.length - 1) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      return overflow;
    },
    [speakUtterance, ttsUnavailable]
  );

  // Send message to API and stream response
  const sendToAPI = useCallback(
    async (userText: string) => {
      const userMsg: Message = { role: "user", content: userText };
      const updatedMessages = [...messagesRef.current, userMsg];
      setMessages(updatedMessages);
      setOrbState("processing");

      try {
        const res = await fetch("/api/practice/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            scenarioId,
            temperature: resolvedTemp,
            isSurprise,
            characterId: character.id,
            mode: "voice",
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error("API error");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";

        // Start with empty character message
        const charMsg: Message = { role: "character", content: "" };
        setMessages([...updatedMessages, charMsg]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setMessages([
            ...updatedMessages,
            { role: "character", content: full },
          ]);
        }

        // Check for feedback marker
        const hasFeedback = full.includes("\n---\n");
        const finalMessages = [
          ...updatedMessages,
          { role: "character" as const, content: full },
        ];
        setMessages(finalMessages);

        if (hasFeedback) {
          setPracticeEnded(true);
          onPracticeEnd(finalMessages);
        }

        // Speak the dialogue part (capped at 2 sentences, narration stripped)
        const parts = full.split(/\n---\n/);
        const dialoguePart = parts[0].trim();
        const msgIndex = updatedMessages.length; // index of the character message
        if (dialoguePart) {
          setOrbState("speaking");
          const overflow = await speak(dialoguePart);
          if (overflow > 0) {
            setOverflowMessages((prev) => new Set(prev).add(msgIndex));
          }
        }

        // Feedback is displayed as text only — not spoken

        setOrbState("idle");
      } catch {
        setOrbState("idle");
        setError("Lost the thread for a sec. Say that again?");
      }
    },
    [
      scenarioId,
      resolvedTemp,
      isSurprise,
      character.id,
      speak,
      onPracticeEnd,
    ]
  );

  // Start listening
  const startListening = useCallback(() => {
    if (practiceEnded) return;

    const SRClass = getSpeechRecognitionClass();
    if (!SRClass) {
      setError("Voice mode works best in Chrome or Safari.");
      return;
    }

    setError(null);
    window.speechSynthesis?.cancel();

    const recognition = new SRClass();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onstart = () => {
      setOrbState("listening");
      setCurrentTranscript("");
      startSilenceTimer();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      clearSilenceTimer();
      startSilenceTimer();

      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      setCurrentTranscript(finalTranscript + interim);
    };

    recognition.onend = () => {
      clearSilenceTimer();
      const text = finalTranscript.trim();
      setCurrentTranscript("");

      if (text) {
        sendToAPI(text);
      } else {
        setOrbState("idle");
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      clearSilenceTimer();
      if (event.error === "not-allowed") {
        setError(
          "Microphone access needed for voice practice. You can also use text mode."
        );
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        setError("Didn\u2019t catch that. Tap the mic and try again.");
      }
      setOrbState("idle");
      setCurrentTranscript("");
    };

    recognition.start();
  }, [
    practiceEnded,
    startSilenceTimer,
    clearSilenceTimer,
    sendToAPI,
  ]);

  // Request feedback explicitly (End & Get Feedback button)
  const requestFeedback = useCallback(async () => {
    if (practiceEnded || requestingFeedback) return;
    setRequestingFeedback(true);

    // Stop any in-progress listening
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
    }
    window.speechSynthesis?.cancel();

    // If no messages yet, just end
    if (messagesRef.current.length === 0) {
      onEnd();
      return;
    }

    // Send a system-like user message prompting feedback
    const feedbackRequest: Message = {
      role: "user",
      content: "[The user has ended the conversation and wants feedback now.]",
    };
    const updatedMessages = [...messagesRef.current, feedbackRequest];
    setMessages(updatedMessages);
    setOrbState("processing");

    try {
      const res = await fetch("/api/practice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          scenarioId,
          temperature: resolvedTemp,
          isSurprise,
          characterId: character.id,
          mode: "voice",
        }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      setMessages([...updatedMessages, { role: "character", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages([
          ...updatedMessages,
          { role: "character", content: full },
        ]);
      }

      const finalMessages = [
        ...updatedMessages,
        { role: "character" as const, content: full },
      ];
      setMessages(finalMessages);
      setPracticeEnded(true);
      onPracticeEnd(finalMessages);

      // Speak only the dialogue part (feedback is text-only)
      const parts = full.split(/\n---\n/);
      const dialoguePart = parts[0].trim();
      if (dialoguePart) {
        setOrbState("speaking");
        await speak(dialoguePart, { unlimited: true });
      }

      setOrbState("idle");
    } catch {
      setOrbState("idle");
      setRequestingFeedback(false);
      setError("Couldn't get feedback right now. Try again?");
    }
  }, [
    practiceEnded,
    requestingFeedback,
    scenarioId,
    resolvedTemp,
    isSurprise,
    character.id,
    speak,
    onPracticeEnd,
    onEnd,
  ]);

  // Stop listening
  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
  }, [clearSilenceTimer]);

  // Toggle mic
  function handleMicPress() {
    if (orbState === "listening") {
      stopListening();
    } else if (orbState === "idle") {
      startListening();
    }
  }

  // Get the last character message's spoken dialogue for orb display (no narration)
  const lastCharMsg = [...messages].reverse().find((m) => m.role === "character");
  const lastCharDialogue = lastCharMsg
    ? extractDialogueOnly(lastCharMsg.content.split(/\n---\n/)[0])
    : "";

  // Orb colors and animation
  const orbConfig = {
    idle: {
      bg: "bg-navy/10",
      ring: "",
      text: "Tap the mic to start",
    },
    listening: {
      bg: "bg-[#FF6B6B]/10",
      ring: "ring-4 ring-[#FF6B6B]/30 animate-pulse",
      text: "Listening...",
    },
    processing: {
      bg: "bg-navy/10",
      ring: "ring-4 ring-navy/20 animate-pulse",
      text: "Thinking...",
    },
    speaking: {
      bg: "bg-[#4682B4]/10",
      ring: "ring-4 ring-[#4682B4]/30 animate-pulse",
      text: lastCharDialogue || "Speaking...",
    },
  };

  const orb = orbConfig[orbState];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-navy/8">
        <button
          onClick={onEnd}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-navy/5 transition-colors"
        >
          <X className="w-5 h-5 text-navy" />
        </button>
        <div
          className={`w-9 h-9 rounded-full ${character.color} flex items-center justify-center`}
        >
          <span className="text-white text-sm font-bold">
            {character.name[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-navy leading-tight truncate">
            {character.name} — {tempLabel} — {scenarioTitle}
          </h1>
          <p className="text-[11px] text-steel font-medium">Voice Practice</p>
        </div>
      </div>

      {/* Scene description */}
      <div className="px-4 py-3 bg-steel/5 border-b border-steel/10">
        <p className="text-[13px] text-navy/60 leading-relaxed italic">
          {sceneDescription}
        </p>
      </div>

      {/* Center orb area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col items-center justify-center py-8 px-6 shrink-0">
          {/* Animated orb */}
          <div
            className={`w-32 h-32 rounded-full ${orb.bg} ${orb.ring} flex items-center justify-center transition-all duration-300 mb-4`}
          >
            {orbState === "listening" && (
              <Mic className="w-10 h-10 text-[#FF6B6B]" />
            )}
            {orbState === "speaking" && (
              <div
                className={`w-12 h-12 rounded-full ${character.color} flex items-center justify-center`}
              >
                <span className="text-white text-xl font-bold">
                  {character.name[0]}
                </span>
              </div>
            )}
            {orbState === "processing" && (
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-navy/30 rounded-full typing-dot" />
                <div className="w-2.5 h-2.5 bg-navy/30 rounded-full typing-dot" />
                <div className="w-2.5 h-2.5 bg-navy/30 rounded-full typing-dot" />
              </div>
            )}
            {orbState === "idle" && (
              <Mic className="w-10 h-10 text-navy/30" />
            )}
          </div>

          {/* Orb status text */}
          <p
            className={`text-sm font-medium text-center max-w-[280px] leading-relaxed ${
              orbState === "speaking"
                ? "text-[#4682B4]"
                : orbState === "listening"
                  ? "text-[#FF6B6B]"
                  : "text-navy/40"
            }`}
          >
            {orbState === "listening" && currentTranscript
              ? currentTranscript
              : orb.text}
          </p>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 min-h-0">
          {messages.length > 0 && (
            <div className="space-y-3">
              {messages.map((msg, i) => {
                const isFeedback =
                  msg.role === "character" && msg.content.includes("\n---\n");
                const contentParts = msg.content.split(/\n---\n/);
                const rawDialogue = contentParts[0].trim();
                const feedback =
                  isFeedback ? contentParts.slice(1).join("\n").trim() : null;

                // For character messages, parse into narration vs dialogue segments
                const isCharacter = msg.role === "character";
                const segments = isCharacter ? parseCharacterText(rawDialogue) : [];

                // Check if this message has overflow (TTS only spoke 2 sentences)
                const hasOverflow = overflowMessages.has(i);
                const isExpanded = expandedMessages.has(i);

                // For overflow: split dialogue into spoken (first 2 sentences) and rest
                let spokenDialogue = "";
                let restDialogue = "";
                if (hasOverflow && !isExpanded && isCharacter) {
                  const dialogueOnly = extractDialogueOnly(rawDialogue);
                  const sentences = splitSentences(dialogueOnly);
                  spokenDialogue = sentences.slice(0, 2).join(" ");
                  restDialogue = sentences.slice(2).join(" ");
                }

                return (
                  <div key={i}>
                    {rawDialogue && (
                      <div className="text-[13px] leading-relaxed">
                        <span className="font-semibold text-navy/70">
                          {msg.role === "user" ? "You" : character.name}:
                        </span>{" "}
                        {msg.role === "user" ? (
                          <span className="text-navy/70">{rawDialogue}</span>
                        ) : hasOverflow && !isExpanded ? (
                          <>
                            {/* Show narration segments inline */}
                            {segments.map((seg, si) => {
                              if (seg.type === "narration") {
                                return (
                                  <span key={si} className="italic text-gray-400 text-[12px]">
                                    {seg.text}{" "}
                                  </span>
                                );
                              }
                              // Only show first 2 sentences of dialogue
                              return null;
                            })}
                            <span className="text-steel-dark">{spokenDialogue}</span>
                            {restDialogue && (
                              <>
                                <span className="text-navy/30"> …</span>
                                <button
                                  onClick={() =>
                                    setExpandedMessages((prev) => {
                                      const next = new Set(prev);
                                      next.add(i);
                                      return next;
                                    })
                                  }
                                  className="ml-1 text-[11px] font-medium text-steel hover:text-steel-dark transition-colors"
                                >
                                  read more
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          // Full render with styled narration vs dialogue
                          segments.map((seg, si) =>
                            seg.type === "narration" ? (
                              <span key={si} className="italic text-gray-400 text-[12px]">
                                {seg.text}{" "}
                              </span>
                            ) : (
                              <span key={si} className="text-steel-dark">
                                {seg.text}{" "}
                              </span>
                            )
                          )
                        )}
                      </div>
                    )}
                    {feedback && (
                      <div className="mt-3 bg-gradient-to-r from-steel/5 to-steel/10 border border-steel/20 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-steel uppercase tracking-wide mb-2">
                          Feedback
                        </p>
                        <p className="text-[13px] leading-relaxed text-navy/80 whitespace-pre-line">
                          {feedback}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={transcriptEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* TTS unavailable warning */}
      {ttsUnavailable && (
        <div className="mx-4 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700">
            Voice playback isn&apos;t available on this browser. Showing text
            instead.
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 bg-cream-dark/80 border border-navy/10 rounded-2xl p-3 flex items-center justify-between gap-3">
          <p className="text-sm text-navy/60">{error}</p>
          {error.includes("Microphone") && (
            <button
              onClick={onSwitchToText}
              className="text-xs font-semibold text-steel hover:text-steel-dark transition-colors px-3 py-1.5 bg-white rounded-xl border border-navy/10 shrink-0"
            >
              Use text
            </button>
          )}
        </div>
      )}

      {/* Bottom controls */}
      <div className="border-t border-navy/8 bg-white px-4 py-4">
        {practiceEnded ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2.5">
              <button
                onClick={onEnd}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-navy/10 rounded-xl text-[14px] font-semibold text-navy/60 hover:bg-navy/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Try again
              </button>
              <button
                onClick={onEnd}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-steel text-white rounded-xl text-[14px] font-semibold hover:bg-steel-dark transition-colors"
              >
                Done
              </button>
            </div>
            <button
              onClick={() => router.push("/go-mode")}
              className="flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium text-coral hover:text-coral-hover transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              Want to find a real event to try this?
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              {/* Push-to-talk mic button */}
              <button
                onClick={handleMicPress}
                disabled={orbState === "processing" || orbState === "speaking" || requestingFeedback}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                  orbState === "listening"
                    ? "bg-[#FF6B6B] text-white shadow-lg shadow-[#FF6B6B]/30"
                    : "bg-navy/10 text-navy/60 hover:bg-navy/15"
                }`}
              >
                {orbState === "listening" ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[11px] text-navy/30">
                <Lock className="w-3 h-3" />
                Not recorded
              </div>
              <span className="text-navy/15">·</span>
              <button
                onClick={requestFeedback}
                disabled={requestingFeedback || messages.length === 0}
                className="text-[12px] font-semibold text-coral hover:text-coral-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {requestingFeedback ? "Getting feedback..." : "End & Get Feedback"}
              </button>
              <span className="text-navy/15">·</span>
              <button
                onClick={onSwitchToText}
                className="flex items-center gap-1 text-[11px] text-navy/35 hover:text-navy/50 transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                Switch to Text
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
