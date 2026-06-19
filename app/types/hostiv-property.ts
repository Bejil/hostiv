export type HostivAccessiblePropertyRole = "owner" | "cohost"

export type HostivAccessibleProperty = {
  slug: string
  brand_name: string
  published: boolean
  role: HostivAccessiblePropertyRole
  subscription_plan: string
  subscription_active: boolean
}

export type HostivPropertiesPayload = {
  properties: HostivAccessibleProperty[]
}
