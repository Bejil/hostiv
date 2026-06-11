import type { PropertyAdminRecord } from "../types/property-admin"
import { welcomeGuideRuleIconSvgHtml } from "../data/welcome-guide-rule-icons"
import { normalizeWelcomeGuideRuleIcon } from "../data/welcome-guide-rule-icons"
import type { PropertyWelcomeGuide, WelcomeGuideRuleIcon } from "../types/welcome-guide"
import {
  welcomeGuideDisplayName,
  WELCOME_GUIDE_MAX_CHECKOUT_COUNT,
  WELCOME_GUIDE_MAX_DINING_COUNT,
  WELCOME_GUIDE_MAX_EMERGENCY_COUNT,
  WELCOME_GUIDE_MAX_PLACE_COUNT
} from "./welcome-guide-content"
import {
  resolveWelcomeGuideCoverImagePath,
  resolveWelcomeGuideDiningImagePath,
  resolveWelcomeGuideEmergencyImagePath,
  resolveWelcomeGuideHostImagePath,
  resolveWelcomeGuidePlaceImagePath
} from "./welcome-guide-images"
import { resolvePropertyInvoiceTheme } from "../data/site-template-invoice-theme"
import { resolvePropertyAssetUrl } from "./property-asset-url"
import { welcomeGuideThemeCssVarsBlock } from "./site-template-css-vars"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export type WelcomeGuideHtmlOptions = {
  supabaseUrl?: string
  /** Invalide le cache des images dans l’aperçu live (remplacement au même chemin Storage). */
  assetRevision?: number
  /** Pousse iframe — combiné à assetRevision pour forcer le rechargement des images. */
  previewNonce?: number
}

/** Format A4 à 96 CSS px/in (210 × 297 mm) — aperçu écran et viewport PDF. */
export const WELCOME_GUIDE_A4_WIDTH_PX = 794
export const WELCOME_GUIDE_A4_HEIGHT_PX = Math.round((297 / 210) * WELCOME_GUIDE_A4_WIDTH_PX)

export const WELCOME_GUIDE_PAGE_COUNT = 7

function welcomeGuidePreviewCacheToken(assetRevision?: number, previewNonce?: number) {
  const revision = assetRevision ?? 0
  const nonce = previewNonce ?? 0

  if (revision <= 0 && nonce <= 0) {
    return undefined
  }

  return `${revision}-${nonce}`
}

function assetUrl(
  property: PropertyAdminRecord,
  path: string,
  supabaseUrl: string,
  assetRevision?: number,
  previewNonce?: number
) {
  return (
    resolvePropertyAssetUrl(path, {
      slug: property.slug,
      supabaseUrl,
      cacheRevision: welcomeGuidePreviewCacheToken(assetRevision, previewNonce)
    }) || ""
  )
}

type CoverContent = {
  displayName: string
  imageUrl: string
  title: string
  subtitle: string
}

type WelcomePageContent = {
  hostImageUrl: string
  hostName: string
  hostSectionTitle: string
  hostBio: string
  hostPhone: string
  hostEmail: string
  wifiNetwork: string
  wifiPassword: string
  welcomeEyebrow: string
  welcomeBanner: string
  welcomeSalutation: string
  welcomeParagraphs: string[]
  welcomeSignature: string
}

type RulesPageContent = {
  title: string
  banner: string
  footer: string
  rules: Array<{
    icon: WelcomeGuideRuleIcon
    title: string
    text: string
  }>
}

type WelcomeGuideAssetContext = {
  supabaseUrl: string
  assetRevision?: number
  previewNonce?: number
}

function buildCoverContent(
  property: PropertyAdminRecord,
  guide: PropertyWelcomeGuide,
  assets: WelcomeGuideAssetContext
): CoverContent {
  const imagePath = resolveWelcomeGuideCoverImagePath(guide.cover_image_path, property)

  return {
    displayName: escapeHtml(welcomeGuideDisplayName(guide, property.brand_name)),
    imageUrl: assetUrl(
      property,
      imagePath,
      assets.supabaseUrl,
      assets.assetRevision,
      assets.previewNonce
    ),
    title: escapeHtml(guide.cover_title.trim() || "Bienvenue"),
    subtitle: escapeHtml(guide.cover_subtitle.trim())
  }
}

function buildWelcomePageContent(
  property: PropertyAdminRecord,
  guide: PropertyWelcomeGuide,
  assets: WelcomeGuideAssetContext
): WelcomePageContent {
  const hostImagePath = resolveWelcomeGuideHostImagePath(guide.host_image_path, property)

  return {
    hostImageUrl: assetUrl(
      property,
      hostImagePath,
      assets.supabaseUrl,
      assets.assetRevision,
      assets.previewNonce
    ),
    hostName: escapeHtml(guide.host_name.trim()),
    hostSectionTitle: escapeHtml(guide.host_section_title.trim() || "Rencontrez votre hôte"),
    hostBio: escapeHtml(guide.host_bio.trim()),
    hostPhone: escapeHtml(guide.host_phone.trim()),
    hostEmail: escapeHtml(guide.host_email.trim()),
    wifiNetwork: escapeHtml(guide.wifi_network.trim()),
    wifiPassword: escapeHtml(guide.wifi_password.trim()),
    welcomeEyebrow: escapeHtml(guide.welcome_eyebrow.trim() || "Un accueil"),
    welcomeBanner: escapeHtml(guide.welcome_banner.trim() || "chaleureux"),
    welcomeSalutation: escapeHtml(guide.welcome_salutation.trim() || "Cher invité"),
    welcomeParagraphs: guide.welcome_body.trim()
      ? guide.welcome_body
          .split(/\n\n+/)
          .map((block) => block.trim())
          .filter(Boolean)
          .map(escapeHtml)
      : [],
    welcomeSignature: escapeHtml(guide.welcome_signature.trim())
  }
}

function coverPageHtml(c: CoverContent) {
  const bgStyle = c.imageUrl ? ` style="background-image:url('${escapeHtml(c.imageUrl)}')"` : ""

  return `
  <section class="wg-page wg-cover">
    <div class="wg-cover__frame">
      <div class="wg-cover__bg wg-photo"${bgStyle}></div>
      <div class="wg-cover__overlay" aria-hidden="true"></div>
      <div class="wg-cover__content">
        <div class="wg-cover__headlines">
          <h1 class="wg-cover__title">${c.title}</h1>
          ${c.subtitle ? `<p class="wg-cover__subtitle">${c.subtitle}</p>` : ""}
        </div>
      </div>
    </div>
  </section>`
}

const WG_ICON_PHONE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 2h2.2l1.4 3.5-1.6 1.2a13 13 0 0 0 5.7 5.7l1.2-1.6L18.5 12v2.2a1.8 1.8 0 0 1-1.6 1.8c-6.8.6-12.1-5.5-11.5-12.2A1.8 1.8 0 0 1 6.6 2Z" fill="currentColor"/></svg>`

const WG_ICON_MAP_PIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" fill="currentColor"/></svg>`

const WG_ICON_MAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2 8 5 8-5v-.4l-8 5-8-5V7Zm0 9.6 7.1-4.4c.6-.4 1.2-.4 1.8 0L20 16.6V17H4v-.4Z" fill="currentColor"/></svg>`

const WG_ICON_WIFI = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.55a11 11 0 0 1 14 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8.5 16.15a6 6 0 0 1 7 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="20" r="1.25" fill="currentColor"/></svg>`

function welcomeContactLine(icon: string, value: string) {
  return `<p class="wg-welcome__contact-line">
    <span class="wg-welcome__contact-icon">${icon}</span>
    <span class="wg-welcome__contact-value">${value}</span>
  </p>`
}

function welcomePageHtml(w: WelcomePageContent) {
  const photoStyle = w.hostImageUrl
    ? ` style="background-image:url('${escapeHtml(w.hostImageUrl)}')"`
    : ""

  const contactLines = [
    w.hostPhone ? welcomeContactLine(WG_ICON_PHONE, w.hostPhone) : "",
    w.hostEmail ? welcomeContactLine(WG_ICON_MAIL, w.hostEmail) : ""
  ].filter(Boolean)

  const contactHtml =
    contactLines.length > 0
      ? `<div class="wg-welcome__contact">
          <p class="wg-welcome__contact-title"><strong>Contactez-moi</strong></p>
          <div class="wg-welcome__contact-lines">${contactLines.join("")}</div>
        </div>`
      : ""

  const wifiHtml =
    w.wifiNetwork || w.wifiPassword
      ? `<div class="wg-welcome__wifi">
          <p class="wg-welcome__wifi-title">
            <span class="wg-welcome__wifi-icon" aria-hidden="true">${WG_ICON_WIFI}</span>
            <strong>Wi‑Fi</strong>
          </p>
          <dl class="wg-welcome__wifi-details">
            ${
              w.wifiNetwork
                ? `<div class="wg-welcome__wifi-row">
              <dt>Réseau</dt>
              <dd>${w.wifiNetwork}</dd>
            </div>`
                : ""
            }
            ${
              w.wifiPassword
                ? `<div class="wg-welcome__wifi-row">
              <dt>Mot de passe</dt>
              <dd>${w.wifiPassword}</dd>
            </div>`
                : ""
            }
          </dl>
        </div>`
      : ""

  const bodyHtml =
    w.welcomeParagraphs.length > 0
      ? w.welcomeParagraphs.map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`).join("")
      : ""

  return `
  <section class="wg-page wg-welcome">
    <aside class="wg-welcome__sidebar">
      <div class="wg-welcome__host-photo wg-photo"${photoStyle} role="img" aria-label="${w.hostName || "Hôte"}"></div>
      ${w.hostName ? `<p class="wg-welcome__host-name">${w.hostName}</p>` : ""}
      <h2 class="wg-welcome__host-heading">${w.hostSectionTitle}</h2>
      ${w.hostBio ? `<p class="wg-welcome__bio">${w.hostBio.replace(/\n/g, "<br />")}</p>` : ""}
      ${contactHtml}
    </aside>
    <div class="wg-welcome__main">
      <header class="wg-welcome__header">
        <p class="wg-welcome__eyebrow">${w.welcomeEyebrow}</p>
        <div class="wg-welcome__banner"><span>${w.welcomeBanner}</span></div>
      </header>
      <h2 class="wg-welcome__salutation">${w.welcomeSalutation}</h2>
      ${bodyHtml ? `<div class="wg-welcome__body">${bodyHtml}</div>` : ""}
      ${
        w.welcomeSignature || wifiHtml
          ? `<div class="wg-welcome__main-bottom">
      ${w.welcomeSignature ? `<p class="wg-welcome__signature">${w.welcomeSignature}</p>` : ""}
      ${wifiHtml}
    </div>`
          : ""
      }
    </div>
  </section>`
}

function buildRulesPageContent(guide: PropertyWelcomeGuide): RulesPageContent {
  return {
    title: escapeHtml(guide.rules_title.trim() || "Règles de la maison"),
    banner: escapeHtml(guide.rules_banner.trim() || "• Merci de respecter notre logement •"),
    footer: escapeHtml(
      guide.rules_footer.trim() || "Merci de nous aider à garder notre logement agréable pour tous !"
    ),
    rules: (guide.rules ?? []).map((rule) => ({
      icon: rule.icon,
      title: escapeHtml(rule.title.trim()),
      text: escapeHtml(rule.text.trim())
    }))
  }
}

const WG_RULE_HEART_SOLID = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2s-6.8-4.2-9.2-8.1C1.1 9.2 2.6 5.6 6 5.1c1.8-.3 3.5.5 4.6 2 1.1-1.5 2.8-2.3 4.6-2 3.4.5 4.9 4.1 3.2 7-2.4 3.9-9.2 8.1-9.2 8.1Z" fill="currentColor"/></svg>`

const WG_RULE_HEART_OUTLINE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2s-6.8-4.2-9.2-8.1C1.1 9.2 2.6 5.6 6 5.1c1.8-.3 3.5.5 4.6 2 1.1-1.5 2.8-2.3 4.6-2 3.4.5 4.9 4.1 3.2 7-2.4 3.9-9.2 8.1-9.2 8.1Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`

function rulesRuleHtml(rule: RulesPageContent["rules"][number], isLast: boolean) {
  const icon = welcomeGuideRuleIconSvgHtml(rule.icon)
  const divider = isLast ? "" : `<hr class="wg-rules__divider" aria-hidden="true" />`

  return `<article class="wg-rules__item">
    <div class="wg-rules__icon" aria-hidden="true">${icon}</div>
    <div class="wg-rules__copy">
      ${rule.title ? `<h3 class="wg-rules__item-title">${rule.title}</h3>` : ""}
      ${rule.text ? `<p class="wg-rules__item-text">${rule.text}</p>` : ""}
    </div>
  </article>${divider}`
}

type EmergencyPageContent = {
  eyebrow: string
  banner: string
  intro: string
  imageUrl: string
  contacts: Array<{ title: string; description: string; text: string; note: string }>
}

function buildEmergencyPageContent(
  property: PropertyAdminRecord,
  guide: PropertyWelcomeGuide,
  assets: WelcomeGuideAssetContext
): EmergencyPageContent {
  const imagePath = resolveWelcomeGuideEmergencyImagePath(guide.emergency_image_path, property)

  return {
    eyebrow: escapeHtml(guide.emergency_eyebrow.trim() || "Numéros"),
    banner: escapeHtml(guide.emergency_banner.trim() || "d'urgence"),
    intro: escapeHtml(
      guide.emergency_intro.trim() ||
        "En cas d’urgence ou de besoin d’aide, contactez les services ci-dessous. Conservez ce guide à portée de main pendant votre séjour."
    ),
    imageUrl: assetUrl(
      property,
      imagePath,
      assets.supabaseUrl,
      assets.assetRevision,
      assets.previewNonce
    ),
    contacts: (guide.emergency_contacts ?? [])
      .slice(0, WELCOME_GUIDE_MAX_EMERGENCY_COUNT)
      .map((contact) => ({
        title: escapeHtml(contact.title.trim()),
        description: escapeHtml(contact.description.trim()),
        text: escapeHtml(contact.text.trim()),
        note: escapeHtml(contact.note.trim())
      }))
      .filter((contact) => contact.title || contact.description || contact.text || contact.note)
  }
}

function emergencyContactHtml(contact: EmergencyPageContent["contacts"][number], index: number) {
  const number = index + 1

  return `<article class="wg-emergency__item">
    <span class="wg-emergency__num" aria-hidden="true">${number}</span>
    <div class="wg-emergency__copy">
      ${contact.title ? `<h3 class="wg-emergency__item-title">${contact.title}</h3>` : ""}
      ${contact.description ? `<p class="wg-emergency__item-desc">${contact.description}</p>` : ""}
      ${
        contact.text || contact.note
          ? `<div class="wg-emergency__phone">
              ${
                contact.text
                  ? `<p class="wg-emergency__item-number">
                      <span class="wg-emergency__item-number-icon" aria-hidden="true">${WG_ICON_PHONE}</span>
                      <span class="wg-emergency__item-number-text">${contact.text}</span>
                    </p>`
                  : ""
              }
              ${contact.note ? `<p class="wg-emergency__item-note">${contact.note}</p>` : ""}
            </div>`
          : ""
      }
    </div>
  </article>`
}

type PlacesPageContent = {
  city: string
  title: string
  places: Array<{
    imageUrl: string
    title: string
    description: string
    address: string
  }>
}

function buildPlacesPageContent(
  property: PropertyAdminRecord,
  guide: PropertyWelcomeGuide,
  assets: WelcomeGuideAssetContext
): PlacesPageContent {
  return {
    city: escapeHtml(guide.places_city.trim() || guide.cover_subtitle.trim() || "Votre ville"),
    title: escapeHtml(guide.places_title.trim() || "Lieux à visiter"),
    places: (guide.places ?? [])
      .slice(0, WELCOME_GUIDE_MAX_PLACE_COUNT)
      .map((place, index) => ({
        imageUrl: assetUrl(
          property,
          resolveWelcomeGuidePlaceImagePath(place.image_path, index),
          assets.supabaseUrl,
          assets.assetRevision,
          assets.previewNonce
        ),
        title: escapeHtml(place.title.trim()),
        description: escapeHtml(place.description.trim()),
        address: escapeHtml(place.address.trim())
      }))
      .filter((place) => place.title || place.description || place.address || place.imageUrl)
  }
}

function placeItemHtml(place: PlacesPageContent["places"][number]) {
  const photoStyle = place.imageUrl
    ? ` style="background-image:url('${escapeHtml(place.imageUrl)}')"`
    : ""

  return `<article class="wg-places__item">
    <div class="wg-places__media wg-photo"${photoStyle} role="img" aria-label="${place.title || "Lieu"}"></div>
    <div class="wg-places__copy">
      ${place.title ? `<h2 class="wg-places__item-title">${place.title}</h2>` : ""}
      ${place.address ? `<p class="wg-places__item-address">${place.address}</p>` : ""}
      ${place.description ? `<p class="wg-places__item-desc">${place.description}</p>` : ""}
    </div>
  </article>`
}

function placesPageHtml(p: PlacesPageContent) {
  const items = p.places.map((place) => placeItemHtml(place)).join("")

  return `
  <section class="wg-page wg-places">
    <header class="wg-places__head">
      <p class="wg-places__city">${p.city}</p>
      <div class="wg-places__title-row" aria-hidden="true">
        <span class="wg-places__line"></span>
        <h1 class="wg-places__title">${p.title}</h1>
        <span class="wg-places__line"></span>
      </div>
    </header>
    <div class="wg-places__list">${items}</div>
  </section>`
}

type DiningPageContent = {
  eyebrow: string
  banner: string
  intro: string
  imageUrl: string
  spots: Array<{ title: string; description: string; text: string; note: string }>
}

function buildDiningPageContent(
  property: PropertyAdminRecord,
  guide: PropertyWelcomeGuide,
  assets: WelcomeGuideAssetContext
): DiningPageContent {
  const imagePath = resolveWelcomeGuideDiningImagePath(guide.dining_image_path, property)

  return {
    eyebrow: escapeHtml(guide.dining_eyebrow.trim() || "Se restaurer"),
    banner: escapeHtml(guide.dining_banner.trim() || "ou boire un verre"),
    intro: escapeHtml(
      guide.dining_intro.trim() ||
        "Nos adresses préférées pour un café, un déjeuner ou un verre en soirée — à proximité du logement."
    ),
    imageUrl: assetUrl(
      property,
      imagePath,
      assets.supabaseUrl,
      assets.assetRevision,
      assets.previewNonce
    ),
    spots: (guide.dining_spots ?? [])
      .slice(0, WELCOME_GUIDE_MAX_DINING_COUNT)
      .map((spot) => ({
        title: escapeHtml(spot.title.trim()),
        description: escapeHtml(spot.description.trim()),
        text: escapeHtml(spot.text.trim()),
        note: escapeHtml(spot.note.trim())
      }))
      .filter((spot) => spot.title || spot.description || spot.text || spot.note)
  }
}

function diningSpotHtml(spot: DiningPageContent["spots"][number]) {
  return `<article class="wg-dining__item">
    <div class="wg-dining__item-body">
      ${spot.title ? `<h3 class="wg-dining__item-title">${spot.title}</h3>` : ""}
      ${spot.description ? `<p class="wg-dining__item-desc">${spot.description}</p>` : ""}
      ${
        spot.text || spot.note
          ? `<div class="wg-dining__meta">
              ${
                spot.text
                  ? `<p class="wg-dining__item-address">
                      <span class="wg-dining__item-address-icon" aria-hidden="true">${WG_ICON_MAP_PIN}</span>
                      <span class="wg-dining__item-address-text">${spot.text}</span>
                    </p>`
                  : ""
              }
              ${spot.note ? `<p class="wg-dining__item-note">${spot.note}</p>` : ""}
            </div>`
          : ""
      }
    </div>
  </article>`
}

function diningPageHtml(d: DiningPageContent) {
  const photoStyle = d.imageUrl
    ? ` style="background-image:url('${escapeHtml(d.imageUrl)}')"`
    : ""
  const items = d.spots.map((spot) => diningSpotHtml(spot)).join("")

  return `
  <section class="wg-page wg-dining">
    <div class="wg-dining__photo wg-photo"${photoStyle} role="img" aria-label="Ambiance restauration"></div>
    <div class="wg-dining__panel">
      <header class="wg-dining__head">
        <p class="wg-dining__eyebrow">${d.eyebrow}</p>
        <div class="wg-dining__banner-row" aria-hidden="true">
          <span class="wg-dining__line"></span>
          <div class="wg-dining__banner"><span>${d.banner}</span></div>
          <span class="wg-dining__line"></span>
        </div>
      </header>
      ${d.intro ? `<p class="wg-dining__intro">${d.intro}</p>` : ""}
      <div class="wg-dining__list">${items}</div>
    </div>
  </section>`
}

function emergencyPageHtml(e: EmergencyPageContent) {
  const photoStyle = e.imageUrl
    ? ` style="background-image:url('${escapeHtml(e.imageUrl)}')"`
    : ""
  const items = e.contacts.map((contact, index) => emergencyContactHtml(contact, index)).join("")

  return `
  <section class="wg-page wg-emergency">
    <div class="wg-emergency__upper">
      <header class="wg-emergency__head">
        <p class="wg-emergency__eyebrow">${e.eyebrow}</p>
        <div class="wg-emergency__banner-row" aria-hidden="true">
          <span class="wg-emergency__line"></span>
          <div class="wg-emergency__banner"><span>${e.banner}</span></div>
          <span class="wg-emergency__line"></span>
        </div>
      </header>
      ${e.intro ? `<p class="wg-emergency__intro">${e.intro}</p>` : ""}
      <div class="wg-emergency__grid">${items}</div>
    </div>
    <div class="wg-emergency__photo wg-photo"${photoStyle} role="img" aria-label="Photo du logement"></div>
  </section>`
}

function welcomeGuideTextBlocksHtml(text: string) {
  return text
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(escapeHtml)
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("")
}

type CheckoutPageContent = {
  title: string
  banner: string
  important: string
  footer: string
  items: Array<{ icon: WelcomeGuideRuleIcon; title: string; description: string }>
}

function buildCheckoutPageContent(guide: PropertyWelcomeGuide): CheckoutPageContent {
  const importantDefault =
    "Merci de suivre attentivement chaque étape ci-dessous : elle compte pour les voyageurs qui vous succéderont, pour notre équipe d’entretien et pour que le logement reste accueillant."

  return {
    title: escapeHtml(guide.checkout_title.trim() || "Check-out"),
    banner: escapeHtml(guide.checkout_banner.trim() || "• Avant de partir •"),
    important: welcomeGuideTextBlocksHtml(
      guide.checkout_important.trim() || importantDefault
    ),
    footer: escapeHtml(
      guide.checkout_footer.trim() || "Merci pour votre séjour — au plaisir de vous accueillir à nouveau !"
    ),
    items: (guide.checkout_items ?? [])
      .slice(0, WELCOME_GUIDE_MAX_CHECKOUT_COUNT)
      .map((item) => ({
        icon: normalizeWelcomeGuideRuleIcon(item.icon),
        title: escapeHtml(item.title.trim()),
        description: escapeHtml(item.description.trim())
      }))
      .filter((item) => item.title || item.description)
  }
}

function checkoutItemHtml(item: CheckoutPageContent["items"][number]) {
  const icon = welcomeGuideRuleIconSvgHtml(item.icon)

  return `<article class="wg-checkout__item">
    <div class="wg-checkout__icon" aria-hidden="true">${icon}</div>
    <div class="wg-checkout__copy">
      ${item.title ? `<h3 class="wg-checkout__item-title">${item.title}</h3>` : ""}
      ${item.description ? `<p class="wg-checkout__item-desc">${item.description}</p>` : ""}
    </div>
  </article>`
}

function checkoutPageHtml(c: CheckoutPageContent) {
  const items = c.items.map((item) => checkoutItemHtml(item)).join("")

  return `
  <section class="wg-page wg-checkout">
    <div class="wg-checkout__top">
      <header class="wg-checkout__head">
        <h1 class="wg-checkout__title">${c.title}</h1>
        ${c.banner ? `<p class="wg-checkout__subtitle">${c.banner}</p>` : ""}
        <hr class="wg-checkout__divider wg-checkout__divider--head" aria-hidden="true" />
      </header>
      ${
        c.important
          ? `<aside class="wg-checkout__important">
        <p class="wg-checkout__important-label">Très important</p>
        <div class="wg-checkout__important-body">${c.important}</div>
      </aside>`
          : ""
      }
    </div>
    <div class="wg-checkout__grid">${items}</div>
    <div class="wg-checkout__bottom">
      <footer class="wg-checkout__closing">
        ${c.footer ? `<p class="wg-checkout__closing-text">${c.footer}</p>` : ""}
      </footer>
    </div>
  </section>`
}

function rulesPageHtml(r: RulesPageContent) {
  const visibleRules = r.rules.filter((rule) => rule.title || rule.text)
  const items = visibleRules
    .map((rule, index) => rulesRuleHtml(rule, index === visibleRules.length - 1))
    .join("")

  return `
  <section class="wg-page wg-rules">
    <header class="wg-rules__head">
      <h1 class="wg-rules__title">${r.title}</h1>
      ${r.banner ? `<p class="wg-rules__subtitle">${r.banner}</p>` : ""}
      <hr class="wg-rules__divider wg-rules__divider--head" aria-hidden="true" />
      <span class="wg-rules__heart wg-rules__heart--solid" aria-hidden="true">${WG_RULE_HEART_SOLID}</span>
    </header>
    <div class="wg-rules__list">${items}</div>
    <footer class="wg-rules__closing">
      ${r.footer ? `<p class="wg-rules__closing-text">${r.footer}</p>` : ""}
      <span class="wg-rules__heart wg-rules__heart--outline" aria-hidden="true">${WG_RULE_HEART_OUTLINE}</span>
    </footer>
  </section>`
}

export function welcomeGuidePreviewStyles(property: PropertyAdminRecord) {
  return welcomeGuideSharedStyles(resolvePropertyInvoiceTheme(property))
}

function welcomeGuideSharedStyles(theme = resolvePropertyInvoiceTheme({})) {
  const themeVars = welcomeGuideThemeCssVarsBlock(theme)

  return `
    :root {
      --wg-script: "Dancing Script", "Cormorant Garamond", cursive;
      --wg-serif: "Cormorant Garamond", "Times New Roman", Georgia, serif;
      --wg-sans: "Inter", system-ui, sans-serif;
      ${themeVars}
      --wg-cover-inset: 10mm;
      --wg-a4-width: ${WELCOME_GUIDE_A4_WIDTH_PX}px;
      --wg-a4-height: ${WELCOME_GUIDE_A4_HEIGHT_PX}px;
    }
    html {
      width: var(--wg-a4-width);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page {
      size: 210mm 297mm;
      margin: 0;
    }
    body,
    .wg-preview-shell {
      margin: 0;
      background: var(--wg-page);
      font-family: var(--wg-serif);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 14px 0 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .wg-page {
      width: var(--wg-a4-width);
      max-width: var(--wg-a4-width);
      height: var(--wg-a4-height);
      max-height: var(--wg-a4-height);
      flex: 0 0 var(--wg-a4-height);
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      background: var(--wg-paper);
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18);
      page-break-after: always;
      break-after: page;
    }
    .wg-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .wg-page.wg-cover,
    .wg-page.wg-welcome,
    .wg-page.wg-rules,
    .wg-page.wg-emergency,
    .wg-page.wg-places,
    .wg-page.wg-dining,
    .wg-page.wg-checkout {
      max-height: 100%;
      height: 100%;
      overflow: hidden;
    }
    @media print {
      :root {
        --wg-a4-width: 210mm;
        --wg-a4-height: 297mm;
      }
      body,
      .wg-preview-shell {
        display: block;
        padding: 0;
        gap: 0;
        background: #fff;
      }
      .wg-page {
        width: 210mm;
        max-width: 210mm;
        height: 297mm;
        max-height: 297mm;
        flex-basis: 297mm;
        margin: 0;
        box-shadow: none;
        page-break-after: always;
        break-after: page;
      }
      .wg-page:last-child {
        page-break-after: auto;
        break-after: auto;
      }
    }

    /* PDF Chromium : une section .wg-page = une feuille A4 (pas de gap ni px). */
    html.wg-pdf {
      width: 210mm;
    }
    html.wg-pdf body {
      display: block;
      width: 210mm;
      padding: 0;
      margin: 0;
      gap: 0;
      background: #fff;
    }
    html.wg-pdf .wg-page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      flex: none;
      margin: 0;
      box-shadow: none;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
      page-break-after: avoid;
      break-after: avoid;
    }
    html.wg-pdf .wg-page + .wg-page {
      page-break-before: always;
      break-before: page;
    }
    html.wg-pdf .wg-page.wg-cover,
    html.wg-pdf .wg-page.wg-welcome,
    html.wg-pdf .wg-page.wg-rules,
    html.wg-pdf .wg-page.wg-emergency,
    html.wg-pdf .wg-page.wg-places,
    html.wg-pdf .wg-page.wg-dining,
    html.wg-pdf .wg-page.wg-checkout {
      height: 297mm;
      max-height: 297mm;
    }

    .wg-photo {
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-color: var(--wg-photo-placeholder);
    }

    .wg-cover {
      background: var(--wg-paper);
    }
    .wg-cover__frame {
      position: absolute;
      inset: var(--wg-cover-inset);
      overflow: hidden;
    }
    .wg-cover__bg {
      position: absolute;
      inset: 0;
    }
    .wg-cover__overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.58) 0%,
        rgba(0, 0, 0, 0.28) 28%,
        rgba(0, 0, 0, 0.18) 48%,
        rgba(0, 0, 0, 0.32) 72%,
        rgba(0, 0, 0, 0.62) 100%
      );
      box-shadow:
        inset 0 0 90px rgba(0, 0, 0, 0.42),
        inset 0 -48px 72px rgba(0, 0, 0, 0.38);
    }
    .wg-cover__content {
      position: absolute;
      inset: 0;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16mm 14mm;
      text-align: center;
      color: #fff;
      pointer-events: none;
    }
    .wg-cover__headlines {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 170mm;
      filter:
        drop-shadow(0 8px 32px rgba(0, 0, 0, 0.32))
        drop-shadow(0 20px 56px rgba(0, 0, 0, 0.24))
        drop-shadow(0 36px 80px rgba(0, 0, 0, 0.16));
    }
    .wg-cover__title {
      font-family: var(--wg-script);
      font-size: 8rem;
      font-weight: 600;
      line-height: 1.05;
      letter-spacing: 0.01em;
      text-shadow:
        0 0 18px rgba(0, 0, 0, 0.42),
        0 0 42px rgba(0, 0, 0, 0.32),
        0 0 72px rgba(0, 0, 0, 0.22),
        0 6px 36px rgba(0, 0, 0, 0.28);
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
      max-width: 100%;
    }
    .wg-cover__subtitle {
      margin-top: 50px;
      font-family: var(--wg-serif);
      font-size: 1.72rem;
      font-weight: 500;
      line-height: 1.25;
      text-shadow:
        0 0 14px rgba(0, 0, 0, 0.4),
        0 0 32px rgba(0, 0, 0, 0.3),
        0 0 52px rgba(0, 0, 0, 0.2),
        0 4px 28px rgba(0, 0, 0, 0.26);
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
      max-width: 100%;
    }

    .wg-welcome {
      display: flex;
      flex-direction: row;
      min-height: 100%;
      height: 100%;
      color: var(--wg-ink);
    }
    .wg-welcome__sidebar {
      flex: 0 0 34%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 14mm 7mm 0;
      background: var(--wg-rose);
      text-align: center;
    }
    .wg-welcome__host-photo {
      width: 52mm;
      height: 52mm;
      border-radius: 50%;
      border: 7px solid #fff;
      flex-shrink: 0;
    }
    .wg-welcome__host-name {
      margin-top: 5mm;
      font-family: var(--wg-script);
      font-size: 2.85rem;
      font-weight: 600;
      line-height: 1.1;
      color: var(--wg-ink);
    }
    .wg-welcome__host-heading {
      margin-top: 4mm;
      font-family: var(--wg-serif);
      font-size: 0.88rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      line-height: 1.35;
    }
    .wg-welcome__bio {
      margin-top: 4mm;
      font-size: 0.94rem;
      line-height: 1.55;
      text-align: left;
      width: 100%;
      padding: 0 1mm;
      flex: 1;
    }
    .wg-welcome__contact {
      margin-top: auto;
      width: calc(100% + 14mm);
      margin-left: -7mm;
      margin-right: -7mm;
      margin-bottom: 0;
      padding: 4.5mm 5mm 5mm;
      background: var(--wg-burgundy);
      color: var(--wg-accent-text);
      font-family: var(--wg-sans);
      font-size: 0.78rem;
      line-height: 1.45;
      letter-spacing: 0.02em;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .wg-welcome__contact-title {
      margin: 0 0 2.5mm;
      font-size: 0.84rem;
      line-height: 1.3;
    }
    .wg-welcome__contact-title strong {
      font-weight: 700;
    }
    .wg-welcome__contact-lines {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5mm;
      width: 100%;
    }
    .wg-welcome__contact-line {
      margin: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 1.5mm;
      flex-wrap: wrap;
    }
    .wg-welcome__contact-icon {
      display: inline-flex;
      width: 3.8mm;
      height: 3.8mm;
      flex-shrink: 0;
    }
    .wg-welcome__contact-icon svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .wg-welcome__contact-value {
      font-weight: 400;
    }

    .wg-welcome__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 12mm 11mm 0 10mm;
      min-width: 0;
      box-sizing: border-box;
    }
    .wg-welcome__main-bottom {
      margin-top: auto;
      flex-shrink: 0;
      width: calc(100% + 10mm);
      margin-left: -10mm;
      margin-right: -11mm;
    }
    .wg-welcome__header {
      text-align: center;
    }
    .wg-welcome__eyebrow {
      font-family: var(--wg-serif);
      font-size: 0.88rem;
      font-weight: 600;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--wg-burgundy);
    }
    .wg-welcome__banner {
      margin-top: 3mm;
      padding: 3.5mm 8mm;
      background: var(--wg-burgundy);
      display: inline-block;
      width: 100%;
      max-width: 100%;
    }
    .wg-welcome__banner span {
      display: block;
      font-family: var(--wg-serif);
      font-size: 2.6rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--wg-accent-text);
      line-height: 1.05;
    }
    .wg-welcome__salutation {
      margin-top: 7mm;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .wg-welcome__body {
      margin-top: 5mm;
      font-size: 1rem;
      line-height: 1.65;
    }
    .wg-welcome__body p + p {
      margin-top: 3.5mm;
    }
    .wg-welcome__main-bottom .wg-welcome__signature {
      margin-top: 0;
    }
    .wg-welcome__main-bottom .wg-welcome__wifi {
      margin-top: 3mm;
      margin-bottom: 0;
      border-left: none;
      border-right: none;
      border-bottom: none;
      border-radius: 0;
    }
    .wg-welcome__main .wg-welcome__wifi {
      flex-shrink: 0;
      padding: 5mm 11mm 5mm 10mm;
      background: var(--wg-rose);
      border: 1px solid rgba(139, 58, 58, 0.18);
      text-align: left;
      color: var(--wg-ink);
    }
    .wg-welcome__main .wg-welcome__wifi-title {
      margin: 0 0 3.5mm;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 2.5mm;
      font-family: var(--wg-serif);
      font-size: 0.88rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--wg-burgundy);
    }
    .wg-welcome__main .wg-welcome__wifi-title strong {
      font-weight: 800;
    }
    .wg-welcome__main .wg-welcome__wifi-icon {
      display: inline-flex;
      width: 4.8mm;
      height: 4.8mm;
      flex-shrink: 0;
      color: var(--wg-burgundy);
    }
    .wg-welcome__main .wg-welcome__wifi-icon svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .wg-welcome__main .wg-welcome__wifi-details {
      margin: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4mm 8mm;
    }
    .wg-welcome__main .wg-welcome__wifi-row {
      display: flex;
      flex-direction: column;
      gap: 1mm;
      min-width: 0;
      font-family: var(--wg-sans);
      font-size: 0.82rem;
      line-height: 1.4;
    }
    .wg-welcome__main .wg-welcome__wifi-row dt {
      margin: 0;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-size: 0.72rem;
      color: var(--wg-muted);
    }
    .wg-welcome__main .wg-welcome__wifi-row dd {
      margin: 0;
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--wg-ink);
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .wg-welcome__signature {
      margin-top: 4mm;
      text-align: right;
      font-family: var(--wg-script);
      font-size: 1.95rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .wg-rules {
      display: flex;
      flex-direction: column;
      color: var(--wg-ink);
      background: var(--wg-paper);
      padding: 12mm 14mm 10mm;
    }
    .wg-rules__head {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-bottom: 2mm;
    }
    .wg-rules__title {
      font-family: var(--wg-serif);
      font-size: 2.85rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      line-height: 1.08;
      color: var(--wg-burgundy);
    }
    .wg-rules__subtitle {
      margin-top: 4mm;
      font-family: var(--wg-serif);
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      line-height: 1.4;
      color: var(--wg-burgundy);
    }
    .wg-rules__divider {
      border: none;
      border-top: 1px solid var(--wg-burgundy);
      opacity: 0.35;
      margin: 0;
      width: 100%;
    }
    .wg-rules__divider--head {
      margin-top: 5mm;
    }
    .wg-rules__heart {
      display: flex;
      color: var(--wg-burgundy);
    }
    .wg-rules__heart svg {
      display: block;
    }
    .wg-rules__heart--solid {
      margin-top: 4mm;
      width: 6mm;
      height: 6mm;
    }
    .wg-rules__heart--solid svg {
      width: 100%;
      height: 100%;
    }
    .wg-rules__heart--outline {
      margin-top: 5mm;
      width: 6.5mm;
      height: 6.5mm;
    }
    .wg-rules__heart--outline svg {
      width: 100%;
      height: 100%;
    }
    .wg-rules__list {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 5mm 2mm 3mm;
      min-height: 0;
    }
    .wg-rules__item {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 6mm;
      padding: 4.5mm 0;
      text-align: left;
    }
    .wg-rules__icon {
      width: 15mm;
      height: 15mm;
      border-radius: 50%;
      background: var(--wg-burgundy);
      color: var(--wg-accent-text);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .wg-rules__icon svg {
      width: 56%;
      height: 56%;
      display: block;
    }
    .wg-rules__copy {
      flex: 1;
      min-width: 0;
      padding-top: 1mm;
    }
    .wg-rules__item-title {
      font-family: var(--wg-serif);
      font-size: 1.14rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      line-height: 1.28;
      color: var(--wg-ink);
    }
    .wg-rules__item-text {
      margin-top: 2mm;
      font-family: var(--wg-serif);
      font-size: 1.06rem;
      font-weight: 400;
      line-height: 1.6;
      color: var(--wg-ink);
    }
    .wg-rules__closing {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-top: 2mm;
      padding: 6mm 8mm 4mm;
      background: var(--wg-rose);
    }
    .wg-rules__closing-text {
      max-width: 150mm;
      font-family: var(--wg-script);
      font-size: 2rem;
      font-weight: 600;
      line-height: 1.4;
      color: var(--wg-ink);
    }

    .wg-checkout {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      min-height: 100%;
      height: 100%;
      box-sizing: border-box;
      color: var(--wg-ink);
      background: var(--wg-paper);
      padding: 12mm 14mm 10mm;
    }
    .wg-checkout__top {
      flex-shrink: 0;
      width: 100%;
    }
    .wg-checkout__bottom {
      flex-shrink: 0;
      width: 100%;
      margin-top: auto;
    }
    .wg-checkout__head {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-bottom: 2mm;
    }
    .wg-checkout__title {
      font-family: var(--wg-serif);
      font-size: 2.85rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      line-height: 1.08;
      color: var(--wg-burgundy);
    }
    .wg-checkout__subtitle {
      margin-top: 4mm;
      font-family: var(--wg-serif);
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      line-height: 1.4;
      color: var(--wg-burgundy);
    }
    .wg-checkout__divider {
      border: none;
      border-top: 1px solid var(--wg-burgundy);
      opacity: 0.35;
      margin: 0;
      width: 100%;
    }
    .wg-checkout__divider--head {
      margin-top: 5mm;
    }
    .wg-checkout__important {
      flex-shrink: 0;
      margin: 0 0 4mm;
      padding: 4.5mm 5.5mm;
      border-left: 2.5px solid var(--wg-burgundy);
      background: rgba(139, 58, 58, 0.07);
      text-align: left;
    }
    .wg-checkout__important-label {
      margin: 0 0 2mm;
      font-family: var(--wg-serif);
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--wg-burgundy);
    }
    .wg-checkout__important-body {
      font-family: var(--wg-serif);
      font-size: 0.88rem;
      font-weight: 400;
      line-height: 1.48;
      color: var(--wg-ink);
    }
    .wg-checkout__important-body p {
      margin: 0;
    }
    .wg-checkout__important-body p + p {
      margin-top: 2mm;
    }
    .wg-checkout__grid {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(4, auto);
      column-gap: 9mm;
      row-gap: 15mm;
      align-content: center;
      padding: 3mm 2mm;
    }
    .wg-checkout__item {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 4mm;
      text-align: left;
    }
    .wg-checkout__icon {
      width: 16mm;
      height: 16mm;
      border-radius: 50%;
      background: rgba(139, 58, 58, 0.12);
      color: var(--wg-burgundy);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .wg-checkout__icon svg {
      width: 56%;
      height: 56%;
      display: block;
    }
    .wg-checkout__copy {
      flex: 1;
      min-width: 0;
      padding-top: 1mm;
    }
    .wg-checkout__item-title {
      font-family: var(--wg-serif);
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      line-height: 1.28;
      color: var(--wg-ink);
    }
    .wg-checkout__item-desc {
      margin-top: 2.5mm;
      font-family: var(--wg-serif);
      font-size: 0.98rem;
      font-weight: 400;
      line-height: 1.52;
      color: var(--wg-muted);
    }
    .wg-checkout__closing {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-top: 5mm;
      padding: 6mm 8mm 4mm;
      background: var(--wg-rose);
    }
    .wg-checkout__closing-text {
      max-width: 150mm;
      font-family: var(--wg-script);
      font-size: 2rem;
      font-weight: 600;
      line-height: 1.4;
      color: var(--wg-ink);
    }

    .wg-emergency {
      display: flex;
      flex-direction: column;
      color: var(--wg-ink);
      background: var(--wg-paper);
    }
    .wg-emergency__upper {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 10mm 12mm 4mm;
    }
    .wg-emergency__head {
      text-align: center;
    }
    .wg-emergency__eyebrow {
      font-family: var(--wg-serif);
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--wg-burgundy);
      line-height: 1.3;
    }
    .wg-emergency__banner-row {
      display: flex;
      align-items: center;
      gap: 4mm;
      width: 100%;
      margin-top: 3.5mm;
    }
    .wg-emergency__line {
      flex: 1;
      height: 1px;
      background: var(--wg-burgundy);
      opacity: 0.4;
    }
    .wg-emergency__banner {
      flex-shrink: 0;
      padding: 3.2mm 9mm;
      background: var(--wg-burgundy);
    }
    .wg-emergency__banner span {
      display: block;
      font-family: var(--wg-serif);
      font-size: 2.35rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--wg-accent-text);
      line-height: 1.05;
      white-space: nowrap;
    }
    .wg-emergency__intro {
      margin: 4mm auto 4mm;
      max-width: 168mm;
      text-align: center;
      font-family: var(--wg-serif);
      font-style: italic;
      font-size: 0.92rem;
      font-weight: 400;
      line-height: 1.5;
      color: var(--wg-ink);
      flex-shrink: 0;
    }
    .wg-emergency__grid {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: auto;
      column-gap: 9mm;
      row-gap: 6.5mm;
      align-content: center;
      padding: 2mm 2mm 7mm;
      min-height: 0;
    }
    .wg-emergency__item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 5mm;
      min-width: 0;
      padding: 1.6mm 0;
    }
    .wg-emergency__num {
      width: 16mm;
      height: 16mm;
      border-radius: 50%;
      background: var(--wg-burgundy);
      color: var(--wg-accent-text);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-family: var(--wg-script);
      font-size: 2.05rem;
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0;
      text-align: center;
      padding: 0;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
    }
    .wg-emergency__copy {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1.2mm;
    }
    .wg-emergency__item-title {
      font-family: var(--wg-serif);
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      line-height: 1.22;
      color: var(--wg-ink);
    }
    .wg-emergency__item-desc {
      font-family: var(--wg-serif);
      font-size: 0.98rem;
      font-weight: 400;
      line-height: 1.45;
      color: var(--wg-ink);
    }
    .wg-emergency__phone {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: flex-start;
      gap: 0.8mm;
      margin-top: 0.6mm;
      max-width: 100%;
    }
    .wg-emergency__item-number {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 2.2mm;
      padding: 1.8mm 4.5mm 1.8mm 3.5mm;
      border-radius: 999px;
      background: rgba(139, 58, 58, 0.12);
      font-family: var(--wg-serif);
      font-size: 1.14rem;
      font-weight: 700;
      line-height: 1;
      color: var(--wg-burgundy);
      max-width: 100%;
    }
    .wg-emergency__item-number-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.05em;
      height: 1.05em;
      color: var(--wg-burgundy);
      transform: translateY(0.04em);
    }
    .wg-emergency__item-number-icon svg {
      display: block;
      width: 0.95em;
      height: 0.95em;
      margin: 0;
    }
    .wg-emergency__item-number-text {
      min-width: 0;
      line-height: 1;
      padding-top: 0.02em;
    }
    .wg-emergency__item-note {
      padding-left: 1mm;
      font-family: var(--wg-serif);
      font-size: 0.76rem;
      font-weight: 400;
      font-style: italic;
      line-height: 1.35;
      color: var(--wg-muted);
      max-width: 100%;
    }
    .wg-emergency__photo {
      flex-shrink: 0;
      width: 100%;
      height: 78mm;
    }

    .wg-dining {
      display: grid;
      grid-template-columns: 38% 62%;
      align-items: stretch;
      color: var(--wg-ink);
      background: var(--wg-paper);
      height: 100%;
      min-height: 100%;
    }
    .wg-dining__photo {
      min-height: 100%;
      height: 100%;
    }
    .wg-dining__panel {
      display: flex;
      flex-direction: column;
      min-height: 0;
      padding: 11mm 10mm 10mm 9mm;
    }
    .wg-dining__head {
      flex-shrink: 0;
      text-align: center;
    }
    .wg-dining__eyebrow {
      font-family: var(--wg-sans);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.34em;
      text-transform: uppercase;
      color: var(--wg-burgundy);
      line-height: 1.3;
    }
    .wg-dining__banner-row {
      display: flex;
      align-items: center;
      gap: 3.5mm;
      width: 100%;
      margin-top: 2.5mm;
    }
    .wg-dining__line {
      flex: 1;
      height: 1px;
      background: var(--wg-burgundy);
      opacity: 0.42;
    }
    .wg-dining__banner {
      flex-shrink: 0;
      max-width: 72%;
    }
    .wg-dining__banner span {
      display: block;
      font-family: var(--wg-script);
      font-size: 2.35rem;
      font-weight: 600;
      line-height: 1.05;
      color: var(--wg-burgundy);
      white-space: nowrap;
    }
    .wg-dining__intro {
      flex-shrink: 0;
      margin: 4.5mm 0 5mm;
      font-family: var(--wg-sans);
      font-size: 0.78rem;
      font-weight: 400;
      line-height: 1.5;
      text-align: center;
      color: var(--wg-muted);
    }
    .wg-dining__list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2.6mm;
      min-height: 0;
      overflow: hidden;
    }
    .wg-dining__item {
      flex-shrink: 0;
      padding-left: 3.5mm;
      border-left: 2px solid var(--wg-burgundy);
    }
    .wg-dining__item-title {
      font-family: var(--wg-serif);
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      line-height: 1.2;
      color: var(--wg-ink);
    }
    .wg-dining__item-desc {
      margin-top: 0.8mm;
      font-family: var(--wg-sans);
      font-size: 0.7rem;
      font-weight: 400;
      line-height: 1.38;
      color: var(--wg-muted);
    }
    .wg-dining__meta {
      margin-top: 2mm;
    }
    .wg-dining__item-address {
      display: flex;
      align-items: flex-start;
      gap: 2mm;
      font-family: var(--wg-sans);
      font-size: 0.72rem;
      font-weight: 500;
      line-height: 1.35;
      color: var(--wg-burgundy);
    }
    .wg-dining__item-address-icon {
      flex-shrink: 0;
      width: 3.2mm;
      height: 3.2mm;
      margin-top: 0.4mm;
      color: var(--wg-burgundy);
    }
    .wg-dining__item-address-icon svg {
      display: block;
      width: 100%;
      height: 100%;
    }
    .wg-dining__item-note {
      margin-top: 1mm;
      font-family: var(--wg-sans);
      font-size: 0.68rem;
      font-weight: 400;
      font-style: italic;
      line-height: 1.35;
      color: var(--wg-muted);
    }

    .wg-places {
      display: flex;
      flex-direction: column;
      color: var(--wg-ink);
      background: var(--wg-paper);
      padding: 11mm 12mm 10mm;
    }
    .wg-places__head {
      flex-shrink: 0;
      text-align: center;
      padding-bottom: 5mm;
    }
    .wg-places__city {
      font-family: var(--wg-sans);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: var(--wg-burgundy);
      line-height: 1.3;
    }
    .wg-places__title-row,
    .wg-places__foot-row {
      display: flex;
      align-items: center;
      gap: 4mm;
      width: 100%;
    }
    .wg-places__title-row {
      margin-top: 3.5mm;
    }
    .wg-places__line {
      flex: 1;
      height: 1px;
      background: var(--wg-burgundy);
      opacity: 0.42;
    }
    .wg-places__title {
      flex-shrink: 0;
      font-family: var(--wg-serif);
      font-size: 2.15rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      line-height: 1.05;
      color: var(--wg-burgundy);
      white-space: nowrap;
      padding: 0 2mm;
    }
    .wg-places__list {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 5mm;
      min-height: 0;
      padding: 2mm 0 4mm;
    }
    .wg-places__item {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 5.5mm;
      min-height: 0;
    }
    .wg-places__media {
      width: 46%;
      max-width: 88mm;
      min-height: 46mm;
      flex-shrink: 0;
      border-radius: 0;
    }
    .wg-places__copy {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding-top: 0.5mm;
    }
    .wg-places__item-title {
      font-family: var(--wg-serif);
      font-size: 1.02rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      line-height: 1.2;
      color: var(--wg-ink);
    }
    .wg-places__item-address {
      margin-top: 1.8mm;
      font-family: var(--wg-sans);
      font-size: 0.72rem;
      font-weight: 400;
      font-style: italic;
      line-height: 1.35;
      color: var(--wg-muted);
    }
    .wg-places__item-desc {
      margin-top: 2.5mm;
      font-family: var(--wg-sans);
      font-size: 0.8rem;
      font-weight: 400;
      line-height: 1.48;
      color: var(--wg-muted);
    }
    .wg-places__foot {
      flex-shrink: 0;
      padding-top: 4mm;
    }
    .wg-places__foot-text {
      flex-shrink: 0;
      font-family: var(--wg-sans);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--wg-burgundy);
      line-height: 1.3;
      white-space: nowrap;
      padding: 0 2mm;
    }
  `
}

export function buildWelcomeGuidePagesHtml(
  property: PropertyAdminRecord,
  guide: PropertyWelcomeGuide,
  options: WelcomeGuideHtmlOptions = {}
): string {
  const assets: WelcomeGuideAssetContext = {
    supabaseUrl: options.supabaseUrl?.trim() || "",
    assetRevision: options.assetRevision,
    previewNonce: options.previewNonce
  }
  const c = buildCoverContent(property, guide, assets)
  const w = buildWelcomePageContent(property, guide, assets)
  const r = buildRulesPageContent(guide)
  const e = buildEmergencyPageContent(property, guide, assets)
  const d = buildDiningPageContent(property, guide, assets)
  const p = buildPlacesPageContent(property, guide, assets)
  const co = buildCheckoutPageContent(guide)

  return [
    coverPageHtml(c),
    welcomePageHtml(w),
    rulesPageHtml(r),
    emergencyPageHtml(e),
    placesPageHtml(p),
    diningPageHtml(d),
    checkoutPageHtml(co)
  ].join("\n")
}

export function buildWelcomeGuideHtml(
  property: PropertyAdminRecord,
  guide: PropertyWelcomeGuide,
  options: WelcomeGuideHtmlOptions = {}
): string {
  const pages = buildWelcomeGuidePagesHtml(property, guide, options)
  const displayName = escapeHtml(welcomeGuideDisplayName(guide, property.brand_name))

  return `<!DOCTYPE html>
<html lang="fr" class="wg-pdf">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Guide d'accueil — ${displayName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Dancing+Script:wght@500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
  <style>${welcomeGuideSharedStyles(resolvePropertyInvoiceTheme(property))}</style>
</head>
<body>
${pages}
</body>
</html>`
}
