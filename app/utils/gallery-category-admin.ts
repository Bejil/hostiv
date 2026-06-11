import type { PropertyGalleryCategory } from "../types/property-site"
import type { HostivLocale } from "../types/hostiv-locale"
import { adminUiFormat, getAdminUi } from "../data/admin-ui"

export function asGalleryText(value: unknown) {
  return typeof value === "string" ? value : ""
}

export function filledGalleryImages(images: string[] | null | undefined) {
  return (images ?? []).filter((image) => asGalleryText(image).trim())
}

export function firstGalleryImagePath(category: PropertyGalleryCategory) {
  return filledGalleryImages(category.images)[0] ?? ""
}

export function galleryImageCountLabel(count: number, locale: HostivLocale = "fr") {
  const labels = getAdminUi(locale).gallery

  if (!count) {
    return labels.photoCountNone
  }

  if (count === 1) {
    return labels.photoCountOne
  }

  return adminUiFormat(labels.photoCountMany, { count })
}

export function createGalleryCategory(
  existing: PropertyGalleryCategory[]
): PropertyGalleryCategory {
  const existingIds = new Set(existing.map((category) => category.id))
  let index = existing.length + 1
  let id = `section-images-${index}`

  while (existingIds.has(id)) {
    index += 1
    id = `section-images-${index}`
  }

  return {
    id,
    title: "",
    description: "",
    images: []
  }
}

export function defaultGalleryImagePath(
  category: PropertyGalleryCategory,
  categoryIndex: number,
  imageIndex: number,
  current: string | null | undefined
) {
  const trimmed = asGalleryText(current).trim().replace(/^\/+/, "")

  if (trimmed) {
    return trimmed
  }

  const categoryId = asGalleryText(category.id).trim() || `section-${categoryIndex + 1}`

  return `gallery/espaces/${categoryId}/${String(imageIndex + 1).padStart(2, "0")}.jpeg`
}

export function isGalleryCategoryPublishable(category: PropertyGalleryCategory) {
  return Boolean(
    asGalleryText(category.title).trim() &&
      asGalleryText(category.description).trim() &&
      filledGalleryImages(category.images).length > 0
  )
}

/** Retrouve une section galerie publiable via son id ou le titre de la carte. */
export function resolveGalleryCategoryIdForCard(
  categories: PropertyGalleryCategory[],
  options: { galleryCategoryId?: string | null; title?: string | null }
): string | null {
  const explicit = asGalleryText(options.galleryCategoryId).trim()

  if (explicit && categories.some((category) => category.id === explicit)) {
    return explicit
  }

  const cardTitle = asGalleryText(options.title).trim().toLowerCase()

  if (!cardTitle) {
    return null
  }

  const exact = categories.find(
    (category) => asGalleryText(category.title).trim().toLowerCase() === cardTitle
  )

  if (exact) {
    return exact.id
  }

  const partial = categories.find((category) => {
    const categoryTitle = asGalleryText(category.title).trim().toLowerCase()

    return (
      categoryTitle &&
      (cardTitle.includes(categoryTitle) || categoryTitle.includes(cardTitle))
    )
  })

  return partial?.id ?? null
}

/** Catégories affichées sur le site public (titres, sous-titres et photos renseignés). */
export function publishableGalleryCategories(
  categories: PropertyGalleryCategory[] | null | undefined
): PropertyGalleryCategory[] {
  return (categories ?? [])
    .filter(isGalleryCategoryPublishable)
    .map((category) => ({
      ...category,
      title: asGalleryText(category.title).trim(),
      description: asGalleryText(category.description).trim(),
      images: filledGalleryImages(category.images)
    }))
}
