import type { PropertySiteRecord } from "../types/property-site"
import { derivePropertySeo } from "./derive-property-seo"

type PropertySiteJsonLdInput = {
  site: PropertySiteRecord
  slug: string
  pageUrl: string
  imageUrl?: string
  locale: "fr" | "en"
}

function averageReviewRating(reviews: Array<{ rating?: string }>) {
  const values = reviews
    .map((review) => Number.parseFloat(String(review.rating ?? "").replace(",", ".")))
    .filter((value) => Number.isFinite(value) && value > 0)

  if (!values.length) {
    return null
  }

  const sum = values.reduce((total, value) => total + value, 0)

  return {
    ratingValue: Math.round((sum / values.length) * 10) / 10,
    reviewCount: values.length
  }
}

export function buildPropertySiteJsonLd(input: PropertySiteJsonLdInput) {
  if (!input.pageUrl) {
    return null
  }

  const seo = derivePropertySeo(input.site)
  const brandName = input.site.brand_name.trim() || seo.seo_title
  const address = input.site.location?.address?.trim() ?? ""
  const reviews = input.site.content?.reviews ?? []
  const aggregateRating = averageReviewRating(reviews)
  const pageId = `${input.pageUrl}#webpage`
  const lodgingId = `${input.pageUrl}#lodging`

  const lodging: Record<string, unknown> = {
    "@type": "VacationRental",
    "@id": lodgingId,
    name: brandName,
    description: seo.seo_description,
    url: input.pageUrl,
    inLanguage: input.locale === "en" ? "en-GB" : "fr-FR"
  }

  if (input.imageUrl) {
    lodging.image = input.imageUrl
  }

  if (address) {
    lodging.address = {
      "@type": "PostalAddress",
      streetAddress: address
    }
  }

  if (aggregateRating) {
    lodging.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
      bestRating: 5
    }
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageId,
        url: input.pageUrl,
        name: seo.seo_title,
        description: seo.seo_description,
        inLanguage: input.locale === "en" ? "en-GB" : "fr-FR",
        about: { "@id": lodgingId }
      },
      lodging
    ]
  }
}
