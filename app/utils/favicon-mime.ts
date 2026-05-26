export function faviconMimeType(path: string): string {
  const lower = path.toLowerCase()

  if (lower.endsWith(".svg")) {
    return "image/svg+xml"
  }

  if (lower.endsWith(".png")) {
    return "image/png"
  }

  if (lower.endsWith(".webp")) {
    return "image/webp"
  }

  return "image/x-icon"
}
