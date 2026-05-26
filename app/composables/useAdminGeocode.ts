import { useSupabaseClient } from "./useSupabaseClient"

export type GeocodedAddress = {
  latitude: number
  longitude: number
  radius_meters: number
}

export function useAdminGeocode(slug: string) {
  async function geocodeAddress(address: string): Promise<GeocodedAddress> {
    const query = address.trim()

    if (query.length < 5) {
      throw new Error("Saisissez une adresse complète (au moins 5 caractères).")
    }

    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      throw new Error("Connexion requise pour géocoder l’adresse.")
    }

    return await $fetch<GeocodedAddress>("/api/admin/geocode", {
      query: { slug, address: query },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  return { geocodeAddress }
}
