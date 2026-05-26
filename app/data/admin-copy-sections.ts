type AdminCopyField = {
  key: string
  label: string
  type?: "text" | "textarea"
  fullWidth?: boolean
}

type AdminCopySection = {
  id: string
  title: string
  fields: AdminCopyField[]
}

/** Sections de textes (content.copy) pour le formulaire admin. */
export const adminCopySections: AdminCopySection[] = [
  {
    id: "hero",
    title: "Hero",
    fields: [
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" },
      { key: "text", label: "Texte", type: "textarea" as const }
    ]
  },
  {
    id: "platform_stats",
    title: "Plateformes (intro)",
    fields: [
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" },
      { key: "intro", label: "Introduction", type: "textarea", fullWidth: true }
    ]
  },
  {
    id: "host",
    title: "Hôte",
    fields: [
      { key: "caption", label: "Légende photo", fullWidth: true },
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" },
      { key: "quote", label: "Citation", type: "textarea" as const, fullWidth: true },
      { key: "intro_1", label: "Intro 1", type: "textarea" as const },
      { key: "intro_2", label: "Intro 2", type: "textarea" as const }
    ]
  },
  {
    id: "spaces",
    title: "Espaces",
    fields: [
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" },
      { key: "intro", label: "Introduction", type: "textarea" as const, fullWidth: true }
    ]
  },
  {
    id: "benefits",
    title: "Atouts",
    fields: [
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" }
    ]
  },
  {
    id: "location",
    title: "Quartier",
    fields: [
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" },
      { key: "intro", label: "Introduction", type: "textarea" as const, fullWidth: true },
      { key: "lead", label: "Chapô", type: "textarea" as const, fullWidth: true }
    ]
  },
  {
    id: "visual",
    title: "Visuel / galerie",
    fields: [
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" },
      { key: "intro", label: "Introduction", type: "textarea" as const, fullWidth: true },
      { key: "gallery_cta_eyebrow", label: "Sur-titre" },
      { key: "gallery_cta_title", label: "Titre" },
      { key: "gallery_cta_text", label: "Texte", type: "textarea" as const }
    ]
  },
  {
    id: "pricing",
    title: "Tarifs (textes)",
    fields: [
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" },
      { key: "intro", label: "Introduction", type: "textarea" as const }
    ]
  },
  {
    id: "amenities",
    title: "Équipements (textes)",
    fields: [
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" },
      { key: "intro", label: "Introduction", type: "textarea" as const }
    ]
  },
  {
    id: "reviews",
    title: "Avis (textes)",
    fields: [
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" }
    ]
  },
  {
    id: "rules",
    title: "Règlement",
    fields: [
      { key: "eyebrow", label: "Sur-titre" },
      { key: "title", label: "Titre" },
      { key: "intro", label: "Introduction", type: "textarea" as const },
      { key: "check_in_label", label: "Label arrivée" },
      { key: "check_in_time", label: "Heure arrivée" },
      { key: "check_out_label", label: "Label départ" },
      { key: "check_out_time", label: "Heure départ" }
    ]
  },
  {
    id: "booking",
    title: "Réservation (textes)",
    fields: [
      { key: "price_recap_note", label: "Note récap prix", type: "textarea" as const },
      {
        key: "price_recap_note_payment",
        label: "Note récap paiement",
        type: "textarea" as const
      }
    ]
  }
] as const
