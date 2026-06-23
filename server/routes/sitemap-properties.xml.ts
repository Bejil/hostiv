import { resolveHostivMarketingBaseUrl } from "../../app/utils/hostiv-marketing-seo"
import { getPropertySitePath, propertySiteHasEnglishLocale } from "../../app/utils/property-site-routes"
import { listPublishedPropertySitemapEntries } from "../utils/property-sitemap"
import { renderSitemapUrlset } from "../utils/sitemap-xml"

function formatSitemapLastmod(value: string | null) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const baseUrl = resolveHostivMarketingBaseUrl(
    String(useRuntimeConfig().public.siteUrl ?? ""),
    getRequestURL(event).origin
  )

  const entries = await listPublishedPropertySitemapEntries()
  const urls = entries.flatMap((entry) => {
    const frLoc = baseUrl
      ? `${baseUrl}${getPropertySitePath(entry.slug, "fr")}`
      : getPropertySitePath(entry.slug, "fr")
    const result = [{ loc: frLoc, lastmod: formatSitemapLastmod(entry.updatedAt) }]

    if (propertySiteHasEnglishLocale(entry.site)) {
      result.push({
        loc: baseUrl
          ? `${baseUrl}${getPropertySitePath(entry.slug, "en")}`
          : getPropertySitePath(entry.slug, "en"),
        lastmod: formatSitemapLastmod(entry.updatedAt)
      })
    }

    return result
  })

  setHeader(event, "Content-Type", "application/xml; charset=utf-8")
  setHeader(event, "Cache-Control", "public, max-age=3600")

  return renderSitemapUrlset(urls)
})
