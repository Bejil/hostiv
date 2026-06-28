import type { HostivLocale } from "../../app/types/hostiv-locale"
import type { PropertyAdminRecord } from "../../app/types/property-admin"
import type { PropertyWelcomeGuide } from "../../app/types/welcome-guide"
import type { WelcomeGuideHtmlOptions } from "../../app/utils/welcome-guide-html"
import { normalizeWelcomeGuide } from "../../app/utils/welcome-guide-content"
import { getActiveWelcomeGuide } from "../../app/utils/welcome-guide-locale"
import { renderHtmlToPdfBuffer } from "./html-to-pdf"
import { buildWelcomeGuideHtml } from "./welcome-guide-html"

export function welcomeGuidePdfFilename(slug: string) {
  const safe = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

  return `guide-accueil-${safe || "logement"}.pdf`
}

function welcomeGuidePdfSupabaseUrl() {
  return process.env.SUPABASE_URL?.trim() || ""
}

export type BuildWelcomeGuidePdfOptions = Pick<WelcomeGuideHtmlOptions, "assetRevision" | "locale">

/** PDF magazine via HTML/CSS + Chromium (Playwright). */
export async function buildWelcomeGuidePdf(
  property: PropertyAdminRecord,
  guide?: PropertyWelcomeGuide,
  htmlOptions: BuildWelcomeGuidePdfOptions = {}
): Promise<Buffer> {
  const locale: HostivLocale = htmlOptions.locale ?? "fr"
  const normalizedGuide = normalizeWelcomeGuide(
    guide ??
      getActiveWelcomeGuide(property.content, locale, property),
    property.brand_name,
    property
  )
  const supabaseUrl = welcomeGuidePdfSupabaseUrl()
  const html = buildWelcomeGuideHtml(property, normalizedGuide, {
    supabaseUrl,
    assetRevision: htmlOptions.assetRevision,
    locale
  })

  return renderHtmlToPdfBuffer(html, { waitForImages: true })
}
