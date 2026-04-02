import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, source } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Missing required field: title" }, { status: 400 });
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

  // Prevent creating a second active mission
  const { data: existing } = await supabase
    .from("missions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "You already have an active mission. Complete or skip it first." },
      { status: 409 }
    );
  }

  const { data: mission, error } = await supabase
    .from("missions")
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      source: source || "suggested",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create mission:", error);
    return NextResponse.json({ error: "Failed to create mission" }, { status: 500 });
  }

  return NextResponse.json(mission);
}
