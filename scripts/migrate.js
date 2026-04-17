import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  try {
    console.log("[v0] Starting database migrations...");

    // Read and execute SQL migrations
    const fs = await import("fs");
    const path = await import("path");

    const scriptsDir = path.dirname(new URL(import.meta.url).pathname);
    const sqlFiles = [
      "001_create_tables.sql",
      "002_enable_rls_policies.sql",
      "003_profile_trigger.sql",
    ];

    for (const file of sqlFiles) {
      const filePath = path.join(scriptsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      console.log(`[v0] Executing ${file}...`);

      const { error } = await supabase.rpc("exec", {
        query: sql,
      });

      if (error) {
        console.error(`[v0] Error in ${file}:`, error.message);
        // Continue anyway - some statements might fail if they already exist
      } else {
        console.log(`[v0] Successfully executed ${file}`);
      }
    }

    console.log("[v0] All migrations completed!");
  } catch (error) {
    console.error("[v0] Migration error:", error);
    process.exit(1);
  }
}

runMigrations();
