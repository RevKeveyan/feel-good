import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.warn("[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
} else {
  try {
    const parsed = new URL(url);
    console.log(`[Supabase] host=${parsed.host}`);
  } catch {
    console.warn("[Supabase] EXPO_PUBLIC_SUPABASE_URL is not a valid URL");
  }
}

export const supabase = createClient(url ?? "", key ?? "", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
