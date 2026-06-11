import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertyAdminRecord } from "../types/property-admin"
import { parseSiteTemplateId } from "./site-templates"
import { getAdminUi } from "./admin-ui"
import type { AdminSectionId } from "./admin-nav-sections"

export type AdminOnboardingStepId =
  | "welcome"
  | "header"
  | "template"
  | "seo"
  | "images"
  | "host"
  | "location"
  | "booking"

export type AdminOnboardingStep = {
  id: AdminOnboardingStepId
  section: AdminSectionId | null
  title: string
  subtitle: string
  tips: string[]
  cta: string
}

export function getAdminOnboardingSteps(locale: HostivLocale = "fr"): AdminOnboardingStep[] {
  return getAdminUi(locale).onboarding.steps as AdminOnboardingStep[]
}

/** @deprecated Utiliser getAdminOnboardingSteps(locale) */
export const adminOnboardingSteps = getAdminOnboardingSteps("fr")

export function getAdminOnboardingStepCount(locale: HostivLocale = "fr") {
  return getAdminOnboardingSteps(locale).length
}

/** @deprecated Utiliser getAdminOnboardingStepCount(locale) */
export const adminOnboardingStepCount = getAdminOnboardingStepCount("fr")

function progressOnboardingStepIds(locale: HostivLocale) {
  return getAdminOnboardingSteps(locale)
    .filter((step) => step.id !== "welcome")
    .map((step) => step.id)
}

/** Vrai tant qu’au moins une étape obligatoire du parcours n’est pas remplie dans le site. */
export function isOnboardingRequired(
  record: PropertyAdminRecord,
  locale: HostivLocale = "fr"
): boolean {
  return progressOnboardingStepIds(locale).some(
    (stepId) => !evaluateOnboardingStep(record, stepId, locale)
  )
}

/** Index de la première étape incomplète (1…n), ou dernière étape si tout est rempli. */
export function getFirstIncompleteOnboardingStepIndex(
  record: PropertyAdminRecord,
  locale: HostivLocale = "fr"
): number {
  const steps = getAdminOnboardingSteps(locale)

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index]

    if (step && step.id !== "welcome" && !evaluateOnboardingStep(record, step.id, locale)) {
      return index
    }
  }

  return steps.length - 1
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
}

export function evaluateOnboardingStep(
  record: PropertyAdminRecord,
  stepId: AdminOnboardingStepId,
  locale: HostivLocale = "fr"
): boolean {
  return getOnboardingStepMissingLabels(record, stepId, locale).length === 0
}

export function getOnboardingStepMissingLabels(
  record: PropertyAdminRecord,
  stepId: AdminOnboardingStepId,
  locale: HostivLocale = "fr"
): string[] {
  const v = getAdminUi(locale).validation

  switch (stepId) {
    case "welcome":
      return []
    case "header": {
      const missing: string[] = []

      if (!hasText(record.logo_path)) {
        missing.push(v.logo)
      }

      if (!hasText(record.brand_name)) {
        missing.push(v.brandName)
      }

      if (!hasText(record.brand_meta)) {
        missing.push(v.brandMeta)
      }

      return missing
    }
    case "template":
      return parseSiteTemplateId(record.content.template?.id) ? [] : [v.selectedTheme]
    case "seo": {
      const missing: string[] = []
      const hero = record.content?.copy?.hero

      if (!hasText(record.hero_image_path)) {
        missing.push(v.heroImageMain)
      }

      if (!hasText(hero?.eyebrow)) {
        missing.push(v.eyebrow)
      }

      if (!hasText(hero?.title)) {
        missing.push(v.heroHomeTitle)
      }

      if (!hasText(hero?.text)) {
        missing.push(v.heroIntroText)
      }

      return missing
    }
    case "images": {
      const hasValidSection = (record.content.space_gallery_categories ?? []).some(
        (category) =>
          hasText(category.title) &&
          hasText(category.description) &&
          (category.images ?? []).some((image) => hasText(image))
      )

      return hasValidSection ? [] : [v.gallerySectionMin]
    }
    case "host": {
      const missing: string[] = []
      const host = record.content?.copy?.host

      if (!hasText(record.host_photo_path)) {
        missing.push(v.hostPhoto)
      }

      if (!hasText(host?.caption)) {
        missing.push(v.caption)
      }

      if (!hasText(host?.title)) {
        missing.push(v.title)
      }

      if (!hasText(host?.quote)) {
        missing.push(v.quote)
      }

      if (!hasText(host?.intro_1)) {
        missing.push(v.introduction)
      }

      return missing
    }
    case "location": {
      const missing: string[] = []

      if (!hasText(record.location?.address)) {
        missing.push(v.address)
      }

      if (!hasText(record.content?.copy?.location?.lead)) {
        missing.push(v.neighborhoodChapo)
      }

      return missing
    }
    case "booking": {
      const missing: string[] = []

      if (Number(record.booking_config?.base_night_price_eur ?? 0) <= 0) {
        missing.push(v.nightPrice)
      }

      if (Number(record.booking_config?.included_main_guests ?? 0) <= 0) {
        missing.push(v.includedGuests)
      }

      return missing
    }
    default:
      return []
  }
}
