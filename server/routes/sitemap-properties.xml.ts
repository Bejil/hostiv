import { resolveHostivMarketingBaseUrl } from "../../app/utils/hostiv-marketing-seo"
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
  const urls = entries.map((entry) => ({
    loc: baseUrl ? `${baseUrl}/${entry.slug}` : `/${entry.slug}`,
    lastmod: formatSitemapLastmod(entry.updatedAt)
  }))

  setHeader(event, "Content-Type", "application/xml; charset=utf-8")
  setHeader(event, "Cache-Control", "public, max-age=3600")

  return renderSitemapUrlset(urls)
})
