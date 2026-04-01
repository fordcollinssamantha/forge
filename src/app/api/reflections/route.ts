import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId, predictionScore, actualScore, notes, ratingTier, whatWentWell, whatWasAwkward, nextTime } = await request.json();

  const supabase = getSupabaseAdmin();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Save the reflection
  const { data: reflection, error } = await supabase
    .from("reflections")
    .insert({
      user_id: user.id,
      event_id: eventId || null,
      prediction_score: predictionScore,
      actual_score: actualScore,
      notes: notes || null,
      rating_tier: ratingTier || null,
      what_went_well: whatWentWell || null,
      what_was_awkward: whatWasAwkward || null,
      next_time: nextTime || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to save reflection:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  // Award points for post-game review (real-world action = most valuable)
  await supabase.from("score_events").insert({
    user_id: user.id,
    action_type: "post_game_review",
    points: 10,
    reference_id: reflection.id,
  });

  return NextResponse.json({ success: true, points: 10 });
}
