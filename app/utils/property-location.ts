import type { PropertyLocation } from "../types/property-site"

export function hasValidPropertyLocationCoordinates(location: PropertyLocation): boolean {
  const latitude = Number(location.latitude)
  const longitude = Number(location.longitude)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return false
  }

  return !(latitude === 0 && longitude === 0)
}
