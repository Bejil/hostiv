import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

/** Client Supabase (anon) — navigateur uniquement, pour l’auth du backoffice. */
export function useSupabaseClient() {
  if (import.meta.server) {
    throw new Error("useSupabaseClient() est réservé au client.")
  }

  const config = useRuntimeConfig()

  const url = String(config.public.supabaseUrl || "").trim()
  const anonKey = String(config.public.supabaseAnonKey || "").trim()

  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL et SUPABASE_ANON_KEY sont requis.")
  }

  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }

  return browserClient
}
