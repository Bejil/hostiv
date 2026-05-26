export type AmenityItem = {
  id: string
  icon: string
  name: string
  description?: string
}

export type AmenitySection = {
  id: string
  title: string
  items: AmenityItem[]
}

export type AmenityPreviewSection = AmenitySection & {
  hasMore: boolean
}
