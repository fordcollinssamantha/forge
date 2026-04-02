import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { reflection } = await request.json();

  const supabase = getSupabaseAdmin();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Verify the mission belongs to this user and is still active
  const { data: mission } = await supabase
    .from("missions")
    .select("id, status, user_id")
    .eq("id", id)
    .single();

  if (!mission) {
    return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  }

  if (mission.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (mission.status === "completed") {
    return NextResponse.json({ error: "Mission already completed" }, { status: 400 });
  }

  // 3 base points + 2 bonus if reflection provided
  const points = reflection ? 5 : 3;

  const { data: updated, error } = await supabase
    .from("missions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      reflection: reflection || null,
      points_awarded: points,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to complete mission:", error);
    return NextResponse.json({ error: "Failed to complete mission" }, { status: 500 });
  }

  // Also record in score_events for the points system
  await supabase.from("score_events").insert({
    user_id: user.id,
    action_type: "mission_complete",
    points,
    reference_id: id,
  });

  return NextResponse.json(updated);
}
