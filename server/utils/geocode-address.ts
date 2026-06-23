const BAN_SEARCH_URL = "https://api-adresse.data.gouv.fr/search/"
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
const NOMINATIM_USER_AGENT = "TheGrandAppartement/1.0"
const BAN_MIN_SCORE = 0.5

type BanSearchResponse = {
  features?: Array<{
    geometry?: { coordinates?: [number, number] }
    properties?: {
      score?: number
      type?: string
    }
  }>
}

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

function banTypeToRadiusMeters(type: string | undefined): number {
  switch (type) {
    case "housenumber":
      return 200
    case "street":
      return 350
    case "locality":
    case "municipality":
      return 500
    default:
      return 400
  }
}

async function geocodeWithBan(address: string): Promise<GeocodedAddress | null> {
  const response = await $fetch<BanSearchResponse>(BAN_SEARCH_URL, {
    query: {
      q: address,
      limit: 1
    }
  })

  const feature = response.features?.[0]
  const coordinates = feature?.geometry?.coordinates
  const score = feature?.properties?.score ?? 0

  if (!coordinates || score < BAN_MIN_SCORE) {
    return null
  }

  const [longitude, latitude] = coordinates

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return {
    latitude,
    longitude,
    radius_meters: banTypeToRadiusMeters(feature?.properties?.type)
  }
}

async function geocodeWithNominatim(address: string): Promise<GeocodedAddress | null> {
  const results = await $fetch<NominatimSearchResult[]>(NOMINATIM_SEARCH_URL, {
    query: {
      format: "json",
      q: address,
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

export async function geocodeAddressQuery(address: string): Promise<GeocodedAddress | null> {
  const query = address.trim()

  if (query.length < 5) {
    return null
  }

  const banResult = await geocodeWithBan(query)

  if (banResult) {
    return banResult
  }

  return geocodeWithNominatim(query)
}
