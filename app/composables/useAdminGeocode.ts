import { getAdminUi } from "../data/admin-ui"
import { useHostivLocale } from "./useHostivLocale"
import { useSupabaseClient } from "./useSupabaseClient"

export type GeocodedAddress = {
  latitude: number
  longitude: number
  radius_meters: number
}

export function useAdminGeocode(slug: string) {
  const { locale } = useHostivLocale()
  const locationLabels = computed(() => getAdminUi(locale.value).extended.location)

  async function geocodeAddress(address: string): Promise<GeocodedAddress> {
    const query = address.trim()

    if (query.length < 5) {
      throw new Error(locationLabels.value.geocodeAddressTooShort)
    }

    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
      throw new Error(locationLabels.value.geocodeAuthRequired)
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
