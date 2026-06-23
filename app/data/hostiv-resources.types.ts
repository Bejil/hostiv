export type HostivResourceArticleId =
  | "passer-au-direct"
  | "sync-calendrier-ical"
  | "promouvoir-site-direct"
  | "configurer-stripe-connect"
  | "choisir-template-site"
  | "optimiser-fiche-logement"
  | "convertir-visiteurs"
  | "comparer-starter-pro"
  | "premiere-reservation-directe"
  | "factures-pdf"
  | "guide-accueil-voyageurs"
  | "referencement-site-direct"

export type HostivResourceArticleInlineLink = {
  articleId: HostivResourceArticleId
  label?: string
}

export type HostivResourceArticleSection = {
  title?: string
  paragraphs: string[]
  list?: string[]
  links?: HostivResourceArticleInlineLink[]
}

export type HostivResourceArticle = {
  id: HostivResourceArticleId
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  publishedAt: string
  readingMinutes: number
  sections: HostivResourceArticleSection[]
}

export type HostivResourcesIndexContent = {
  eyebrow: string
  title: string
  intro: string
  seoTitle: string
  seoDescription: string
  readMoreLabel: string
  backToIndexLabel: string
  readingTimeLabel: string
}
