import type { HostivLocale } from "../../types/hostiv-locale"
import { adminCopySectionsEn } from "./copy.en"
import { adminCopySectionsFr } from "./copy.fr"
import { adminUiLabelsDomainsEn } from "./labels-domains.en"
import { adminUiLabelsDomainsFr } from "./labels-domains.fr"
import { adminUiLabelsExtendedEn } from "./labels-extended.en"
import { adminUiLabelsExtendedFr } from "./labels-extended.fr"
import { adminUiLabelsEn } from "./labels.en"
import { adminUiLabelsFr } from "./labels.fr"

function buildAdminUiBundle(
  labels: typeof adminUiLabelsFr,
  extended: typeof adminUiLabelsExtendedFr,
  domains: typeof adminUiLabelsDomainsFr,
  copy: typeof adminCopySectionsFr
) {
  const welcomeGuide = { ...extended.welcomeGuide, ...domains.welcomeGuide }
  const common = { ...labels.common, ...domains.common }
  const extendedMerged = {
    ...extended,
    ...domains,
    welcomeGuide,
    common
  }

  return {
    ...labels,
    ...extended,
    ...domains,
    welcomeGuide,
    common,
    extended: extendedMerged,
    copy
  }
}

const frBundle = buildAdminUiBundle(
  adminUiLabelsFr,
  adminUiLabelsExtendedFr,
  adminUiLabelsDomainsFr,
  adminCopySectionsFr
)

export type AdminUiContent = typeof frBundle

const bundles: Record<HostivLocale, AdminUiContent> = {
  fr: frBundle,
  en: buildAdminUiBundle(
    adminUiLabelsEn,
    adminUiLabelsExtendedEn,
    adminUiLabelsDomainsEn,
    adminCopySectionsEn
  )
}

export function getAdminUi(locale: HostivLocale): AdminUiContent {
  return bundles[locale]
}

export function adminUiFormat(
  template: string,
  values: Record<string, string | number>
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""))
}
