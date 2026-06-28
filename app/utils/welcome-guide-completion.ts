import type { PropertyAdminRecord } from "../types/property-admin"
import type { PropertyWelcomeGuide } from "../types/welcome-guide"

export type WelcomeGuideCompletionRecord = Pick<
  PropertyAdminRecord,
  "hero_image_path" | "host_photo_path"
>

function hasText(value: string | undefined | null) {
  return String(value ?? "").trim().length > 0
}

export function isWelcomeGuidePage1Complete(
  guide: PropertyWelcomeGuide,
  record: WelcomeGuideCompletionRecord
) {
  return [
    guide.cover_title,
    guide.cover_subtitle,
    guide.cover_image_path || record.hero_image_path
  ].every((value) => hasText(value))
}

export function isWelcomeGuidePage2Complete(
  guide: PropertyWelcomeGuide,
  record: WelcomeGuideCompletionRecord
) {
  const hostPhoto = guide.host_image_path || record.host_photo_path

  return (
    hasText(hostPhoto) &&
    hasText(guide.host_name) &&
    hasText(guide.welcome_body) &&
    hasText(guide.welcome_signature) &&
    hasText(guide.wifi_network) &&
    hasText(guide.wifi_password) &&
    (hasText(guide.host_phone) || hasText(guide.host_email))
  )
}

export function isWelcomeGuidePage3Complete(guide: PropertyWelcomeGuide) {
  const rules = guide.rules ?? []

  return (
    hasText(guide.rules_title) &&
    hasText(guide.rules_banner) &&
    hasText(guide.rules_footer) &&
    rules.length > 0 &&
    rules.every((rule) => hasText(rule.title) && hasText(rule.text))
  )
}

export function isWelcomeGuidePage4Complete(
  guide: PropertyWelcomeGuide,
  record: WelcomeGuideCompletionRecord
) {
  const contacts = guide.emergency_contacts ?? []
  const photo = guide.emergency_image_path || record.hero_image_path

  return (
    hasText(photo) &&
    hasText(guide.emergency_eyebrow) &&
    hasText(guide.emergency_banner) &&
    hasText(guide.emergency_intro) &&
    contacts.length > 0 &&
    contacts.every(
      (contact) => hasText(contact.title) && hasText(contact.description) && hasText(contact.text)
    )
  )
}

export function isWelcomeGuidePage5Complete(guide: PropertyWelcomeGuide) {
  const places = guide.places ?? []

  return (
    hasText(guide.places_city) &&
    hasText(guide.places_title) &&
    places.length > 0 &&
    places.every(
      (place) =>
        hasText(place.image_path) &&
        hasText(place.title) &&
        hasText(place.description) &&
        hasText(place.address)
    )
  )
}

export function isWelcomeGuidePage6Complete(
  guide: PropertyWelcomeGuide,
  record: WelcomeGuideCompletionRecord
) {
  const spots = guide.dining_spots ?? []
  const photo = guide.dining_image_path || record.hero_image_path

  return (
    hasText(photo) &&
    hasText(guide.dining_eyebrow) &&
    hasText(guide.dining_banner) &&
    hasText(guide.dining_intro) &&
    spots.length > 0 &&
    spots.every(
      (spot) => hasText(spot.title) && hasText(spot.description) && hasText(spot.text)
    )
  )
}

export function isWelcomeGuidePage7Complete(guide: PropertyWelcomeGuide) {
  const items = guide.checkout_items ?? []

  return (
    hasText(guide.checkout_title) &&
    hasText(guide.checkout_banner) &&
    hasText(guide.checkout_important) &&
    hasText(guide.checkout_footer) &&
    items.length > 0 &&
    items.every((item) => hasText(item.title) && hasText(item.description))
  )
}

/** Aligné sur les pastilles vertes de l’éditeur admin (7 pages). */
export function isWelcomeGuideComplete(
  guide: PropertyWelcomeGuide,
  record: WelcomeGuideCompletionRecord
) {
  return (
    isWelcomeGuidePage1Complete(guide, record) &&
    isWelcomeGuidePage2Complete(guide, record) &&
    isWelcomeGuidePage3Complete(guide) &&
    isWelcomeGuidePage4Complete(guide, record) &&
    isWelcomeGuidePage5Complete(guide) &&
    isWelcomeGuidePage6Complete(guide, record) &&
    isWelcomeGuidePage7Complete(guide)
  )
}
