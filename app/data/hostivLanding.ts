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
        "Templates premium optimisés conversion",
        "Analytics basiques (visites, réservations)"
      ],
      cta: "Passer en Pro",
      buttonVariant: "primary" as const
    }
  ],
  premiumAddon: {
    name: "Premium",
    price: 29,
    period: "an",
    pricePrefix: "+",
    label: "Extension Starter",
    tagline: "Ajoutez des outils avancés de gestion et d’analyse.",
    note: "Ces outils sont déjà inclus dans le forfait Pro — sans module à ajouter.",
    proNudge: "Le forfait Pro regroupe site premium, analytics et gestion avancée en un seul abonnement.",
    features: [
      "Statistiques avancées",
      "Génération de livret d’accueil",
      "Génération de factures",
      "Rapports de performances réservations"
    ]
  },
  trust: ["Sans engagement", "Configuration en quelques minutes", "Paiements sécurisés via Stripe"]
} as const

export const hostivCta = {
  title: "Gardez 100 % de vos revenus directs",
  lead:
    "Inscrivez-vous, personnalisez votre site et publiez-le tout de suite — pas de liste d’attente, pas de commission Hostiv sur vos réservations en direct.",
  highlights: [
    "Compte ouvert en quelques minutes, site en ligne dès aujourd’hui",
    "0 % de commission Hostiv : vous encaissez via Stripe sur votre compte",
    "Gardez Airbnb et Booking pour la visibilité, poussez le direct sans conflit de calendrier"
  ],
  button: "Créer mon site maintenant"
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
