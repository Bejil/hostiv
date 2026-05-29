import type { AdminSectionId } from "./admin-nav-sections"
import type { PropertyAdminRecord } from "../types/property-admin"
import { parseSiteTemplateId } from "./site-templates"

export type AdminOnboardingStepId =
  | "welcome"
  | "header"
  | "template"
  | "seo"
  | "images"
  | "host"
  | "location"
  | "booking"

export type AdminOnboardingStep = {
  id: AdminOnboardingStepId
  section: AdminSectionId | null
  title: string
  subtitle: string
  tips: string[]
  cta: string
}

export const adminOnboardingSteps: AdminOnboardingStep[] = [
  {
    id: "welcome",
    section: null,
    title: "Bienvenue dans votre backoffice",
    subtitle: "Complétez les 7 étapes pour configurer votre site de réservation directe.",
    tips: [
      "Tous les champs indiqués sont obligatoires",
      "Vous pourrez affiner le contenu plus tard dans Personnalisation"
    ],
    cta: "Commencer"
  },
  {
    id: "header",
    section: "header",
    title: "Étape 1 — Identité du site",
    subtitle: "Logo, nom affiché et sous-titre visibles dans l’en-tête de votre site.",
    tips: ["Logo", "Nom affiché", "Sous-titre"],
    cta: "Étape suivante"
  },
  {
    id: "template",
    section: "template",
    title: "Étape 2 — Thème visuel",
    subtitle: "Choisissez l’ambiance graphique appliquée à tout le site.",
    tips: ["Sélectionnez un thème"],
    cta: "Étape suivante"
  },
  {
    id: "seo",
    section: "seo",
    title: "Étape 3 — Page d’accueil",
    subtitle: "La photo et les textes d’accroche en haut de votre site.",
    tips: ["Photo principale", "Sur-titre", "Titre", "Texte d’introduction"],
    cta: "Étape suivante"
  },
  {
    id: "images",
    section: "images",
    title: "Étape 4 — Galerie photos",
    subtitle: "Au moins une section avec titre, sous-titre et une photo.",
    tips: ["Titre de section", "Sous-titre de section", "Au moins 1 photo"],
    cta: "Étape suivante"
  },
  {
    id: "host",
    section: "host",
    title: "Étape 5 — Présentation hôte",
    subtitle: "Mettez un visage et une voix humaine derrière votre annonce.",
    tips: ["Photo hôte", "Légende", "Titre", "Citation", "Introduction"],
    cta: "Étape suivante"
  },
  {
    id: "location",
    section: "location",
    title: "Étape 6 — Localisation",
    subtitle: "Où se trouve le logement et comment le présenter.",
    tips: ["Adresse", "Chapô (phrase d’accroche du quartier)"],
    cta: "Étape suivante"
  },
  {
    id: "booking",
    section: "booking",
    title: "Étape 7 — Tarifs",
    subtitle: "Le prix affiché par défaut et le nombre de voyageurs inclus.",
    tips: ["Prix par nuit", "Voyageurs inclus"],
    cta: "Terminer le parcours"
  }
]

export const adminOnboardingStepCount = adminOnboardingSteps.length

const progressOnboardingStepIds = adminOnboardingSteps
  .filter((step) => step.id !== "welcome")
  .map((step) => step.id)

/** Vrai tant qu’au moins une étape obligatoire du parcours n’est pas remplie dans le site. */
export function isOnboardingRequired(record: PropertyAdminRecord): boolean {
  return progressOnboardingStepIds.some((stepId) => !evaluateOnboardingStep(record, stepId))
}

/** Index de la première étape incomplète (1…n), ou dernière étape si tout est rempli. */
export function getFirstIncompleteOnboardingStepIndex(record: PropertyAdminRecord): number {
  for (let index = 0; index < adminOnboardingSteps.length; index += 1) {
    const step = adminOnboardingSteps[index]

    if (step && step.id !== "welcome" && !evaluateOnboardingStep(record, step.id)) {
      return index
    }
  }

  return adminOnboardingSteps.length - 1
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
}

export function evaluateOnboardingStep(
  record: PropertyAdminRecord,
  stepId: AdminOnboardingStepId
): boolean {
  return getOnboardingStepMissingLabels(record, stepId).length === 0
}

export function getOnboardingStepMissingLabels(
  record: PropertyAdminRecord,
  stepId: AdminOnboardingStepId
): string[] {
  switch (stepId) {
    case "welcome":
      return []
    case "header": {
      const missing: string[] = []

      if (!hasText(record.logo_path)) {
        missing.push("Logo")
      }

      if (!hasText(record.brand_name)) {
        missing.push("Nom affiché")
      }

      if (!hasText(record.brand_meta)) {
        missing.push("Sous-titre")
      }

      return missing
    }
    case "template":
      return parseSiteTemplateId(record.content.template?.id) ? [] : ["Thème sélectionné"]
    case "seo": {
      const missing: string[] = []
      const hero = record.content.copy.hero

      if (!hasText(record.hero_image_path)) {
        missing.push("Photo principale")
      }

      if (!hasText(hero?.eyebrow)) {
        missing.push("Sur-titre")
      }

      if (!hasText(hero?.title)) {
        missing.push("Titre d’accueil")
      }

      if (!hasText(hero?.text)) {
        missing.push("Texte d’introduction")
      }

      return missing
    }
    case "images": {
      const hasValidSection = (record.content.space_gallery_categories ?? []).some(
        (category) =>
          hasText(category.title) &&
          hasText(category.description) &&
          (category.images ?? []).some((image) => hasText(image))
      )

      return hasValidSection
        ? []
        : ["Au moins une section avec titre, sous-titre et 1 photo"]
    }
    case "host": {
      const missing: string[] = []
      const host = record.content.copy.host

      if (!hasText(record.host_photo_path)) {
        missing.push("Photo hôte")
      }

      if (!hasText(host?.caption)) {
        missing.push("Légende photo")
      }

      if (!hasText(host?.title)) {
        missing.push("Titre")
      }

      if (!hasText(host?.quote)) {
        missing.push("Citation")
      }

      if (!hasText(host?.intro_1)) {
        missing.push("Introduction")
      }

      return missing
    }
    case "location": {
      const missing: string[] = []

      if (!hasText(record.location?.address)) {
        missing.push("Adresse")
      }

      if (!hasText(record.content.copy.location?.lead)) {
        missing.push("Chapô")
      }

      return missing
    }
    case "booking": {
      const missing: string[] = []

      if (Number(record.booking_config?.base_night_price_eur ?? 0) <= 0) {
        missing.push("Prix par nuit")
      }

      if (Number(record.booking_config?.included_main_guests ?? 0) <= 0) {
        missing.push("Voyageurs inclus")
      }

      return missing
    }
    default:
      return []
  }
}
