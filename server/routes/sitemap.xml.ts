import {
  getHostivMarketingSitemapPaths,
  resolveHostivMarketingAbsoluteUrl,
  resolveHostivMarketingBaseUrl
} from "../../app/utils/hostiv-marketing-seo"
import { renderSitemapUrlset } from "../utils/sitemap-xml"

export default defineEventHandler((event) => {
  const baseUrl = resolveHostivMarketingBaseUrl(
    String(useRuntimeConfig().public.siteUrl ?? ""),
    getRequestURL(event).origin
  )

  const paths = getHostivMarketingSitemapPaths()
  const urls = paths.map((path) => ({
    loc: resolveHostivMarketingAbsoluteUrl(baseUrl, path)
  }))

  setHeader(event, "Content-Type", "application/xml; charset=utf-8")
  setHeader(event, "Cache-Control", "public, max-age=3600")

  return renderSitemapUrlset(urls)
})
