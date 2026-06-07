import { createClient, SupabaseClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'brightpath_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  // First check environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  // Then check localStorage
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }

  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  if (!supabaseInstance) {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseInstance;
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

export function isConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
