import type { HostivLocale } from "../types/hostiv-locale"
import * as hostivLandingEn from "./hostivLanding.en"
import * as hostivLandingFr from "./hostivLanding.fr"

export type HostivPricingPlanId = hostivLandingFr.HostivPricingPlanId

function normalizeHostivLanding(bundle: typeof hostivLandingFr) {
  return {
    navUi: bundle.hostivNavUi,
    adminHeaderUi: bundle.hostivAdminHeaderUi,
    heroContent: bundle.hostivHeroContent,
    landingSections: bundle.hostivLandingSections,
    staticUi: bundle.hostivStaticUi,
    seo: bundle.hostivSeo,
    navLinks: bundle.hostivNavLinks,
    heroProofPoints: bundle.hostivHeroProofPoints,
    commissionCompare: bundle.hostivCommissionCompare,
    showcaseExamples: bundle.hostivShowcaseExamples,
    features: bundle.hostivFeatures,
    steps: bundle.hostivSteps,
    pricing: bundle.hostivPricing,
    cta: bundle.hostivCta,
    faqSection: bundle.hostivFaqSection,
    faqGroups: bundle.hostivFaqGroups,
    faqs: bundle.hostivFaqs,
    footer: bundle.hostivFooter,
    notFound: bundle.hostivNotFoundUi,
    accountModal: bundle.hostivAccountModalUi,
    contactModal: bundle.hostivContactModalUi,
    passwordResetPage: bundle.hostivPasswordResetPageUi
  }
}

export type HostivLandingContent = ReturnType<typeof normalizeHostivLanding>

const bundles: Record<HostivLocale, HostivLandingContent> = {
  fr: normalizeHostivLanding(hostivLandingFr),
  en: normalizeHostivLanding(hostivLandingEn)
}

export function getHostivLanding(locale: HostivLocale): HostivLandingContent {
  return bundles[locale]
}

/** Contenu marketing français par défaut (admin, e-mails produit, etc.). */
export const hostivNavUi = hostivLandingFr.hostivNavUi
export const hostivHeroContent = hostivLandingFr.hostivHeroContent
export const hostivLandingSections = hostivLandingFr.hostivLandingSections
export const hostivStaticUi = hostivLandingFr.hostivStaticUi
export const hostivSeo = hostivLandingFr.hostivSeo
export const hostivNavLinks = hostivLandingFr.hostivNavLinks
export const hostivHeroProofPoints = hostivLandingFr.hostivHeroProofPoints
export const hostivCommissionCompare = hostivLandingFr.hostivCommissionCompare
export const hostivShowcaseExamples = hostivLandingFr.hostivShowcaseExamples
export const hostivFeatures = hostivLandingFr.hostivFeatures
export const hostivSteps = hostivLandingFr.hostivSteps
export const hostivPricing = hostivLandingFr.hostivPricing
export const hostivCta = hostivLandingFr.hostivCta
export const hostivFooter = hostivLandingFr.hostivFooter
