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

  const { data: completions } = await supabase
    .from("skill_completions")
    .select("module_id, lesson_id")
    .eq("user_id", user.id);

  // Group by module
  const grouped: Record<string, string[]> = {};
  if (completions) {
    for (const c of completions) {
      if (!grouped[c.module_id]) grouped[c.module_id] = [];
      grouped[c.module_id].push(c.lesson_id);
    }
  }

  return NextResponse.json({ completions: grouped });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleId, lessonId } = await request.json();

  if (!moduleId || !lessonId) {
    return NextResponse.json(
      { error: "moduleId and lessonId required" },
      { status: 400 }
    );
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

  // Upsert — idempotent completion
  const { error } = await supabase.from("skill_completions").upsert(
    {
      user_id: user.id,
      module_id: moduleId,
      lesson_id: lessonId,
    },
    { onConflict: "user_id,module_id,lesson_id" }
  );

  if (error) {
    console.error("Failed to save skill completion:", error);
    return NextResponse.json(
      { error: "Failed to save completion" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
