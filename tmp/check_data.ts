import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Manually load .env.local if not already loaded (useful for standalone scripts)
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return;

      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
          console.log(`Loaded ${key}`);
        }
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log("Checking Event Info...");
  const { data: event, error: eventError } = await supabase
    .from("event_info")
    .select("*")
    .eq("event_slug", "kylo-rey")
    .single();

  if (eventError) {
    console.error("Event Error:", eventError.message);
  } else {
    console.log("Found Event:", event.id, event.event_slug);
  }

  console.log("\nChecking Guest Info...");
  if (event) {
    const { data: guest, error: guestError } = await supabase
      .from("guests")
      .select("*")
      .eq("slug", "budi-partner")
      .eq("event_id", event.id)
      .single();

    if (guestError) {
      console.error("Guest Error:", guestError.message);
    } else {
      console.log("Found Guest:", guest.id, guest.name);
    }
  }
}

checkData();
