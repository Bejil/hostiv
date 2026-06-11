import type { HostivLocale } from "../types/hostiv-locale"
import type { HostivStaticPage, HostivStaticPageId } from "./hostiv-static-page.types"
import { hostivStaticPagesEn } from "./hostivStaticPages.en"
import { hostivStaticPagesFr } from "./hostivStaticPages.fr"

export type {
  HostivStaticPage,
  HostivStaticPageId,
  HostivStaticPageInfoBox,
  HostivStaticPageSection
} from "./hostiv-static-page.types"

const bundles: Record<HostivLocale, Record<HostivStaticPageId, HostivStaticPage>> = {
  fr: hostivStaticPagesFr,
  en: hostivStaticPagesEn
}

export function getHostivStaticPage(id: HostivStaticPageId, locale: HostivLocale = "fr") {
  return bundles[locale][id]
}
