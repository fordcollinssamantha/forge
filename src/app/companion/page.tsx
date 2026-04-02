"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, X, Eye, MessageCircle, SquarePen } from "lucide-react";

interface Message {
  role: "user" | "companion";
  content: string;
  timestamp: string;
}

interface CheckinData {
  emoji?: string;
  emojis?: string[];
  emotion_words?: string[];
}

interface BehavioralCheckinData {
  avoidance_response?: string;
}

interface PatternCard {
  id: string;
  pattern_type: string;
  pattern_message: string;
  detection_count: number;
  state: string;
}

const EMOJI_LABELS: Record<string, string> = {
  "😊": "Connected",
  "😔": "Disconnected",
  "😟": "On Edge",
  "😶": "Invisible",
  "😎": "Locked In",
  "🤔": "Uncertain",
  "😩": "Overwhelmed",
  "😌": "Solid",
  "😕": "Lost",
  "😒": "Frustrated",
  "🥲": "On My Own",
  "😄": "Fired Up",
};

interface MissionContextData {
  active?: { title: string; created_at: string };
  recent?: { title: string; reflection: string | null; completed_at: string }[];
}

async function streamCompanionResponse(
  messages: Message[],
  checkin: CheckinData | undefined,
  behavioralCheckin: BehavioralCheckinData | undefined,
  userName: string,
  city: string,
  motivation: string,
  missions: MissionContextData | undefined,
  onToken: (token: string) => void
): Promise<string> {
  const res = await fetch("/api/companion/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      checkin,
      behavioralCheckin,
      userName,
      city,
      motivation,
      missions,
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

function buildFirstConversationOpener(
  firstName: string,
  avoidanceResponse: string | undefined,
  emoji: string | undefined,
  emojis: string[] | undefined,
  emotionWords: string[] | undefined
): string {
  const name = firstName || "man";

  // Build emoji label string from multiple emojis
  const emojiList = emojis && emojis.length > 0 ? emojis : emoji ? [emoji] : [];
  const emojiLabels = emojiList
    .map((e) => `${e} ${EMOJI_LABELS[e] || ""}`.trim())
    .filter(Boolean);

  const emojiStr =
    emojiLabels.length > 1
      ? emojiLabels.slice(0, -1).join(", ") + " and " + emojiLabels[emojiLabels.length - 1]
      : emojiLabels[0] || "";

  let avoidanceRef = "";
  if (avoidanceResponse) {
    const trimmed = avoidanceResponse.trim();
    avoidanceRef =
      trimmed.length > 80
        ? trimmed.slice(0, 80).replace(/\s+\S*$/, "") + "..."
        : trimmed;
  }

  const wordsStr =
    emotionWords && emotionWords.length > 0
      ? emotionWords.map((w) => `"${w}"`).join(", ")
      : "";

  if (avoidanceRef && emojiStr && wordsStr) {
    if (emojiLabels.length > 1) {
      return `Hey ${name}. You mentioned "${avoidanceRef}" — that takes guts to say out loud. And you said you're feeling ${emojiStr} — specifically ${wordsStr}. That's an interesting combo. What's going on?`;
    }
    return `Hey ${name}. You mentioned "${avoidanceRef}" — that takes guts to say out loud. And you said you're feeling ${emojiStr} — specifically ${wordsStr}. Want to dig into that, or is there something else going on?`;
  }

  if (emojiStr && wordsStr) {
    if (emojiLabels.length > 1) {
      return `Hey ${name}. You said you're feeling ${emojiStr} — specifically ${wordsStr}. That's an interesting combo. What's going on?`;
    }
    return `Hey ${name}. You said you're feeling ${emojiStr} — specifically ${wordsStr}. What's behind that right now?`;
  }

  return `Hey ${name}. Good to see you here. What's on your mind today?`;
}

function buildReturningOpener(
  firstName: string,
  lastSummary: string | null,
  activePatternType: string | null,
  emoji?: string,
  emojis?: string[],
  emotionWords?: string[],
  activeMission?: { title: string } | null,
  recentMission?: { title: string; reflection: string | null } | null,
): string {
  const name = firstName || "man";

  // Build emoji context from today's check-in
  const emojiList = emojis && emojis.length > 0 ? emojis : emoji ? [emoji] : [];
  const emojiLabels = emojiList
    .map((e) => `${e} ${EMOJI_LABELS[e] || ""}`.trim())
    .filter(Boolean);
  const emojiStr =
    emojiLabels.length > 1
      ? emojiLabels.slice(0, -1).join(", ") + " and " + emojiLabels[emojiLabels.length - 1]
      : emojiLabels[0] || "";
  const wordsStr =
    emotionWords && emotionWords.length > 0
      ? emotionWords.map((w) => `"${w}"`).join(", ")
      : "";

  // Build a pool of available openers, then pick one at random
  const openers: string[] = [];

  // Check-in based openers (preferred on return visits with fresh check-in data)
  if (emojiStr && wordsStr) {
    if (emojiLabels.length > 1) {
      openers.push(
        `Hey ${name}. ${emojiStr} — specifically ${wordsStr}. That's an interesting combo today. What's going on?`,
        `${emojiStr} today, ${name}. And you said ${wordsStr}. Walk me through that.`,
      );
    } else {
      openers.push(
        `Hey ${name}. Feeling ${emojiStr} today — ${wordsStr}. What's behind that?`,
        `${emojiStr}, huh? And ${wordsStr}. What's going on, ${name}?`,
      );
    }
  }

  // Active mission opener
  if (activeMission) {
    openers.push(
      `Hey ${name}. How's the mission going — "${activeMission.title}"?`,
      `Welcome back, ${name}. You've got "${activeMission.title}" on deck. How are you feeling about it?`,
    );
  }

  // Recently completed mission opener
  if (recentMission) {
    if (recentMission.reflection) {
      openers.push(
        `Hey ${name}. Last mission you said "${recentMission.reflection}" about "${recentMission.title}." Anything else on your mind from that?`,
      );
    } else {
      openers.push(
        `Hey ${name}. You knocked out "${recentMission.title}" — nice. What are we working on today?`,
      );
    }
  }

  // Summary-based opener if we have one
  if (lastSummary) {
    openers.push(
      `Hey ${name}. Last time we talked about ${lastSummary} — how's that going?`,
      `Welcome back, ${name}. You mentioned ${lastSummary} last time. Anything new on that front?`,
    );
  }

  // Pattern-based opener if there's an active pattern
  if (activePatternType) {
    const patternLabel = activePatternType.replace(/_/g, " ");
    openers.push(
      `Hey ${name}. Been noticing anything about that ${patternLabel} pattern we flagged?`,
      `Welcome back, ${name}. Have you caught yourself doing any of that ${patternLabel} stuff since we last talked?`,
    );
  }

  // Fallback casual openers
  if (openers.length === 0) {
    openers.push(
      `Hey ${name}. What's going on today?`,
      `What's on your mind, ${name}?`,
      `Good to see you back, ${name}. What are we working on today?`,
    );
  }

  return openers[Math.floor(Math.random() * openers.length)];
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
        <span className="text-sm">⚡</span>
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
      <div className="flex justify-end mb-4 animate-msg-in">
        <div className="bg-coral text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2.5 mb-4 animate-msg-in">
      <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
        <span className="text-sm">⚡</span>
      </div>
      <div className="bg-white border border-navy/8 rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] shadow-sm">
        <p className="text-[15px] leading-relaxed text-navy">{message.content}</p>
      </div>
    </div>
  );
}

function PatternCardComponent({
  card,
  onAccept,
  onDismiss,
  onDiscuss,
}: {
  card: PatternCard;
  onAccept: () => void;
  onDismiss: () => void;
  onDiscuss: () => void;
}) {
  return (
    <div className="mx-4 mb-3 bg-gradient-to-r from-coral/5 to-coral/10 border border-coral/20 rounded-2xl p-4 animate-slide-down">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-coral shrink-0" />
          <span className="text-xs font-semibold text-coral uppercase tracking-wide">
            Something I noticed
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 -m-1 rounded-full hover:bg-navy/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-navy/30" />
        </button>
      </div>
      <p className="text-[14px] leading-relaxed text-navy/80 mb-4">
        {card.pattern_message}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onAccept}
          className="flex-1 text-[13px] font-medium text-navy/60 bg-white border border-navy/10 rounded-xl py-2 px-3 hover:bg-navy/5 transition-colors"
        >
          Yeah, I see it
        </button>
        <button
          onClick={onDiscuss}
          className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-medium text-white bg-coral rounded-xl py-2 px-3 hover:bg-coral-hover transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Tell me more
        </button>
      </div>
    </div>
  );
}

export default function CompanionPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationCount, setConversationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkinData, setCheckinData] = useState<CheckinData | undefined>();
  const [behavioralData, setBehavioralData] = useState<BehavioralCheckinData | undefined>();
  const [userFirstName, setUserFirstName] = useState("");
  const [patternCard, setPatternCard] = useState<PatternCard | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const [activePatternType, setActivePatternType] = useState<string | null>(null);
  const [userCity, setUserCity] = useState("");
  const [userMotivation, setUserMotivation] = useState("");
  const [missionContext, setMissionContext] = useState<MissionContextData | undefined>();
  const lastUserInputRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
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

  // Load conversation data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/conversations");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();

        const convCount = data.conversationCount || 0;
        setConversationCount(convCount);
        setUserFirstName(data.user?.first_name || "");
        setUserCity(data.user?.city || "");
        setUserMotivation(data.user?.motivation || "");
        setActivePatternType(data.activePatternType || null);
        if (data.checkin) {
          setCheckinData({
            emoji: data.checkin.emoji,
            emojis: data.checkin.emojis,
            emotion_words: data.checkin.emotion_words,
          });
        }
        if (data.behavioral) {
          setBehavioralData({ avoidance_response: data.behavioral.avoidance_response });
        }
        // Track last conversation summary for varied openers
        if (data.conversation?.summary) {
          setLastSummary(data.conversation.summary);
        }
        // Load mission context for the coach
        if (data.missions) {
          setMissionContext(data.missions);
        }

        // If there's an existing conversation with messages, load it
        if (data.conversation?.messages?.length > 0) {
          setMessages(data.conversation.messages);
          setConversationId(data.conversation.id);
        } else {
          // Pick opener based on whether this is the first conversation or a return visit
          const opening = convCount <= 1
            ? buildFirstConversationOpener(
                data.user?.first_name,
                data.behavioral?.avoidance_response,
                data.checkin?.emoji,
                data.checkin?.emojis,
                data.checkin?.emotion_words
              )
            : buildReturningOpener(
                data.user?.first_name,
                data.conversation?.summary || null,
                data.activePatternType || null,
                data.checkin?.emoji,
                data.checkin?.emojis,
                data.checkin?.emotion_words,
                data.missions?.active || null,
                data.missions?.recent?.[0] || null,
              );

          const firstMessage: Message = {
            role: "companion",
            content: opening,
            timestamp: new Date().toISOString(),
          };

          setMessages([firstMessage]);

          // Save the new conversation
          const saveRes = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [firstMessage] }),
          });
          if (saveRes.ok) {
            const saveData = await saveRes.json();
            setConversationId(saveData.conversationId);
            setConversationCount((c) => c + 1);
          }
        }

        // Load pattern cards
        const patternRes = await fetch("/api/patterns");
        if (patternRes.ok) {
          const patternData = await patternRes.json();
          if (patternData.card) {
            setPatternCard(patternData.card);
          }
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handlePatternAction = useCallback(
    async (action: "accept" | "dismiss" | "discuss") => {
      if (!patternCard) return;

      // Optimistically remove the card
      const card = patternCard;
      setPatternCard(null);

      // If discuss, pre-fill a prompt
      if (action === "discuss") {
        const prompt = `I noticed you flagged a pattern about "${card.pattern_type.replace(/_/g, " ")}". Can you tell me more about how this shows up in my thinking and what I can do about it?`;
        setInput(prompt);
        inputRef.current?.focus();
      }

      // Send action to API
      try {
        await fetch("/api/patterns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId: card.id, action }),
        });
      } catch (err) {
        console.error("Failed to update pattern card:", err);
      }
    },
    [patternCard]
  );

  async function startNewConversation() {
    if (isTyping) return;

    // Save current conversation if it has user messages and an ID
    const hasUserMessages = messages.some((m) => m.role === "user");
    if (conversationId && hasUserMessages) {
      await saveMessages(messages);
    }

    // Fetch latest pattern card for opener context
    let currentPatternType = activePatternType;
    try {
      const patternRes = await fetch("/api/patterns");
      if (patternRes.ok) {
        const patternData = await patternRes.json();
        if (patternData.card) {
          setPatternCard(patternData.card);
          currentPatternType = patternData.card.pattern_type;
          setActivePatternType(currentPatternType);
        }
      }
    } catch { /* non-critical */ }

    // Returning user — use varied opener
    const opening = buildReturningOpener(
      userFirstName,
      lastSummary,
      currentPatternType,
      checkinData?.emoji,
      checkinData?.emojis,
      checkinData?.emotion_words,
      missionContext?.active || null,
      missionContext?.recent?.[0] || null,
    );

    const firstMessage: Message = {
      role: "companion",
      content: opening,
      timestamp: new Date().toISOString(),
    };

    // Reset state
    setMessages([firstMessage]);
    setConversationId(null);
    setInput("");
    setError(null);
    setPatternCard(null);

    // Create new conversation row in Supabase
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [firstMessage] }),
      });
      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversationId);
        setConversationCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Failed to create new conversation:", err);
    }
  }

  async function saveMessages(updated: Message[]) {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messages: updated,
        }),
      });
      if (res.ok && !conversationId) {
        const data = await res.json();
        setConversationId(data.conversationId);
      }
    } catch (err) {
      console.error("Failed to save messages:", err);
    }
  }

  async function handleSend(retryText?: string) {
    const text = retryText || input.trim();
    if (!text || isTyping) return;

    setError(null);
    lastUserInputRef.current = text;

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    // If retrying, messages already contain the user message
    const withUser = retryText ? messages : [...messages, userMessage];
    if (!retryText) {
      setMessages(withUser);
      setInput("");
    }
    setIsTyping(true);

    // Save user message
    await saveMessages(withUser);

    try {
      // Stream response from Claude
      const streamingMessage: Message = {
        role: "companion",
        content: "",
        timestamp: new Date().toISOString(),
      };

      // Add empty companion message that we'll fill with streamed tokens
      setMessages([...withUser, streamingMessage]);

      const fullResponse = await streamCompanionResponse(
        withUser,
        checkinData,
        behavioralData,
        userFirstName || "friend",
        userCity,
        userMotivation,
        missionContext,
        (token) => {
          streamingMessage.content += token;
          setMessages([...withUser, { ...streamingMessage }]);
        }
      );

      // Strip [MISSION: ...] tag from display text and create mission
      const missionMatch = fullResponse.match(/\[MISSION:\s*(.+?)\]/);
      const displayResponse = fullResponse.replace(/\s*\[MISSION:\s*.+?\]/, "").trim();

      const companionMessage: Message = {
        role: "companion",
        content: displayResponse,
        timestamp: new Date().toISOString(),
      };

      const withResponse = [...withUser, companionMessage];
      setMessages(withResponse);
      setIsTyping(false);

      // Auto-create mission suggested by coach
      if (missionMatch) {
        const missionTitle = missionMatch[1].trim();
        try {
          const missionRes = await fetch("/api/missions/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: missionTitle, source: "coach" }),
          });
          if (missionRes.ok) {
            const newMission = await missionRes.json();
            setMissionContext((prev) => ({
              ...prev,
              active: { title: newMission.title, created_at: newMission.created_at },
            }));
          }
        } catch {
          // non-critical
        }
      }

      // Save with companion response
      await saveMessages(withResponse);
    } catch {
      setIsTyping(false);
      // Remove the streaming message on error
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

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-cream">
        {/* Skeleton header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-navy/8">
          <div className="skeleton w-8 h-8 rounded-full" />
          <div className="skeleton w-9 h-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-3 w-32" />
          </div>
        </div>
        {/* Skeleton messages */}
        <div className="flex-1 px-4 pt-6 space-y-4">
          <div className="flex items-end gap-2.5">
            <div className="skeleton w-8 h-8 rounded-full shrink-0" />
            <div className="skeleton h-16 w-3/4 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-navy/8">
        <button
          onClick={() => router.back()}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-navy/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-coral to-coral-hover flex items-center justify-center">
          <span className="text-white text-sm">⚡</span>
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-navy leading-tight">
            Your Coach
          </h1>
          <p className="text-xs text-navy/40">Always in your corner</p>
        </div>
        {conversationCount > 0 && (
          <div className="bg-coral/10 text-coral text-xs font-semibold px-2.5 py-1 rounded-full">
            {conversationCount}
          </div>
        )}
        <button
          onClick={startNewConversation}
          disabled={isTyping}
          className="p-2 -mr-1 rounded-lg hover:bg-navy/5 transition-colors disabled:opacity-30"
          aria-label="New conversation"
        >
          <SquarePen className="w-5 h-5 text-navy/60" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mb-3 bg-cream-dark/80 border border-navy/10 rounded-2xl p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-navy/60">{error}</p>
          <button
            onClick={() => handleSend(lastUserInputRef.current)}
            className="text-sm font-semibold text-coral hover:text-coral-hover transition-colors px-4 py-2 bg-white rounded-xl border border-navy/10 shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      {/* Pattern Card */}
      {patternCard && (
        <PatternCardComponent
          card={patternCard}
          onAccept={() => handlePatternAction("accept")}
          onDismiss={() => handlePatternAction("dismiss")}
          onDiscuss={() => handlePatternAction("discuss")}
        />
      )}

      {/* Input area — fixed to bottom */}
      <div className="border-t border-navy/8 bg-white px-4 py-3 pb-safe">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind..."
            rows={1}
            className="flex-1 bg-cream-dark/60 text-navy placeholder:text-navy/30 rounded-2xl px-4 py-3 text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-coral/30 transition-all max-h-[120px]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="min-w-[44px] min-h-[44px] p-3 bg-coral rounded-full text-white transition-all hover:bg-coral-hover active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-navy/25 text-center mt-2">
          Just between us. Nothing leaves this chat.
        </p>
      </div>
    </div>
  );
}
