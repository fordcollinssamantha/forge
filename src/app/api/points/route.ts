import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: events } = await supabase
    .from("score_events")
    .select("action_type, points, reference_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const breakdown = { checkin: 0, companion_chat: 0, skill_card: 0, practice: 0, going_solo: 0, post_game_review: 0 };
  let total = 0;

  if (events) {
    for (const e of events) {
      total += e.points;
      if (e.action_type in breakdown) {
        breakdown[e.action_type as keyof typeof breakdown] += e.points;
      }
    }
  }

  const ACTION_LABELS: Record<string, string> = {
    checkin: "Checked in",
    companion_chat: "Talked to Coach",
    skill_card: "Skill explored",
    practice: "Practiced",
    going_solo: "Went solo",
    post_game_review: "Post-game review",
  };

  const recentActions = (events || [])
    .slice(0, 3)
    .map((e) => {
      const label = ACTION_LABELS[e.action_type] || e.action_type;
      return e.reference_id ? `${label}: ${e.reference_id}` : label;
    });

  return NextResponse.json({ total, breakdown, recentActions });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { actionType, referenceId } = await request.json();

  const POINT_VALUES: Record<string, number> = {
    checkin: 2,
    companion_chat: 3,
    skill_card: 3,
    practice: 5,
    going_solo: 5,
    post_game_review: 10,
  };

  const points = POINT_VALUES[actionType];
  if (!points) {
    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // For skill_card, use upsert to prevent duplicate awards
  if (actionType === "skill_card" && referenceId) {
    const { error } = await supabase.from("score_events").upsert(
      {
        user_id: user.id,
        action_type: actionType,
        points,
        reference_id: referenceId,
      },
      { onConflict: "user_id,action_type,reference_id" }
    );

    if (error) {
      console.error("Failed to award points:", error);
      return NextResponse.json({ error: "Failed to award points" }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("score_events").insert({
      user_id: user.id,
      action_type: actionType,
      points,
      reference_id: referenceId || null,
    });

    if (error) {
      console.error("Failed to award points:", error);
      return NextResponse.json({ error: "Failed to award points" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, points });
}
