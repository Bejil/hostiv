export type HostivStaticPageId =
  | "a-propos"
  | "contact"
  | "mentions-legales"
  | "politique-de-confidentialite"
  | "conditions-generales"

export type HostivStaticPageInfoBox = {
  title?: string
  paragraphs?: string[]
  list?: string[]
}

export type HostivStaticPageSection = {
  title?: string
  paragraphs: string[]
  list?: string[]
  info?: HostivStaticPageInfoBox
}

export type HostivStaticPage = {
  id: HostivStaticPageId
  path: string
  title: string
  description: string
  eyebrow: string
  lead: string
  sections: HostivStaticPageSection[]
  updatedAt?: string
}
