export const hostivAdminHeaderUi = {
  account: "Mon compte",
  settings: "Paramètres",
  logout: "Déconnexion",
  unsaved: "Non enregistré"
} as const

export const hostivNavUi = {
  mySite: "Mon site",
  myAdmin: "Mon backoffice",
  logout: "Déconnexion",
  login: "Connexion",
  signup: "Commencer",
  menu: "Menu",
  languageLabel: "Langue"
} as const

export const hostivHeroContent = {
  pill: "Réservation directe pour hôtes",
  title: "Votre site de location,",
  titleAccent: "sans commission",
  lead:
    "Passez au direct comme sur Airbnb ou Booking — mais sans leur part sur chaque nuit. Hostiv réunit site, calendrier, paiements Stripe et admin en un seul outil.",
  proofAriaLabel: "Avantages Hostiv",
  ctaPrimary: "Commencer maintenant",
  ctaSecondary: "Voir un exemple",
  illustrationAlt: "Illustration : voyageurs devant un immeuble de location",
  illustrationCaption: "Leur séjour commence sur votre site",
  dreamCardEyebrow: "Réservation directe",
  dreamCardQuote: "« On a trouvé la maison parfaite —",
  dreamCardQuoteEm: "sans passer par une plateforme. »",
  stayCardTitle: "Villa des Oliviers",
  stayCardMeta: "5 nuits · arrivée demain",
  stayCardBadge: "Confirmée"
} as const

export const hostivLandingSections = {
  features: {
    eyebrow: "L’essentiel",
    title: "Le direct,",
    titleLine2: "sans la commission OTA",
    intro:
      "Gardez la marge sur vos nuitées directes — et continuez à promouvoir votre annonce sur les plateformes pour toucher plus de voyageurs."
  },
  commission: {
    recommendedLabel: "Recommandé",
    feePrefix: "Jusqu'à ~"
  },
  showcase: {
    imageAltPrefix: "Aperçu du style",
    placeholder: "Capture à ajouter"
  },
  steps: {
    eyebrow: "Comment ça marche",
    title: "En trois étapes",
    intro:
      "De la mise en ligne à la première réservation directe — sans reverser de commission à Hostiv."
  }
} as const

export const hostivStaticUi = {
  lastUpdated: "Dernière mise à jour :",
  backHome: "← Retour à l’accueil",
  contactFormCta: "Ouvrir le formulaire de contact"
} as const

export const hostivSeo = {
  homeTitle: "Hostiv | Site de réservation directe pour hôtes",
  homeDescription:
    "Hostiv : site de réservation directe sans commission plateforme. Synchronisez vos calendriers et encaissez via Stripe — contrairement aux OTA.",
  homeOgTitle: "Hostiv — Réservation directe, 0 % de commission",
  homeOgDescription:
    "Passez au direct sans la part Airbnb ou Booking. Site, calendrier, paiements Stripe et admin."
} as const

export const hostivNavLinks = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Comment ça marche", href: "#comment" }
] as const

export const hostivHeroProofPoints = [
  "0 % de commission Hostiv sur vos réservations directes",
  "Contrairement aux plateformes qui prélèvent jusqu’à ~20 % par séjour",
  "Encaissement Stripe Connect sur votre compte"
] as const

export const hostivCommissionCompare = {
  eyebrow: "Vos revenus",
  title: "Zéro commission Hostiv",
  intro:
    "Les marketplaces facturent une part sur chaque nuit. Avec Hostiv, vous gardez la marge sur le direct — tout en continuant à promouvoir votre annonce sur Airbnb, Booking ou Abritel pour gagner en visibilité.",
  platform: {
    label: "Plateformes classiques",
    examples: "Airbnb, Booking, Abritel…",
    fee: "Jusqu’à ~20 %",
    meterLabel: "Commission prélevée",
    meterPercent: 20,
    detail: "Commission hôte (souvent complétée par des frais voyageur) prélevée à chaque réservation."
  },
  hostiv: {
    label: "Réservation directe Hostiv",
    fee: "0 %",
    feeSuffix: "commission Hostiv",
    meterLabel: "Commission Hostiv",
    meterPercent: 0,
    detail:
      "Hostiv ne vous empêche pas de rester visible sur les OTA : combinez promotion sur les plateformes et réservations directes sans commission Hostiv."
  },
  footnote:
    "Seuls les frais de traitement Stripe s’appliquent sur les paiements par carte. Hostiv complète vos canaux existants — il ne les remplace pas."
} as const

export const hostivShowcaseExamples = {
  eyebrow: "Design",
  title: "Plusieurs options de design",
  intro:
    "Choisissez un template prêt à l’emploi pour votre site : même réservation directe, mêmes sections — une identité visuelle différente selon le modèle.",
  items: [
    {
      id: "design-riviera",
      title: "Riviera",
      caption:
        "Template aux accents rose et dégradé — vitrine premium pour un logement haut de gamme.",
      imageSrc: "/hostiv/examples/site-demo_0.png",
      imageWidth: 3900,
      imageHeight: 2258
    },
    {
      id: "design-classique",
      title: "Classique",
      caption:
        "Template épuré, fond clair et touches rouges — lisible et orienté conversion.",
      imageSrc: "/hostiv/examples/site-demo_1.png",
      imageWidth: 1024,
      imageHeight: 591
    },
    {
      id: "design-terre-lin",
      title: "Terre & lin",
      caption:
        "Template chaleureux beige et terracotta — idéal pour une maison de caractère.",
      imageSrc: "/hostiv/examples/site-demo_2.png",
      imageWidth: 1024,
      imageHeight: 592
    }
  ]
} as const

export const hostivFeatures = [
  {
    icon: "Globe",
    tag: "Direct",
    title: "Site sans intermédiaire",
    description:
      "Vos voyageurs réservent chez vous — pas de marketplace qui prend une commission sur chaque séjour."
  },
  {
    icon: "CalendarSync",
    tag: "Sync",
    title: "Calendriers synchronisés",
    description:
      "Hostiv ne vous dispense pas de promouvoir votre bien ailleurs : gardez vos annonces actives sur les OTA pour la visibilité, tout en poussant le direct."
  },
  {
    icon: "BadgePercent",
    tag: "0 %",
    title: "Aucune commission Hostiv",
    description:
      "Contrairement aux OTA, Hostiv ne prélève pas de pourcentage sur vos nuitées. Seuls les frais Stripe de paiement s’appliquent."
  }
] as const

export const hostivSteps = [
  {
    step: "01",
    icon: "LayoutTemplate",
    title: "Publiez votre site",
    hint: "~15 min",
    description:
      "Une vitrine à votre nom pour capter le direct — sans céder 15 à 20 % à une plateforme à chaque réservation.",
    details: [
      "Choisissez un template et personnalisez couleurs & textes",
      "Ajoutez des photos, espaces, équipements et règles de la maison",
      "Définissez vos tarifs : ce que paie le voyageur, c’est ce que vous encaissez (hors frais Stripe)"
    ],
    outcome: "Votre site est en ligne sur une URL dédiée — prêt à convertir sans commission Hostiv."
  },
  {
    step: "02",
    icon: "Link2",
    title: "Connectez vos calendriers",
    hint: "ICS & iCal",
    description:
      "Restez présent sur les plateformes pour être trouvé, synchronisez les calendriers et orientez progressivement vers votre site direct.",
    details: [
      "Importez les flux ICS Airbnb, Booking, Abritel…",
      "Continuez à promouvoir votre annonce sur les OTA pour maximiser la visibilité",
      "Visualisez les dates bloquées sur un seul calendrier, sans double réservation"
    ],
    outcome:
      "Visibilité sur les marketplaces et réservations directes sans commission Hostiv — les deux stratégies se complètent."
  },
  {
    step: "03",
    icon: "Sparkles",
    title: "Recevez des réservations",
    hint: "Direct · 0 %",
    description:
      "Les voyageurs réservent sur votre site ; vous gardez la marge, sans la part habituelle des OTA.",
    details: [
      "Paiement carte via Stripe Connect — sur votre compte",
      "Aucune commission Hostiv sur le montant du séjour",
      "E-mails de confirmation et suivi dans l’admin"
    ],
    outcome: "Chaque séjour est tracé : vous encaissez, sans reverser de % à une marketplace."
  }
] as const

export type HostivPricingPlanId = "starter" | "pro"

export const hostivPricing = {
  eyebrow: "Tarifs",
  title: "Des forfaits clairs, un choix évident",
  intro:
    "Un seul logement par compte — lancez votre site de réservation directe sans commission Hostiv sur vos nuitées.",
  plans: [
    {
      id: "starter",
      name: "Starter",
      price: 49,
      period: "an",
      accent: "green" as const,
      tagline:
        "Pour les hôtes qui veulent lancer rapidement leur site de réservation directe.",
      positioning: "Tout ce qu’il faut pour commencer à recevoir des réservations directes.",
      features: [
        "1 site de location",
        "Système de réservation directe",
        "Paiements Stripe intégrés",
        "Synchronisation calendrier (iCal)",
        "Galerie photos",
        "Tableau de gestion des réservations"
      ],
      cta: "Commencer avec Starter",
      buttonVariant: "secondary" as const
    },
    {
      id: "pro",
      name: "Pro",
      price: 69,
      period: "an",
      accent: "pro" as const,
      recommended: true,
      badge: "Populaire",
      ribbon: "Le plus populaire",
      tagline:
        "Pour les hôtes qui veulent un site plus professionnel et plus performant.",
      positioning:
        "Un site plus beau, plus crédible et qui convertit mieux vos visiteurs en voyageurs.",
      includesLabel: "Inclus Starter +",
      extraFeatures: [
        "Guide d’accueil PDF imprimable",
        "Édition de facture"
      ],
      cta: "Passer en Pro",
      buttonVariant: "primary" as const
    }
  ],
  premiumAddon: {
    name: "Starter +",
    price: 30,
    period: "an",
    pricePrefix: "+",
    label: "Complément forfait Starter",
    tagline:
      "Guide d’accueil PDF imprimable et factures PDF pour vos réservations directes — rien d’autre.",
    note: "Guide PDF et factures sont déjà inclus dans le forfait Pro, sans module à ajouter.",
    proNudge:
      "Le forfait Pro inclut aussi Starter +, plus des templates premium et des analytics de visites.",
    chooseProCta: "Choisir Pro",
    ariaLabel: "Starter + : guide d’accueil PDF et factures pour forfait Starter",
    features: [
      "Guide d’accueil PDF personnalisé, prêt à imprimer",
      "Factures PDF pour chaque réservation directe"
    ]
  },
  trust: ["Sans engagement", "Configuration en quelques minutes", "Paiements sécurisés via Stripe"]
} as const

export const hostivCta = {
  title: "Gardez 100 % de vos revenus directs",
  lead:
    "Choisissez votre forfait, payez en ligne : votre compte et votre site sont créés après confirmation du paiement.",
  highlights: [
    "Inscription et paiement sécurisé par carte — compte créé uniquement après paiement",
    "0 % de commission Hostiv : vous encaissez via Stripe sur votre compte",
    "Gardez Airbnb et Booking pour la visibilité, poussez le direct sans conflit de calendrier"
  ],
  button: "Choisir mon forfait"
} as const

export const hostivNotFoundUi = {
  eyebrow: "Erreur 404",
  titles: {
    page: "Page introuvable",
    site: "Site introuvable",
    backoffice: "Backoffice introuvable"
  },
  messages: {
    page: "Cette adresse n’existe pas ou le lien est incorrect.",
    site: "Ce site n’existe pas ou n’est pas encore publié.",
    backoffice: "Ce backoffice n’existe pas."
  },
  requestedAddress: "Adresse demandée :",
  backHome: "Retour à l’accueil Hostiv",
  createSite: "Créer mon site",
  seoTitleSuffix: " | Hostiv",
  error: {
    eyebrow: "Erreur {code}",
    title: "Une erreur est survenue",
    message: "Réessayez dans quelques instants ou revenez à l’accueil.",
    backHome: "Retour à l’accueil",
    seoTitle: "Erreur | Hostiv"
  }
} as const

export const hostivFooter = {
  baseline: "Réservation directe pour les hôtes de locations saisonnières.",
  columns: [
    {
      id: "about",
      title: "À propos",
      links: [
        { label: "Qui sommes-nous ?", href: "/a-propos" },
        { label: "Nous contacter", href: "/contact" }
      ]
    },
    {
      id: "legal",
      title: "Informations légales",
      links: [
        { label: "Mentions légales", href: "/mentions-legales" },
        { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
        { label: "Conditions générales d’utilisation", href: "/conditions-generales" }
      ]
    }
  ]
} as const
