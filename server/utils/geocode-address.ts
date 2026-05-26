const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
const NOMINATIM_USER_AGENT = "TheGrandAppartement/1.0"

type NominatimSearchResult = {
  lat: string
  lon: string
  boundingbox?: [string, string, string, string]
}

export type GeocodedAddress = {
  latitude: number
  longitude: number
  radius_meters: number
}

function bboxToRadiusMeters(bbox: [string, string, string, string]): number {
  const south = Number(bbox[0])
  const north = Number(bbox[1])
  const west = Number(bbox[2])
  const east = Number(bbox[3])
  const latRad = (((north + south) / 2) * Math.PI) / 180
  const halfLatMeters = ((north - south) * 111_320) / 2
  const halfLonMeters = ((east - west) * 111_320 * Math.cos(latRad)) / 2
  const radius = Math.max(halfLatMeters, halfLonMeters, 200)

  return Math.min(800, Math.round(radius))
}

export async function geocodeAddressQuery(address: string): Promise<GeocodedAddress | null> {
  const query = address.trim()

  if (query.length < 5) {
    return null
  }

  const results = await $fetch<NominatimSearchResult[]>(NOMINATIM_SEARCH_URL, {
    query: {
      format: "json",
      q: query,
      limit: 1
    },
    headers: {
      "User-Agent": NOMINATIM_USER_AGENT
    }
  })

  const hit = results[0]

  if (!hit) {
    return null
  }

  const latitude = Number(hit.lat)
  const longitude = Number(hit.lon)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  const radius_meters = hit.boundingbox?.length === 4 ? bboxToRadiusMeters(hit.boundingbox) : 400

  return { latitude, longitude, radius_meters }
}
