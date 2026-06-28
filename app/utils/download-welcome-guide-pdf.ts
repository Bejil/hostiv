import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertyAdminRecord } from "../types/property-admin"
import { cloneRecordForWelcomeGuidePreview } from "./admin-welcome-guide-preview-messages"

export async function downloadWelcomeGuidePdf(
  slug: string,
  record: PropertyAdminRecord,
  headers: Record<string, string>,
  assetRevision = 0,
  locale: HostivLocale = "fr"
) {
  const blob = await $fetch<Blob>(`/api/admin/${encodeURIComponent(slug)}/welcome-guide/pdf`, {
    method: "POST",
    headers,
    body: {
      record: cloneRecordForWelcomeGuidePreview(record),
      assetRevision,
      locale
    },
    responseType: "blob"
  })

  const safeSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  const filename = `guide-accueil-${safeSlug || "logement"}.pdf`
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
