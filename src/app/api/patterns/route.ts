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

  // Only surface pattern cards after 3+ conversations
  const { count: conversationCount } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!conversationCount || conversationCount < 3) {
    return NextResponse.json({ card: null });
  }

  // Get active pattern cards (pending/shown, not recently dismissed)
  const { data: cards } = await supabase
    .from("pattern_cards")
    .select("*")
    .eq("user_id", user.id)
    .in("state", ["pending", "shown"])
    .order("detection_count", { ascending: false })
    .limit(1);

  // Also check for dismissed cards that have expired (14 days)
  const fourteenDaysAgo = new Date(
    Date.now() - 14 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Re-activate dismissed cards older than 14 days
  await supabase
    .from("pattern_cards")
    .update({ state: "pending", dismissed_at: null })
    .eq("user_id", user.id)
    .eq("state", "dismissed")
    .lt("dismissed_at", fourteenDaysAgo);

  let activeCard = cards && cards.length > 0 ? cards[0] : null;

  // If no pending/shown card, check if we just reactivated one
  if (!activeCard) {
    const { data: reactivated } = await supabase
      .from("pattern_cards")
      .select("*")
      .eq("user_id", user.id)
      .eq("state", "pending")
      .order("detection_count", { ascending: false })
      .limit(1);

    activeCard = reactivated && reactivated.length > 0 ? reactivated[0] : null;
  }

  // Mark as shown if pending
  if (activeCard && activeCard.state === "pending") {
    await supabase
      .from("pattern_cards")
      .update({ state: "shown", shown_at: new Date().toISOString() })
      .eq("id", activeCard.id);
    activeCard.state = "shown";
  }

  return NextResponse.json({ card: activeCard });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId, action } = await request.json();

  if (!cardId || !["accept", "dismiss", "discuss"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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

  const now = new Date().toISOString();
  const updates: Record<string, string> = { updated_at: now };

  switch (action) {
    case "accept":
      updates.state = "accepted";
      updates.accepted_at = now;
      break;
    case "dismiss":
      updates.state = "dismissed";
      updates.dismissed_at = now;
      break;
    case "discuss":
      updates.state = "discussed";
      updates.discussed_at = now;
      break;
  }

  const { error } = await supabase
    .from("pattern_cards")
    .update(updates)
    .eq("id", cardId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
