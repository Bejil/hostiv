export function buildLocationMapBoundingBox(lat: number, lon: number) {
  const latDelta = 0.006
  const lonDelta = 0.009 / Math.cos((lat * Math.PI) / 180)

  return {
    west: lon - lonDelta,
    south: lat - latDelta,
    east: lon + lonDelta,
    north: lat + latDelta
  }
}

export function buildOpenStreetMapEmbedUrl(lat: number, lon: number) {
  const { west, south, east, north } = buildLocationMapBoundingBox(lat, lon)
  const marker = `${lat}%2C${lon}`

  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${marker}`
}

export function buildOpenStreetMapExternalUrl(lat: number, lon: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`
}

export function createCircleGeoJson(lat: number, lon: number, radiusMeters: number, points = 64) {
  const coordinates: [number, number][] = []
  const earthRadius = 6_378_137
  const latRad = (lat * Math.PI) / 180

  for (let index = 0; index <= points; index += 1) {
    const angle = (index / points) * 2 * Math.PI
    const dx = radiusMeters * Math.cos(angle)
    const dy = radiusMeters * Math.sin(angle)
    const pointLat = lat + (dy / earthRadius) * (180 / Math.PI)
    const pointLon = lon + (dx / (earthRadius * Math.cos(latRad))) * (180 / Math.PI)

    coordinates.push([pointLon, pointLat])
  }

  return {
    type: "Feature" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [coordinates]
    },
    properties: {}
  }
}

export function boundsFromCircle(lat: number, lon: number, radiusMeters: number) {
  const earthRadius = 6_378_137
  const latRad = (lat * Math.PI) / 180
  const latDelta = (radiusMeters / earthRadius) * (180 / Math.PI)
  const lonDelta = (radiusMeters / (earthRadius * Math.cos(latRad))) * (180 / Math.PI)

  return {
    west: lon - lonDelta,
    south: lat - latDelta,
    east: lon + lonDelta,
    north: lat + latDelta
  }
}
