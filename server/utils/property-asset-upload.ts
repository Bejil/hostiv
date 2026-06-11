import { extname } from "node:path"
import { DEFAULT_PROPERTY_ASSETS_BUCKET, resolvePropertyAssetUrl } from "../../app/utils/property-asset-url"
import { requireSupabaseAdmin } from "./supabase"

const ALLOWED_ROOTS = new Set(["gallery", "branding", "about", "platforms", "guide"])

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
}

function sanitizeStorageRelativePath(raw: string) {
  const cleaned = raw
    .trim()
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")
    .replace(/\.\.+/g, "")

  const segments = cleaned.split("/").filter(Boolean)

  if (segments.length < 2) {
    return null
  }

  const [root, ...rest] = segments

  if (!ALLOWED_ROOTS.has(root)) {
    return null
  }

  const fileName = rest[rest.length - 1]

  if (!fileName || !/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    return null
  }

  return segments.join("/")
}

export async function uploadPropertyAsset(
  slug: string,
  file: { data: Buffer; filename?: string; type?: string },
  relativePath: string
) {
  const normalizedSlug = slug.trim().toLowerCase()
  const safeRelative = sanitizeStorageRelativePath(relativePath)

  if (!safeRelative) {
    throw createError({
      statusCode: 400,
      message: "Chemin de fichier invalide (gallery, branding, about, platforms ou guide)."
    })
  }

  const storageKey = `${normalizedSlug}/${safeRelative}`
  const bucket = process.env.NUXT_PUBLIC_PROPERTY_ASSETS_BUCKET?.trim() || DEFAULT_PROPERTY_ASSETS_BUCKET
  const ext = extname(file.filename || safeRelative).toLowerCase()
  const contentType = file.type || MIME_BY_EXT[ext] || "application/octet-stream"

  const supabase = requireSupabaseAdmin()

  const { error } = await supabase.storage.from(bucket).upload(storageKey, file.data, {
    upsert: true,
    contentType,
    cacheControl: "3600"
  })

  if (error) {
    throw createError({
      statusCode: 502,
      message: error.message
    })
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim() || ""
  const cacheRevision = Date.now()
  const publicUrl = resolvePropertyAssetUrl(`/${safeRelative}`, {
    slug: normalizedSlug,
    supabaseUrl,
    bucket,
    cacheRevision
  })

  return {
    path: `/${safeRelative}`,
    storageKey,
    publicUrl
  }
}
