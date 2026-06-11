import type { AdminOnboardingStep } from "../admin-onboarding-steps"
import type { AdminSetupGuideItem } from "../../utils/admin-setup-guide"
import { adminUiLabelsDomainsFr } from "./labels-domains.fr"

export const adminUiLabelsFr = {
  ...adminUiLabelsDomainsFr,
  header: {
    account: "Mon compte",
    settings: "Paramètres",
    logout: "Déconnexion",
    unsaved: "Non enregistré"
  },
  common: {
    save: "Enregistrer",
    saving: "Enregistrement…",
    cancel: "Annuler",
    confirm: "Confirmer",
    close: "Fermer",
    delete: "Supprimer",
    retry: "Réessayer",
    skip: "Passer",
    undoSkip: "Annuler",
    loading: "Chargement…",
    inProgress: "En cours…",
    information: "Information"
  },
  shell: {
    checkingBackoffice: "Vérification du backoffice…",
    loadingProperty: "Chargement de {name}…",
    editorUnavailableTitle: "Impossible d’afficher l’éditeur",
    editorUnavailableAuthenticated:
      "Les données du site n’ont pas pu être chargées. Vérifiez votre connexion ou vos droits.",
    editorUnavailableSession: "Session expirée ou accès refusé pour ce site.",
    savebarUnsaved: "Modifications non enregistrées sur",
    propertyNotFound: "Ce backoffice n’existe pas.",
    accessDenied: "Accès refusé.",
    loadSiteFailed: "Impossible de charger le site.",
    subscriptionExpired: "Votre forfait a expiré le {date}. Renouvelez-le pour accéder à l’éditeur.",
    subscriptionRequired: "Forfait Hostiv requis. Réglez le paiement annuel pour accéder au backoffice.",
    paymentCancelled: "Paiement annulé. Renouvelez votre forfait pour accéder au backoffice.",
    paymentIncomplete: "Retour de paiement incomplet. Réessayez le renouvellement.",
    paymentRenewed: "Forfait renouvelé pour 12 mois. L’éditeur est à nouveau disponible.",
    paymentPending: "Paiement reçu — activation en cours. Actualisez dans quelques instants si besoin.",
    paymentVerifyFailed: "Impossible de confirmer le paiement.",
    saved: "Modifications enregistrées.",
    verifyBackofficeFailed: "Impossible de vérifier ce backoffice.",
    prepareEditorFailed: "Impossible de préparer l’éditeur.",
    renderEditorFailed: "Erreur d’affichage de l’éditeur.",
    supabaseConfigInvalid: "Configuration Supabase invalide."
  },
  mainTabs: {
    ariaLabel: "Paramètres du site",
    incompleteSectionOne: "1 section non remplie",
    incompleteSections: "{count} sections non remplies",
    upcomingReservations: "Réservations à venir",
    stripeIncomplete: "Configuration Stripe incomplète",
    preview: "Aperçu",
    previewTitle: "Ouvrir l’aperçu du site dans un nouvel onglet"
  },
  login: {
    title: "Connexion",
    checkingTitle: "Vérification de la session",
    checkingSubtitle: "Nous vérifions que vous êtes toujours connecté…",
    checkingSession: "Vérification de la session…",
    subtitle: "Accédez au backoffice de {name} (/{slug}) avec votre compte Hostiv.",
    email: "E-mail",
    password: "Mot de passe",
    emailPlaceholder: "vous@exemple.com",
    passwordPlaceholder: "Votre mot de passe",
    submit: "Se connecter",
    submitting: "Connexion…"
  },
  nav: {
    top: [
      { id: "general", label: "Général", title: "Général", description: "Publication et SEO." },
      {
        id: "customization",
        label: "Personnalisation",
        title: "Personnalisation",
        description: "Contenu et mise en page du site public — aperçu live à droite."
      },
      {
        id: "welcome-guide",
        label: "Guide d'accueil",
        title: "Guide d'accueil PDF",
        description: "Livret d’accueil PDF imprimable (Starter + ou forfait Pro)."
      },
      {
        id: "images",
        label: "Galerie",
        title: "Galerie",
        description: "Photos organisées par sections avec titre et sous-titre."
      },
      {
        id: "reservations",
        label: "Réservations",
        title: "Réservations",
        description: "Flux ICS et calendrier des dates réservées."
      },
      {
        id: "guest-reviews",
        label: "Avis voyageurs",
        title: "Avis voyageurs",
        description: "Commentaires laissés par vos voyageurs après leur séjour."
      },
      {
        id: "payouts",
        label: "Comptabilité",
        title: "Comptabilité",
        description: "Tarifs, encaissement Stripe et réception des paiements."
      }
    ],
    customization: [
      {
        id: "template",
        label: "Template",
        title: "Template",
        description: "Ambiance visuelle, UI et UX appliquées au site public."
      },
      {
        id: "header",
        label: "En-tête",
        title: "En-tête",
        description: "Logo, nom de marque et sous-titre affichés dans la barre de navigation."
      },
      {
        id: "seo",
        label: "Moteur de recherche",
        title: "Moteur de recherche",
        description: "Image de fond, textes et bandeau de réservation en haut de page."
      },
      {
        id: "platforms",
        label: "Plateformes",
        title: "Plateformes",
        description: "Textes d’introduction et liens vers Airbnb, Booking, etc."
      },
      {
        id: "host",
        label: "Hôte",
        title: "Hôte",
        description: "Présentation de l’hôte et photo associée."
      },
      {
        id: "featured",
        label: "Coups de cœur",
        title: "Coups de cœur",
        description: "Espaces mis en avant sur la page d’accueil."
      },
      {
        id: "benefits",
        label: "Atouts",
        title: "Atouts",
        description: "Cartes des points forts du logement."
      },
      {
        id: "location",
        label: "Localisation",
        title: "Localisation",
        description: "Carte, adresse et points d’intérêt du quartier."
      },
      {
        id: "media",
        label: "Exploration",
        title: "Exploration",
        description: "Galerie, cartes visuelles et textes de la section visuelle."
      },
      {
        id: "booking",
        label: "Tarifs",
        title: "Tarifs",
        description: "Textes de la section tarifs sur le site public."
      },
      {
        id: "amenities",
        label: "Équipements",
        title: "Équipements",
        description: "Cartes équipements et textes de la section."
      },
      {
        id: "reviews",
        label: "Verbatim",
        title: "Verbatim",
        description: "Avis clients et fond de la section témoignages."
      },
      {
        id: "rules",
        label: "Règlement",
        title: "Règlement",
        description: "Horaires, règles de la maison et textes de la section."
      }
    ],
    fallback: {
      label: "Général",
      title: "Général",
      description: "Paramètres du site."
    }
  },
  setupGuide: {
    kicker: "Guide de démarrage",
    ariaLabel: "Guide de démarrage",
    progressAllComplete: "Tout est prêt !",
    progressRequiredDone: "Configuration minimale terminée",
    progressDefault: "Guide de configuration",
    progressMeta: "{completed}/{total} terminé",
    progressMetaPlural: "{completed}/{total} terminés",
    progressRequired: "· {completed}/{total} obligatoires",
    collapse: "Réduire le guide",
    expand: "Développer le guide",
    dismiss: "Fermer le guide définitivement",
    open: "Ouvrir le guide",
    doneComplete:
      "Votre site et votre backoffice sont entièrement configurés. Vous pouvez publier quand vous êtes prêt.",
    doneRequired:
      "Les étapes obligatoires sont faites. Terminez ou passez les étapes restantes ci-dessous.",
    sublistKicker: "Toutes les sections",
    showSections: "Afficher les sections",
    items: [
      { id: "theme", label: "Choisissez un thème", section: "customization", blockId: "template" },
      { id: "customization", label: "Personnalisation de la page", section: "customization" },
      { id: "gallery", label: "Ajoutez des images dans la galerie", section: "images" },
      { id: "stripe", label: "Paramétrez les paiements Stripe", section: "payouts" },
      {
        id: "calendars",
        label: "Ajoutez des calendriers tiers",
        optional: true,
        section: "reservations"
      },
      {
        id: "seo-keywords",
        label: "Ajoutez des mots-clés pour le référencement",
        optional: true,
        section: "general"
      }
    ] satisfies AdminSetupGuideItem[]
  },
  onboarding: {
    steps: [
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
    ] satisfies AdminOnboardingStep[]
  },
  onboardingUi: {
    progressWelcome: "Configuration obligatoire de votre site",
    progressDone: "Configuration terminée",
    progressStep: "Étape {current} sur {total}",
    badge: "Bienvenue sur Hostiv",
    welcomeTitle: "Votre nouveau site",
    welcomeLead:
      "Complétez les {total} étapes ci-dessous pour activer votre backoffice. La configuration est obligatoire avant de continuer.",
    highlightForms: "Formulaires intégrés à chaque étape",
    highlightValidation: "Validation avant de passer à la suite",
    highlightRequired: "Champs obligatoires marqués d’un astérisque",
    celebrationTitle: "Configuration terminée",
    celebrationLead:
      "Les {total} étapes obligatoires sont complètes. Vos modifications ont été enregistrées — affinez votre site dans le menu latéral.",
    previous: "Précédent",
    start: "Commencer",
    openBackoffice: "Accéder au backoffice",
    finishTour: "Terminer le parcours",
    nextStep: "Étape suivante"
  },
  accountingSections: [
    {
      id: "pricing",
      label: "Tarifs",
      description: "Nuit, semaine et mois",
      title: "Tarifs",
      lead: "Prix de base, voyageurs inclus et remises longue durée."
    },
    {
      id: "revenue",
      label: "Rendements",
      description: "Encaissements par mois",
      title: "Rendements",
      lead: "Montants bruts des réservations directes confirmées, filtrés par date de paiement."
    },
    {
      id: "payments",
      label: "Paramètres Stripe",
      description: "Compte Connect",
      title: "Paramètres Stripe",
      lead: "Connectez votre compte Stripe pour recevoir les paiements par carte sur votre site."
    }
  ],
  bookingPricing: [
    {
      id: "night",
      title: "Tarif par nuit",
      lead: "Prix de base, voyageurs inclus et supplément par nuit affichés sur votre site."
    },
    {
      id: "week",
      title: "Remise par semaine",
      lead: "Réduction appliquée aux séjours d’une semaine ou plus."
    },
    {
      id: "month",
      title: "Remise par mois",
      lead: "Réduction appliquée aux séjours d’un mois ou plus."
    }
  ],
  preview: {
    viewports: [
      { id: "desktop", label: "Bureau" },
      { id: "tablet", label: "Tablette" },
      { id: "mobile", label: "Mobile" }
    ]
  },
  validation: {
    selectedTheme: "Thème sélectionné",
    logo: "Logo",
    brandName: "Nom affiché",
    brandMeta: "Sous-titre",
    heroImage: "Image de fond",
    eyebrow: "Sur-titre",
    title: "Titre",
    text: "Texte",
    intro: "Introduction",
    visiblePlatform: "Au moins une plateforme visible",
    hostPhoto: "Photo hôte",
    caption: "Légende",
    quote: "Citation",
    introduction: "Introduction",
    featuredSpace: "Au moins un coup de cœur",
    benefitCard: "Au moins un atout",
    address: "Adresse",
    neighborhoodLead: "Chapô du quartier",
    visualCard: "Au moins une carte visuelle",
    pricingEyebrow: "Sur-titre",
    pricingTitle: "Titre",
    pricingIntro: "Introduction",
    amenityCard: "Au moins une carte équipement",
    reviewsBg: "Image de fond",
    review: "Au moins un verbatim",
    rulesEyebrow: "Sur-titre",
    rulesTitle: "Titre",
    rulesIntro: "Introduction",
    houseRule: "Au moins une règle",
    heroImageMain: "Photo principale",
    heroHomeTitle: "Titre d’accueil",
    heroIntroText: "Texte d’introduction",
    gallerySectionMin: "Au moins une section avec titre, sous-titre et 1 photo",
    neighborhoodChapo: "Chapô",
    nightPrice: "Prix par nuit",
    includedGuests: "Voyageurs inclus",
    scheduleOrRule: "Horaires (arrivée et départ) ou au moins une règle"
  },
  proUpgrade: {
    close: "Fermer",
    later: "Plus tard",
    redirecting: "Redirection…",
    loginRequired: "Connectez-vous pour continuer.",
    paymentOpenFailed: "Impossible d’ouvrir la page de paiement."
  },
  proFeatures: {
    "welcome-guide": {
      title: "Guide d’accueil PDF",
      lead: "Pour créer et télécharger votre livret d’accueil personnalisé (prêt à imprimer), activez l’option Starter +.",
      starterPlusCta: "Activer Starter + — {price}€ / an"
    },
    invoice: {
      title: "Factures PDF",
      lead: "Pour générer une facture PDF par réservation directe, activez l’option Starter +.",
      starterPlusCta: "Activer Starter + — {price}€ / an"
    }
  }
} as const
