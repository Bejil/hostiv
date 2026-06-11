import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type {
  BookingReservationInsert,
  BookingReservationRow,
  BookingReservationUpdate
} from "../../app/types/booking-reservation"
import type { PropertySiteRow } from "../../app/types/property-site"

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: PropertySiteRow
        Insert: PropertySiteRow
        Update: Partial<PropertySiteRow>
      }
      booking_reservations: {
        Row: BookingReservationRow
        Insert: BookingReservationInsert
        Update: BookingReservationUpdate
      }
    }
  }
}

let adminClient: SupabaseClient<Database> | null = null

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) {
    return null
  }

  const url = process.env.SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!adminClient) {
    adminClient = createClient<Database>(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  }

  return adminClient
}

/** Client Supabase obligatoire pour les sites par slug (pas de fallback local). */
export function requireSupabaseAdmin() {
  const client = getSupabaseAdmin()

  if (!client) {
    throw createError({
      statusCode: 503,
      message:
        "Supabase non configuré : définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env"
    })
  }

  return client
}
