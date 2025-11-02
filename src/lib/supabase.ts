import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Log to verify environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase environment variables are missing!");
  console.error("VITE_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing");
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Set" : "✗ Missing");
  console.error("Make sure .env.local exists and restart the dev server!");
} else {
  console.log("✅ Supabase configured:", supabaseUrl);
}

// Create client with explicit storage configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase-auth-token',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
});
