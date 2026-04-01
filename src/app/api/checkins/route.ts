import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { motivation, avoidance_response, follow_up_response, emoji, emotion_words, verbal_description } =
    await request.json();

  if (!emoji || !emotion_words?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Look up the user's internal ID from their Clerk ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    console.error("User lookup failed:", { userId, userError });
    return NextResponse.json(
      { error: "User not found", detail: userError?.message },
      { status: 404 }
    );
  }

  // Save motivation to user profile if provided
  if (motivation) {
    await supabase
      .from("users")
      .update({ motivation })
      .eq("id", user.id);
  }

  // Insert behavioral check-in and emotional check-in in parallel
  const [behavioralResult, checkinResult] = await Promise.all([
    supabase.from("behavioral_checkins").insert({
      user_id: user.id,
      avoidance_response: avoidance_response || motivation || "",
      follow_up_response: follow_up_response || motivation || "",
    }),
    supabase.from("checkins").insert({
      user_id: user.id,
      emoji,
      emotion_words,
      verbal_description: verbal_description || null,
    }),
  ]);

  if (behavioralResult.error) {
    console.error("Behavioral check-in error:", {
      message: behavioralResult.error.message,
      code: behavioralResult.error.code,
      details: behavioralResult.error.details,
      hint: behavioralResult.error.hint,
      user_id: user.id,
    });
    return NextResponse.json(
      { error: "Failed to save behavioral check-in", detail: behavioralResult.error.message },
      { status: 500 }
    );
  }

  if (checkinResult.error) {
    console.error("Check-in error:", {
      message: checkinResult.error.message,
      code: checkinResult.error.code,
      details: checkinResult.error.details,
      hint: checkinResult.error.hint,
      user_id: user.id,
    });
    return NextResponse.json(
      { error: "Failed to save check-in", detail: checkinResult.error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
