import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

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

  if (mission.status !== "active") {
    return NextResponse.json({ error: "Mission is not active" }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("missions")
    .update({
      status: "skipped",
      completed_at: new Date().toISOString(),
      points_awarded: 0,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to skip mission:", error);
    return NextResponse.json({ error: "Failed to skip mission" }, { status: 500 });
  }

  return NextResponse.json(updated);
}
