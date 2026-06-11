import type { HostivLocale } from "../types/hostiv-locale"
import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertySiteContent } from "../types/property-site"
import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertyWelcomeGuide } from "../types/welcome-guide"
import { welcomeGuideDedicatedImagePath } from "./welcome-guide-images"
import { resolveLocalizedList } from "./site-content-locale"

export const WELCOME_GUIDE_LIST_KEYS = [
  "rules",
  "emergency_contacts",
  "places",
  "dining_spots",
  "checkout_items"
] as const

export type WelcomeGuideListKey = (typeof WELCOME_GUIDE_LIST_KEYS)[number]

/** Chemins d’images : jamais de repli inter-locale dans l’éditeur (aperçu via fallback séparé). */
export const WELCOME_GUIDE_IMAGE_KEYS = [
  "cover_image_path",
  "host_image_path",
  "rules_image_path",
  "emergency_image_path",
  "dining_image_path"
] as const satisfies readonly (keyof PropertyWelcomeGuide)[]

const WELCOME_GUIDE_TEXT_SCALAR_KEYS = [
  "cover_title",
  "cover_subtitle",
  "host_name",
  "host_section_title",
  "host_facts_intro",
  "host_facts",
  "host_bio",
  "host_phone",
  "host_email",
  "wifi_network",
  "wifi_password",
  "welcome_eyebrow",
  "welcome_banner",
  "welcome_salutation",
  "welcome_body",
  "welcome_signature",
  "welcome_footer",
  "rules_title",
  "rules_banner",
  "rules_footer",
  "emergency_eyebrow",
  "emergency_banner",
  "emergency_intro",
  "places_city",
  "places_title",
  "dining_eyebrow",
  "dining_banner",
  "dining_intro",
  "checkout_title",
  "checkout_banner",
  "checkout_important",
  "checkout_footer"
] as const satisfies readonly (keyof PropertyWelcomeGuide)[]

type WelcomeGuideImageKey = (typeof WELCOME_GUIDE_IMAGE_KEYS)[number]

export function localizedWelcomeGuideKey(
  locale: HostivLocale
): "welcome_guide" | "welcome_guide_en" {
  return locale === "en" ? "welcome_guide_en" : "welcome_guide"
}

function applyWelcomeGuideImagePaths(
  guide: PropertyWelcomeGuide,
  stored: PropertyWelcomeGuide | undefined
): PropertyWelcomeGuide {
  const next = { ...guide }

  for (const key of WELCOME_GUIDE_IMAGE_KEYS) {
    next[key] = String(stored?.[key] ?? "").trim() as PropertyWelcomeGuide[WelcomeGuideImageKey]
  }

  return next
}

function sanitizeWelcomeGuideImagePaths(
  guide: PropertyWelcomeGuide,
  record: PropertyAdminRecord
): PropertyWelcomeGuide {
  return {
    ...guide,
    cover_image_path: welcomeGuideDedicatedImagePath(
      guide.cover_image_path,
      record.hero_image_path
    ),
    host_image_path: welcomeGuideDedicatedImagePath(
      guide.host_image_path,
      record.host_photo_path
    ),
    emergency_image_path: welcomeGuideDedicatedImagePath(
      guide.emergency_image_path,
      record.hero_image_path
    ),
    dining_image_path: welcomeGuideDedicatedImagePath(
      guide.dining_image_path,
      record.hero_image_path
    )
  }
}

function mergeWelcomeGuideTextScalars(
  primary: PropertyWelcomeGuide,
  fallback: PropertyWelcomeGuide | undefined,
  mode: "override" | "primaryFirst"
): PropertyWelcomeGuide {
  const merged = { ...primary }

  for (const key of WELCOME_GUIDE_TEXT_SCALAR_KEYS) {
    if (mode === "override") {
      const overrideValue = String(fallback?.[key] ?? "").trim()

      if (overrideValue && fallback) {
        merged[key] = fallback[key] as PropertyWelcomeGuide[typeof key]
      }

      continue
    }

    const primaryValue = String(primary[key] ?? "").trim()

    if (!primaryValue && fallback) {
      const fallbackValue = String(fallback[key] ?? "").trim()

      if (fallbackValue) {
        merged[key] = fallback[key] as PropertyWelcomeGuide[typeof key]
      }
    }
  }

  return merged
}

function resolveWelcomeGuideLists(
  content: PropertySiteContent,
  locale: HostivLocale
): Pick<PropertyWelcomeGuide, WelcomeGuideListKey> {
  const fr = content.welcome_guide
  const en = content.welcome_guide_en

  return {
    rules: resolveLocalizedList(
      locale === "en" ? en?.rules : fr.rules,
      locale === "en" ? fr.rules : en?.rules
    ),
    emergency_contacts: resolveLocalizedList(
      locale === "en" ? en?.emergency_contacts : fr.emergency_contacts,
      locale === "en" ? fr.emergency_contacts : en?.emergency_contacts
    ),
    places: resolveLocalizedList(
      locale === "en" ? en?.places : fr.places,
      locale === "en" ? fr.places : en?.places
    ),
    dining_spots: resolveLocalizedList(
      locale === "en" ? en?.dining_spots : fr.dining_spots,
      locale === "en" ? fr.dining_spots : en?.dining_spots
    ),
    checkout_items: resolveLocalizedList(
      locale === "en" ? en?.checkout_items : fr.checkout_items,
      locale === "en" ? fr.checkout_items : en?.checkout_items
    )
  }
}

/** Guide brut stocké pour la locale (sans repli inter-locale). */
export function getStoredWelcomeGuide(
  content: PropertySiteContent,
  locale: HostivLocale
): PropertyWelcomeGuide {
  return locale === "en"
    ? (content.welcome_guide_en ?? content.welcome_guide)
    : content.welcome_guide
}

/** Guide affiché dans l’éditeur (textes + listes avec repli FR↔EN ; images = locale active uniquement). */
export function getActiveWelcomeGuide(
  content: PropertySiteContent,
  locale: HostivLocale,
  record?: PropertyAdminRecord
): PropertyWelcomeGuide {
  const fr = content.welcome_guide
  const en = content.welcome_guide_en
  const lists = resolveWelcomeGuideLists(content, locale)
  const stored = locale === "en" ? en : fr

  const merged =
    locale === "en"
      ? applyWelcomeGuideImagePaths(
          {
            ...mergeWelcomeGuideTextScalars(fr, en, "override"),
            ...lists
          },
          stored
        )
      : applyWelcomeGuideImagePaths(
          {
            ...mergeWelcomeGuideTextScalars(fr, en, "primaryFirst"),
            ...lists
          },
          stored
        )

  return record ? sanitizeWelcomeGuideImagePaths(merged, record) : merged
}

export function cloneWelcomeGuide(guide: PropertyWelcomeGuide): PropertyWelcomeGuide {
  return JSON.parse(JSON.stringify(guide)) as PropertyWelcomeGuide
}

/** Duplique le guide FR vers EN quand la version anglaise n’existe pas encore. */
export function seedWelcomeGuide(
  content: PropertySiteContent,
  targetLocale: HostivLocale
): PropertySiteContent | null {
  if (targetLocale !== "en" || content.welcome_guide_en) {
    return null
  }

  return {
    ...content,
    welcome_guide_en: cloneWelcomeGuide(content.welcome_guide)
  }
}

/** Aperçu live : guide fusionné injecté dans `welcome_guide`. */
export function applyWelcomeGuideLocaleToRecord(
  record: PropertyAdminRecord,
  locale: HostivLocale
): PropertyAdminRecord {
  return {
    ...record,
    content: {
      ...record.content,
      welcome_guide: getActiveWelcomeGuide(record.content, locale, record)
    }
  }
}
