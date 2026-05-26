import { slugifyPropertyName, validatePropertySlugFormat } from "../utils/property-slug"

export type PropertySlugCheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  | "error"

export function useHostivPropertySlugCheck(propertyName: Ref<string>) {
  const propertySlug = computed(() => slugifyPropertyName(propertyName.value))
  const status = ref<PropertySlugCheckStatus>("idle")
  const serverReason = ref<string>("")
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let requestId = 0

  const formatValidity = computed(() => validatePropertySlugFormat(propertySlug.value))

  async function runCheck() {
    const name = propertyName.value.trim()
    const slug = propertySlug.value

    if (!name) {
      status.value = "idle"
      serverReason.value = ""
      return
    }

    const local = formatValidity.value

    if (!local.valid) {
      status.value = "invalid"
      serverReason.value = local.reason
      return
    }

    const currentRequest = ++requestId
    status.value = "checking"

    try {
      const result = await $fetch<{
        slug: string
        valid: boolean
        available: boolean
        reason: string
      }>("/api/hostiv/slug-available", {
        query: { slug }
      })

      if (currentRequest !== requestId) {
        return
      }

      if (!result.valid) {
        status.value = "invalid"
        serverReason.value = result.reason
        return
      }

      status.value = result.available ? "available" : "taken"
      serverReason.value = result.reason
    } catch {
      if (currentRequest !== requestId) {
        return
      }

      status.value = "error"
      serverReason.value = "error"
    }
  }

  function scheduleCheck() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      void runCheck()
    }, 400)
  }

  watch(propertyName, () => {
    scheduleCheck()
  })

  onScopeDispose(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    requestId++
  })

  const isSlugReady = computed(
    () => formatValidity.value.valid && status.value === "available"
  )

  return {
    propertySlug,
    status,
    serverReason,
    formatValidity,
    isSlugReady,
    runCheck
  }
}
