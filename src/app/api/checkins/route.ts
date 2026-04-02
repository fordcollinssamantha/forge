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
    return NextResponse.json({ isReturning: false });
  }

  const { count } = await supabase
    .from("checkins")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return NextResponse.json({ isReturning: (count ?? 0) > 0 });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { avoidance_response, follow_up_response, emoji, emojis, emotion_words, verbal_description } =
    await request.json();

  if ((!emoji && !emojis?.length) || !emotion_words?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Look up the user's internal ID from their Clerk ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, tutorial_completed")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    console.error("User lookup failed:", { userId, userError });
    return NextResponse.json(
      { error: "User not found", detail: userError?.message },
      { status: 404 }
    );
  }

  // Insert behavioral check-in only on first visit (when avoidance data is provided)
  // Return visits skip steps 0+1 and don't send behavioral data
  const hasBehavioral = avoidance_response || follow_up_response;

  const checkinPromise = supabase.from("checkins").insert({
    user_id: user.id,
    emoji: emoji || (emojis ? emojis[0] : null),
    emojis: emojis || (emoji ? [emoji] : []),
    emotion_words,
    verbal_description: verbal_description || null,
  });

  if (hasBehavioral) {
    const behavioralResult = await supabase.from("behavioral_checkins").insert({
      user_id: user.id,
      avoidance_response: avoidance_response || "",
      follow_up_response: follow_up_response || "",
    });
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
  }

  const checkinResult = await checkinPromise;

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

  return NextResponse.json({ success: true, tutorial_completed: user.tutorial_completed ?? false });
}
