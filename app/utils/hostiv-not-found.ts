import type { NuxtError } from "#app"

export type HostivNotFoundKind = "page" | "site" | "backoffice"

export function resolveHostivNotFoundKind(error: NuxtError): HostivNotFoundKind {
  const data = error.data as { notFoundKind?: HostivNotFoundKind } | undefined

  if (data?.notFoundKind) {
    return data.notFoundKind
  }

  const message = (error.statusMessage || "").toLowerCase()

  if (message.includes("backoffice") || message.includes("dashboard")) {
    return "backoffice"
  }

  if (
    message.includes("site") &&
    (message.includes("introuvable") ||
      message.includes("not found") ||
      message.includes("existe") ||
      message.includes("exist") ||
      message.includes("published") ||
      message.includes("publié"))
  ) {
    return "site"
  }

  return "page"
}
