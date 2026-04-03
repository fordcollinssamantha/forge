/**
 * One-time backfill: pull all existing Clerk users and insert stub rows
 * into the Supabase `users` table so they aren't orphaned.
 *
 * Usage:
 *   npx tsx scripts/backfill-clerk-users.ts
 *
 * Requires these env vars (already in your .env.local):
 *   CLERK_SECRET_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!CLERK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Make sure CLERK_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are set."
  );
  console.error("Hint: run with `npx dotenv -e .env.local -- npx tsx scripts/backfill-clerk-users.ts`");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ClerkUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface ClerkListResponse {
  data: ClerkUser[];
  total_count: number;
}

async function fetchAllClerkUsers(): Promise<ClerkUser[]> {
  const allUsers: ClerkUser[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Clerk API error: ${res.status} ${await res.text()}`);
    }

    const data: ClerkUser[] = await res.json();
    if (data.length === 0) break;

    allUsers.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }

  return allUsers;
}

async function main() {
  console.log("Fetching all users from Clerk...");
  const clerkUsers = await fetchAllClerkUsers();
  console.log(`Found ${clerkUsers.length} Clerk user(s).`);

  if (clerkUsers.length === 0) {
    console.log("Nothing to backfill.");
    return;
  }

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of clerkUsers) {
    const { error } = await supabase.from("users").upsert(
      {
        clerk_id: user.id,
        first_name: user.first_name ?? null,
      },
      { onConflict: "clerk_id", ignoreDuplicates: true }
    );

    if (error) {
      console.error(`  Failed to upsert ${user.id}: ${error.message}`);
      errors++;
    } else {
      // Check if this was a new insert or a skip
      const { data: existing } = await supabase
        .from("users")
        .select("clerk_id")
        .eq("clerk_id", user.id)
        .single();

      if (existing) {
        inserted++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`\nBackfill complete:`);
  console.log(`  Processed: ${clerkUsers.length}`);
  console.log(`  Inserted/existing: ${inserted}`);
  console.log(`  Errors: ${errors}`);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
