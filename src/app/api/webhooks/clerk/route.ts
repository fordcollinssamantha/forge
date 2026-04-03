import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

interface ClerkUserEvent {
  data: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email_addresses?: Array<{ email_address: string }>;
  };
  type: string;
}

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify the webhook signature with svix
  const headerPayload = Object.fromEntries(request.headers);
  const svixId = headerPayload["svix-id"];
  const svixTimestamp = headerPayload["svix-timestamp"];
  const svixSignature = headerPayload["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await request.text();

  let event: ClerkUserEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const { id: clerkId, first_name } = event.data;

    const supabase = getSupabaseAdmin();

    // Insert a stub row — onboarding will upsert the full profile later.
    // If the user already exists (e.g. race condition), do nothing.
    const { error } = await supabase.from("users").upsert(
      {
        clerk_id: clerkId,
        first_name: first_name ?? null,
      },
      { onConflict: "clerk_id", ignoreDuplicates: true }
    );

    if (error) {
      console.error("Webhook: failed to insert user", error);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }
  }

  if (event.type === "user.deleted") {
    const clerkId = event.data.id;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("clerk_id", clerkId);

    if (error) {
      console.error("Webhook: failed to delete user", error);
    }
  }

  return NextResponse.json({ success: true });
}
