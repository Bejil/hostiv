export const ADMIN_PRESET_PLATFORMS = [
  {
    id: "airbnb",
    label: "Airbnb",
    defaultName: "Airbnb",
    defaultLogo: "/platforms/airbnb.png"
  },
  {
    id: "booking",
    label: "Booking",
    defaultName: "Booking.com",
    defaultLogo: "/platforms/booking.png"
  },
  {
    id: "abritel",
    label: "Abritel",
    defaultName: "Abritel",
    defaultLogo: "/platforms/abritel.png"
  }
] as const

export type AdminPresetPlatformId = (typeof ADMIN_PRESET_PLATFORMS)[number]["id"]

const presetIdSet = new Set<string>(ADMIN_PRESET_PLATFORMS.map((item) => item.id))

export function isPresetPlatformId(id: string): id is AdminPresetPlatformId {
  return presetIdSet.has(id)
}

export function getPresetPlatform(id: string) {
  return ADMIN_PRESET_PLATFORMS.find((item) => item.id === id)
}
