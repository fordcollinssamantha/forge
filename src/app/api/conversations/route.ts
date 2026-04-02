import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  analyzePatterns,
  getPatternMessage,
  PatternResult,
} from "@/lib/pattern-analysis";
import { summarizeConversation } from "@/lib/conversation-summary";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, first_name, city, motivation")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    // New user who hasn't completed onboarding yet — return empty defaults
    return NextResponse.json({
      user: null,
      behavioral: null,
      checkin: null,
      conversation: null,
      conversationCount: 0,
      activePatternType: null,
      missions: { active: undefined, recent: undefined },
    });
  }

  // Get latest check-in data for the opening message
  const [behavioralResult, checkinResult, conversationResult, activeMissionResult, recentMissionsResult] = await Promise.all([
    supabase
      .from("behavioral_checkins")
      .select("avoidance_response, follow_up_response")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("checkins")
      .select("emoji, emojis, emotion_words")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("conversations")
      .select("id, messages, summary, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("missions")
      .select("title, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("missions")
      .select("title, reflection, completed_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(3),
  ]);

  // Count total conversations for the badge
  const { count } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get active pattern card type for opening message variation
  const { data: activePattern } = await supabase
    .from("pattern_cards")
    .select("pattern_type")
    .eq("user_id", user.id)
    .in("state", ["pending", "shown"])
    .limit(1)
    .single();

  return NextResponse.json({
    user: { id: user.id, first_name: user.first_name, city: user.city, motivation: user.motivation },
    behavioral: behavioralResult.data,
    checkin: checkinResult.data,
    conversation: conversationResult.data,
    conversationCount: count || 0,
    activePatternType: activePattern?.pattern_type || null,
    missions: {
      active: activeMissionResult.data || undefined,
      recent: recentMissionsResult.data || undefined,
    },
  });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, messages } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, total_conversations, first_conversation_date, last_conversation_date, dependency_signals")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Calculate conversation metrics
  const userMessages = messages.filter((m: { role: string }) => m.role === "user");
  const messageCount = messages.length;
  const timestamps = messages
    .filter((m: { timestamp?: string }) => m.timestamp)
    .map((m: { timestamp: string }) => new Date(m.timestamp).getTime());
  const sessionDurationMs = timestamps.length >= 2
    ? Math.max(...timestamps) - Math.min(...timestamps)
    : 0;
  const sessionDurationSeconds = Math.floor(sessionDurationMs / 1000);
  const userInitiated = messages.length > 0 && messages[0].role === "user";

  let resultConversationId = conversationId;

  if (conversationId) {
    // Update existing conversation
    const { error } = await supabase
      .from("conversations")
      .update({
        messages,
        message_count: messageCount,
        session_duration: `${sessionDurationSeconds} seconds`,
        user_initiated: userInitiated,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Update conversation error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
  } else {
    // Create new conversation
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        messages,
        message_count: messageCount,
        session_duration: `${sessionDurationSeconds} seconds`,
        user_initiated: userInitiated,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Create conversation error:", error);
      return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }

    resultConversationId = data.id;

    // Update user-level anti-dependency metrics on new conversation
    await updateUserMetrics(supabase, user);
  }

  // Generate conversation summary in background (need at least 1 user message)
  if (userMessages.length >= 1) {
    generateSummary(supabase, resultConversationId, messages).catch((err) =>
      console.error("[summary] Error:", err)
    );
  }

  // Run pattern detection in the background (don't block the response)
  // Only analyze if there are user messages worth analyzing
  if (userMessages.length >= 2) {
    runPatternDetection(
      supabase,
      resultConversationId,
      user.id,
      userMessages.map((m: { content: string }) => m.content)
    ).catch((err) => console.error("[patterns] Top-level catch:", err));
  }

  return NextResponse.json({ success: true, conversationId: resultConversationId });
}

async function generateSummary(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  conversationId: string,
  messages: { role: string; content: string }[]
) {
  const summary = await summarizeConversation(messages);
  if (summary) {
    await supabase
      .from("conversations")
      .update({ summary })
      .eq("id", conversationId);
  }
}

async function runPatternDetection(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  conversationId: string,
  userId: string,
  userMessageTexts: string[]
) {
  let patterns: PatternResult;
  try {
    patterns = await analyzePatterns(userMessageTexts);
  } catch (err) {
    console.error("[patterns] analyzePatterns threw:", err);
    return;
  }

  // Filter to patterns with confidence >= 0.7
  const significant: Record<string, number> = {};
  for (const [key, score] of Object.entries(patterns)) {
    if (score >= 0.7) {
      significant[key] = score;
    }
  }

  if (Object.keys(significant).length > 0) {
    await supabase
      .from("conversations")
      .update({ patterns_detected: significant })
      .eq("id", conversationId);
  }

  // Check if any pattern has been detected 3+ times across conversations
  const { data: recentConversations } = await supabase
    .from("conversations")
    .select("patterns_detected")
    .eq("user_id", userId)
    .not("patterns_detected", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!recentConversations || recentConversations.length === 0) return;

  // Count detections per pattern type
  const patternCounts: Record<string, number> = {};
  for (const conv of recentConversations) {
    if (conv.patterns_detected && typeof conv.patterns_detected === "object") {
      for (const key of Object.keys(conv.patterns_detected as Record<string, number>)) {
        patternCounts[key] = (patternCounts[key] || 0) + 1;
      }
    }
  }

  // Create pattern cards for patterns detected 3+ times
  for (const [patternType, count] of Object.entries(patternCounts)) {
    if (count >= 3) {
      // Check if card already exists for this pattern
      const { data: existing } = await supabase
        .from("pattern_cards")
        .select("id, state, dismissed_at, detection_count")
        .eq("user_id", userId)
        .eq("pattern_type", patternType)
        .single();

      if (existing) {
        // Update detection count
        await supabase
          .from("pattern_cards")
          .update({
            detection_count: count,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // Create new pattern card
        await supabase.from("pattern_cards").insert({
          user_id: userId,
          pattern_type: patternType,
          pattern_message: getPatternMessage(patternType),
          detection_count: count,
          state: "pending",
        });
      }
    }
  }
}

async function updateUserMetrics(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  user: {
    id: string;
    total_conversations: number | null;
    first_conversation_date: string | null;
    last_conversation_date: string | null;
    dependency_signals: Record<string, number> | null;
  }
) {
  const now = new Date().toISOString();
  const totalConversations = (user.total_conversations || 0) + 1;
  const firstDate = user.first_conversation_date || now;

  // Calculate dependency signals
  const signals = user.dependency_signals || {
    conversations_per_week: 0,
    longest_gap_hours: 0,
    streak_count: 0,
  };

  // Get all conversation dates for this user to compute rolling metrics
  const { data: convDates } = await supabase
    .from("conversations")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (convDates && convDates.length > 0) {
    // Conversations per week (rolling average)
    const firstConv = new Date(convDates[0].created_at);
    const weeksSinceFirst = Math.max(
      1,
      (Date.now() - firstConv.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    signals.conversations_per_week =
      Math.round((convDates.length / weeksSinceFirst) * 10) / 10;

    // Longest gap between conversations (in hours)
    let longestGap = 0;
    for (let i = 1; i < convDates.length; i++) {
      const gap =
        new Date(convDates[i].created_at).getTime() -
        new Date(convDates[i - 1].created_at).getTime();
      if (gap > longestGap) longestGap = gap;
    }
    signals.longest_gap_hours = Math.round(longestGap / (60 * 60 * 1000));

    // Streak count (consecutive days with conversations)
    const uniqueDays = new Set(
      convDates.map((c) =>
        new Date(c.created_at).toISOString().split("T")[0]
      )
    );
    const sortedDays = [...uniqueDays].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let checkDate = new Date(today);
    for (const day of sortedDays) {
      const dayStr = checkDate.toISOString().split("T")[0];
      if (day === dayStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    signals.streak_count = streak;
  }

  await supabase
    .from("users")
    .update({
      total_conversations: totalConversations,
      first_conversation_date: firstDate,
      last_conversation_date: now,
      dependency_signals: signals,
    })
    .eq("id", user.id);
}
