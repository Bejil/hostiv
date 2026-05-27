import { requireSupabaseAdmin } from "./supabase"

const DEFAULT_BUCKET = "property-assets"

function getPropertyAssetsBucket() {
  return (process.env.NUXT_PUBLIC_PROPERTY_ASSETS_BUCKET || DEFAULT_BUCKET).trim()
}

async function listAllStoragePaths(bucket: string, prefix: string): Promise<string[]> {
  const supabase = requireSupabaseAdmin()
  const paths: string[] = []

  async function walk(folder: string) {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" }
    })

    if (error) {
      console.error("[property-storage-cleanup] list:", folder, error.message)
      return
    }

    if (!data?.length) {
      return
    }

    for (const item of data) {
      const itemPath = folder ? `${folder}/${item.name}` : item.name

      if (item.id === null) {
        await walk(itemPath)
        continue
      }

      paths.push(itemPath)
    }
  }

  await walk(prefix)
  return paths
}

/** Supprime tous les fichiers Storage sous `{slug}/` (bucket property-assets). */
export async function deletePropertyStorageAssets(slug: string): Promise<void> {
  const normalizedSlug = slug.trim().toLowerCase()

  if (!normalizedSlug) {
    return
  }

  const bucket = getPropertyAssetsBucket()
  const paths = await listAllStoragePaths(bucket, normalizedSlug)

  if (!paths.length) {
    return
  }

  const supabase = requireSupabaseAdmin()
  const batchSize = 100

  for (let index = 0; index < paths.length; index += batchSize) {
    const batch = paths.slice(index, index + batchSize)
    const { error } = await supabase.storage.from(bucket).remove(batch)

    if (error) {
      console.error("[property-storage-cleanup] remove:", error.message)

      throw createError({
        statusCode: 502,
        message: "Impossible de supprimer les fichiers du site."
      })
    }
  }
}
