import { NextResponse } from "next/server";
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
    .select("id, first_name, age, city")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found", needsOnboarding: true }, { status: 404 });
  }

  // Fetch all data in parallel
  const [pointsRes, checkinRes, conversationRes, skillRes, reflectionRes, activeMissionRes, missionsCountRes] =
    await Promise.all([
      supabase
        .from("score_events")
        .select("action_type, points, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("checkins")
        .select("id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("conversations")
        .select("id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("skill_completions")
        .select("lesson_id, completed_at")
        .eq("user_id", user.id),
      supabase
        .from("reflections")
        .select("id, actual_score, rating_tier, notes, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("missions")
        .select("id, title, description, source, status, created_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("missions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

  // Total points
  let totalPoints = 0;
  if (pointsRes.data) {
    for (const e of pointsRes.data) totalPoints += e.points;
  }

  // Lessons completed
  const lessonsCompleted = skillRes.data?.length ?? 0;

  // Streak: count consecutive days with a check-in or conversation
  const activityDates = new Set<string>();
  for (const c of checkinRes.data ?? []) {
    activityDates.add(new Date(c.created_at).toISOString().split("T")[0]);
  }
  for (const c of conversationRes.data ?? []) {
    activityDates.add(new Date(c.created_at).toISOString().split("T")[0]);
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (activityDates.has(key)) {
      streak++;
    } else if (i === 0) {
      // Today hasn't had activity yet — don't break, check yesterday
      continue;
    } else {
      break;
    }
  }

  // Weekly progress data for chart (last 8 weeks)
  const weeklyProgress: { week: string; points: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekLabel = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    let weekPts = 0;
    for (const e of pointsRes.data ?? []) {
      const d = new Date(e.created_at);
      if (d >= weekStart && d < weekEnd) weekPts += e.points;
    }
    weeklyProgress.push({ week: weekLabel, points: weekPts });
  }

  // Recent reflection
  const recentReflection = reflectionRes.data?.[0] ?? null;

  const hasCheckin = (checkinRes.data?.length ?? 0) > 0;

  const activeMission = activeMissionRes.data?.[0] ?? null;
  const missionsCompleted = missionsCountRes.count ?? 0;

  return NextResponse.json({
    firstName: user.first_name,
    totalPoints,
    lessonsCompleted,
    streak,
    weeklyProgress,
    recentReflection,
    hasCheckin,
    activeMission,
    missionsCompleted,
  });
}
