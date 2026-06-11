const ALLOWED_IMAGE_EXT = new Set(["jpeg", "jpg", "png", "webp", "gif"])

function normalizeImageExt(ext: string) {
  const token = ext.trim().toLowerCase()

  if (token === "jpg") {
    return "jpeg"
  }

  return ALLOWED_IMAGE_EXT.has(token) ? token : "jpeg"
}

function extFromFileName(fileName: string) {
  const token = fileName.split(".").pop()?.trim().toLowerCase() ?? ""

  return token && ALLOWED_IMAGE_EXT.has(token) ? normalizeImageExt(token) : ""
}

/**
 * Génère un chemin Storage unique à chaque upload pour éviter le cache navigateur
 * quand le même fichier est remplacé (upsert sur un chemin fixe).
 */
export function versionedPropertyAssetUploadPath(requestedPath: string, file?: File) {
  const cleaned = requestedPath.trim().replace(/^\/+/, "").replace(/\\/g, "/")
  const segments = cleaned.split("/").filter(Boolean)

  if (segments.length < 2) {
    return cleaned
  }

  const fileName = segments[segments.length - 1] ?? ""
  const dir = segments.slice(0, -1).join("/")
  const lastDot = fileName.lastIndexOf(".")
  const stem = lastDot > 0 ? fileName.slice(0, lastDot) : fileName
  const pathExt = lastDot > 0 ? normalizeImageExt(fileName.slice(lastDot + 1)) : ""
  const fileExt = file?.name ? extFromFileName(file.name) : ""
  const ext = fileExt || pathExt || "jpeg"
  const stemBase = stem.replace(/-\d{13,}$/, "")

  return `${dir}/${stemBase}-${Date.now()}.${ext}`
}
