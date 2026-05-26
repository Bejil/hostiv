import type { Ref } from "vue"
import { resolvePropertyAssetUrl } from "../utils/property-asset-url"
import { usePublicAsset } from "./usePublicAsset"

/**
 * Résout les chemins d’assets d’un site (`/gallery/...`) vers Supabase Storage.
 */
export function usePropertyAsset(slug: Ref<string> | string) {
  const config = useRuntimeConfig()
  const { publicAsset } = usePublicAsset()

  const slugRef = computed(() => {
    const value = typeof slug === "string" ? slug : slug.value

    return String(value || "").replace(/^\/+|\/+$/g, "")
  })

  function propertyAsset(src: string) {
    const path = src.trim()

    if (!path) {
      return ""
    }

    if (/^https?:\/\//i.test(path)) {
      return path
    }

    const supabaseUrl = String(config.public.supabaseUrl || "").trim()
    const bucket = String(config.public.propertyAssetsBucket || "").trim()

    if (supabaseUrl && slugRef.value) {
      const storageUrl = resolvePropertyAssetUrl(path, {
        slug: slugRef.value,
        supabaseUrl,
        bucket: bucket || undefined
      })

      if (storageUrl) {
        return storageUrl
      }
    }

    return publicAsset(path)
  }

  return { propertyAsset }
}
