import type { HostivPropertiesPayload } from "../types/hostiv-property"
import { useSupabaseClient } from "./useSupabaseClient"

export function useHostivProperties() {
  const properties = ref<HostivPropertiesPayload["properties"]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function authHeaders(): Promise<Record<string, string>> {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function fetchProperties() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<HostivPropertiesPayload>("/api/hostiv/properties", {
        headers: await authHeaders()
      })

      properties.value = response.properties
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string }

      error.value = e.data?.message || e.message || "Impossible de charger vos sites."
      properties.value = []
    } finally {
      loading.value = false
    }
  }

  const hasMultipleProperties = computed(() => properties.value.length > 1)

  return {
    properties,
    loading,
    error,
    hasMultipleProperties,
    fetchProperties
  }
}
