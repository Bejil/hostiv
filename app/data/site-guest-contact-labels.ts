import type { HostivLocale } from "../types/hostiv-locale"

export type SiteGuestContactLabels = {
  header: string
  title: string
  subtitle: string
  close: string
  fields: {
    name: string
    email: string
    message: string
    messagePlaceholder: string
  }
  submit: string
  submitting: string
  success: string
  successClose: string
  errors: {
    required: string
    nameTooShort: string
    messageTooShort: string
    sendFailed: string
  }
}

const GUEST_CONTACT_FR: SiteGuestContactLabels = {
  header: "Contact",
  title: "Contacter l’hôte",
  subtitle:
    "Posez votre question sur les dates, la capacité ou l’organisation de votre séjour. L’hôte vous répond par e-mail.",
  close: "Fermer",
  fields: {
    name: "Votre nom",
    email: "Votre e-mail",
    message: "Votre message",
    messagePlaceholder:
      "Ex. : sommes-nous bien 4 adultes pour ces dates ? Arrivée possible vers 18 h ?"
  },
  submit: "Envoyer le message",
  submitting: "Envoi en cours…",
  success: "Message envoyé. L’hôte vous répondra par e-mail.",
  successClose: "Fermer",
  errors: {
    required: "Renseignez votre nom, votre e-mail et votre message.",
    nameTooShort: "Indiquez votre nom (au moins 2 caractères).",
    messageTooShort: "Votre message doit contenir au moins 10 caractères.",
    sendFailed: "Impossible d’envoyer votre message. Réessayez plus tard."
  }
}

const GUEST_CONTACT_EN: SiteGuestContactLabels = {
  header: "Contact",
  title: "Contact the host",
  subtitle:
    "Ask about dates, capacity, or how your stay would work. The host will reply by email.",
  close: "Close",
  fields: {
    name: "Your name",
    email: "Your email",
    message: "Your message",
    messagePlaceholder:
      "E.g. Can we fit 4 adults on these dates? Is check-in around 6 p.m. possible?"
  },
  submit: "Send message",
  submitting: "Sending…",
  success: "Message sent. The host will reply by email.",
  successClose: "Close",
  errors: {
    required: "Please enter your name, email, and message.",
    nameTooShort: "Please enter your name (at least 2 characters).",
    messageTooShort: "Your message must be at least 10 characters.",
    sendFailed: "Unable to send your message. Please try again later."
  }
}

export function getSiteGuestContactLabels(locale: HostivLocale): SiteGuestContactLabels {
  return locale === "en" ? GUEST_CONTACT_EN : GUEST_CONTACT_FR
}
