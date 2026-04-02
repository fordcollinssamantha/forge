import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { first_name, age, city, is_custom_city, motivation } = await request.json();

  if (!first_name || !age || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsertData: any = {
    clerk_id: userId,
    first_name,
    age,
    city,
    city_normalized: is_custom_city ? null : city,
    ...(motivation ? { motivation } : {}),
  };

  const { error } = await supabaseAdmin.from("users").upsert(
    upsertData,
    { onConflict: "clerk_id" }
  );

  if (error) {
    console.error("Supabase insert error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      { error: "Failed to save profile", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
