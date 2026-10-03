import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window { __SUPABASE_CONFIG__?: { url: string; anonKey: string } }
}

function getConfig(): { url: string; anonKey: string } | null {
  if (typeof window !== 'undefined' && window.__SUPABASE_CONFIG__) return window.__SUPABASE_CONFIG__;
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (url && key) return { url, anonKey: key };
  } catch {}
  try {
    const url = (globalThis as any).process?.env?.VITE_SUPABASE_URL;
    const key = (globalThis as any).process?.env?.VITE_SUPABASE_ANON_KEY;
    if (url && key) return { url, anonKey: key };
  } catch {}
  return null;
}

const config = getConfig();
export const supabase: SupabaseClient | null = config ? createClient(config.url, config.anonKey) : null;

export type ManualRate = {
  id: string; country: string; city: string; type: string; detail: string;
  vehicle: string; rate: number; currency: string; month: string;
  po: string | null; note: string | null; created_by: string | null;
  created_at: string; status: string; added_by: string | null;
};

export type DbVehicle = { id: string; name: string; class: string };
export type DbCity = { id: string; country: string; city: string; currency: string };
