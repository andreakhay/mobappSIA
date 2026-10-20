// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return !string.includes("<") && (url.protocol === "http:" || url.protocol === "https:");
  } catch (_) {
    return false;
  }
}

let client = null;
if (isValidUrl(rawUrl) && rawKey && !rawKey.includes("<")) {
  try {
    client = createClient(rawUrl, rawKey);
  } catch (err) {
    console.warn("Failed to initialize Supabase client:", err.message);
  }
} else {
  console.warn("Supabase credentials not configured or placeholder detected. Falling back to local data.");
}

export const supabase = client;
export default supabase;
