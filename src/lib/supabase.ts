import { createClient, SupabaseClient } from '@supabase/supabase-js';

// For Vite dev: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
// For Parcel/production: these are replaced at build time or set via window.__SUPABASE_CONFIG__
declare global {
  interface Window {
    __SUPABASE_CONFIG__?: { url: string; anonKey: string };
  }
}

function getConfig(): { url: string; anonKey: string } | null {
  // 1. Check window config (for production HTML)
  if (typeof window !== 'undefined' && window.__SUPABASE_CONFIG__) {
    return window.__SUPABASE_CONFIG__;
  }
  // 2. Check Vite env
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (url && key) return { url, anonKey: key };
  } catch {}
  // 3. Check process.env (Parcel)
  try {
    const url = (globalThis as any).process?.env?.VITE_SUPABASE_URL;
    const key = (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY;
    if (url && key) return { url, anonKey: key };
  } catch {}
  return null;
}

const config = getConfig();

export const supabase: SupabaseClient | null = config
  ? createClient(config.url, config.anonKey)
  : null;

if (!supabase) {
  console.info('Supabase not configured. "Add a rate" is disabled. To enable, set your Supabase credentials.');
}

export type ManualRate = {
  id: string;
  country: string;
  city: string;
  type: string;
  detail: string;
  vehicle: string;
  rate: number;
  currency: string;
  month: string;
  po: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
};
