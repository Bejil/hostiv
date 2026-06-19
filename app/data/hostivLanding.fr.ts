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
  pricing: "Tarifs",
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
  breadcrumbHomeLabel: "Accueil",
  homeTitle: "Hostiv | Générateur de site de location saisonnière",
  homeDescription:
    "Créez votre site de location vacances : réservations directes, calendrier iCal et paiement Stripe. Générateur de site pour hôtes — 0 % de commission sur vos nuitées.",
  homeOgTitle: "Hostiv — Générateur de site location vacances sans commission",
  homeOgDescription:
    "Lancez votre site de location saisonnière en quelques minutes. Réservation directe, sync calendrier et Stripe Connect — sans commission plateforme.",
  signupConfirmationTitle: "Inscription confirmée | Hostiv",
  signupConfirmationDescription:
    "Votre compte Hostiv est en cours d’activation après votre inscription.",
  pricingPageTitle: "Tarifs Hostiv | Générateur de site location saisonnière",
  pricingPageDescription:
    "Forfaits Starter (49 €/an) et Pro (99 €/an) pour créer votre site de location vacances : réservation directe, Stripe et iCal. Zéro commission sur vos nuitées.",
  pricingPageOgTitle: "Tarifs Hostiv — Site location saisonnière dès 49 €/an",
  pricingPageOgDescription:
    "Comparez les forfaits Hostiv pour publier un site de location courte durée et recevoir des réservations directes."
} as const

export const hostivNavLinks = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Comment ça marche", href: "#comment" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "FAQ", href: "#faq" }
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
    "Starter pour un logement, Pro pour en gérer plusieurs — chaque site a son forfait annuel.",
  plans: [
    {
      id: "starter",
      name: "Starter",
      price: 49,
      period: "an",
      accent: "green" as const,
      tagline:
        "Pour lancer un premier site de réservation directe, sans options avancées.",
      positioning: "L’essentiel pour recevoir des réservations directes sur un logement.",
      features: [
        "1 logement",
        "Réservation directe",
        "Paiements Stripe intégrés",
        "Synchronisation calendrier (iCal)",
        "Galerie photos",
        "Gestion des réservations"
      ],
      cta: "Commencer avec Starter",
      buttonVariant: "secondary" as const
    },
    {
      id: "pro",
      name: "Pro",
      price: 99,
      period: "an",
      accent: "pro" as const,
      recommended: true,
      badge: "Populaire",
      ribbon: "Le plus populaire",
      tagline:
        "Pour les hôtes multi-logements et un backoffice plus complet.",
      positioning:
        "Plusieurs sites, guide PDF, factures et co-hôtes — tout est inclus.",
      includesLabel: "Tout Starter +",
      extraFeatures: [
        "Plusieurs logements",
        "Guide d’accueil PDF imprimable",
        "Factures PDF",
        "Co-hôtes"
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
    label: "Option forfait Starter",
    tagline:
      "Guide d’accueil PDF, factures PDF et co-hôtes pour votre logement Starter.",
    note: "Guide PDF, factures et co-hôtes sont déjà inclus dans le forfait Pro.",
    proNudge:
      "Le forfait Pro inclut ces options sur tous vos logements, plus le multi-logements.",
    chooseProCta: "Choisir Pro",
    ariaLabel: "Starter + : guide PDF, factures et co-hôtes pour forfait Starter",
    features: [
      "Guide d’accueil PDF personnalisé, prêt à imprimer",
      "Factures PDF pour chaque réservation directe",
      "Co-hôtes illimités sur le logement"
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

export const hostivFaqSection = {
  eyebrow: "FAQ",
  title: "Questions fréquentes",
  intro:
    "Tout ce qu’il faut savoir sur Hostiv, la réservation directe sans commission et la mise en ligne de votre site de location.",
  pricingCta: "Voir les tarifs",
  resourcesCta: "Lire nos guides"
} as const

const hostivFaqsDirect = [
  {
    group: "direct",
    question: "Qu’est-ce qu’un site de réservation directe ?",
    answer:
      "C’est un site web à votre nom où les voyageurs consultent votre logement et réservent sans passer par Airbnb ou Booking. Vous gardez la relation client et la marge sur chaque nuit — Hostiv fournit le site, le calendrier et les paiements Stripe."
  },
  {
    group: "direct",
    question: "Hostiv est-il une alternative à Airbnb ou Booking ?",
    answer:
      "Hostiv complète les OTA plutôt qu’il ne les remplace : gardez vos annonces pour la visibilité, et orientez une partie du trafic vers votre site direct. Vous évitez la commission marketplace sur ces réservations-là."
  },
  {
    group: "direct",
    question: "Hostiv prélève-t-il une commission sur mes réservations directes ?",
    answer:
      "Non. Hostiv ne prélève aucune commission sur le montant de vos nuitées. Vous payez uniquement votre abonnement annuel (Starter ou Pro). Seuls les frais de traitement Stripe s’appliquent sur les paiements par carte."
  },
  {
    group: "direct",
    question: "Puis-je garder mon annonce sur Airbnb ou Booking ?",
    answer:
      "Oui. Importez leurs calendriers iCal dans Hostiv, exportez l’URL iCal de votre site vers chaque plateforme, et ajoutez un lien « Réserver sur mon site » dans votre bio ou vos messages."
  }
] as const

const hostivFaqsSetup = [
  {
    group: "setup",
    question: "Combien de temps pour mettre en ligne mon site ?",
    answer:
      "Comptez environ 15 minutes pour choisir un template, ajouter vos photos et textes, puis publier. La connexion Stripe et la synchronisation iCal se font ensuite depuis votre admin."
  },
  {
    group: "setup",
    question: "Faut-il des compétences techniques ?",
    answer:
      "Non. Hostiv est pensé pour les hôtes : éditeur visuel, champs guidés et aperçu en direct. Aucun code ni hébergement à gérer de votre côté."
  },
  {
    group: "setup",
    question: "Quelle est l’adresse de mon site ?",
    answer:
      "Chaque logement dispose d’une URL dédiée sur Hostiv, au format /votre-slug (ex. hostiv.fr/villa-oliviers). Vous choisissez le slug à l’inscription."
  },
  {
    group: "setup",
    question: "Puis-je personnaliser le design de mon site ?",
    answer:
      "Oui : plusieurs templates, couleurs, textes, galerie photos, équipements et sections modulables. Le forfait Pro ajoute des options premium pour un rendu plus professionnel."
  }
] as const

const hostivFaqsPricing = [
  {
    group: "pricing",
    question: "Combien coûte Hostiv ?",
    answer:
      "Le forfait Starter est à 49 €/an (1 logement). L’option Starter + est à +30 €/an (guide PDF, factures, co-hôtes). Le forfait Pro est à 99 €/an (multi-logements et tout inclus)."
  },
  {
    group: "pricing",
    question: "Quelle différence entre Starter et Pro ?",
    answer:
      "Starter couvre 1 logement avec réservation directe, Stripe, iCal et gestion des réservations — sans guide PDF, factures ni co-hôtes. Pro permet plusieurs logements et inclut guide PDF, factures et co-hôtes. Sur Starter, l’option Starter + (+30 €/an) ajoute ces trois fonctionnalités pour un seul logement."
  },
  {
    group: "pricing",
    question: "Y a-t-il un engagement ou une période d’essai ?",
    answer:
      "Sans engagement : l’abonnement est annuel et renouvelable. Il n’y a pas d’essai gratuit, mais la mise en route reste rapide et vous pouvez reprendre vos contenus OTA pour alimenter votre site."
  },
  {
    group: "pricing",
    question: "Comment fonctionne le paiement en ligne ?",
    answer:
      "Les voyageurs paient par carte via Stripe Connect. L’argent est versé sur votre compte hôte Stripe, après les frais Stripe habituels. Hostiv ne touche pas au montant du séjour."
  }
] as const

const hostivFaqsAccount = [
  {
    group: "account",
    question: "Dois-je créer un compte Stripe ?",
    answer:
      "Oui. Lors de l’onboarding, vous connectez un compte Stripe Connect (particulier ou professionnel selon votre situation). C’est ce compte qui reçoit les paiements de vos réservations directes."
  },
  {
    group: "account",
    question: "Puis-je gérer plusieurs logements ?",
    answer:
      "Oui, avec le forfait Pro (99 €/an par logement). Le forfait Starter est limité à 1 logement ; ajoutez ensuite d’autres biens depuis le sélecteur de votre backoffice."
  },
  {
    group: "account",
    question: "Comment synchroniser mon calendrier ?",
    answer:
      "Dans l’admin Hostiv, importez les flux iCal de vos OTA. Copiez ensuite l’URL iCal de votre site Hostiv dans les paramètres calendrier d’Airbnb, Booking ou Abritel."
  },
  {
    group: "account",
    question: "Comment éviter une double réservation ?",
    answer:
      "La synchronisation iCal bloque les dates réservées des deux côtés. Sur Hostiv, vous pouvez aussi bloquer ou débloquer une date manuellement dans l’admin Réservations (si elle n’est pas déjà réservée). Les réservations directes et les imports iCal complètent le calendrier."
  }
] as const

export const hostivFaqGroupLabels = {
  direct: "Réservation directe",
  setup: "Mise en route",
  pricing: "Tarifs & paiements",
  account: "Calendrier & compte"
} as const

export const hostivFaqGroups = [
  { id: "direct" as const, label: hostivFaqGroupLabels.direct, items: hostivFaqsDirect },
  { id: "setup" as const, label: hostivFaqGroupLabels.setup, items: hostivFaqsSetup },
  { id: "pricing" as const, label: hostivFaqGroupLabels.pricing, items: hostivFaqsPricing },
  { id: "account" as const, label: hostivFaqGroupLabels.account, items: hostivFaqsAccount }
] as const

export const hostivFaqs = [
  ...hostivFaqsDirect,
  ...hostivFaqsSetup,
  ...hostivFaqsPricing,
  ...hostivFaqsAccount
] as const

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

export const hostivAccountModalUi = {
  close: "Fermer",
  tabsAria: "Type de compte",
  signupTab: "Inscription",
  loginTab: "Connexion",
  titles: {
    signup: "Créer votre compte",
    login: "Bon retour"
  },
  subtitles: {
    signup:
      "Choisissez votre forfait, renseignez vos informations puis payez en ligne. Votre compte et votre site sont créés après le paiement.",
    login: "Connectez-vous pour gérer votre site et vos réservations."
  },
  plans: {
    legend: "Forfait",
    chooseAria: "Choisir un forfait",
    note:
      "Paiement unique par carte via Stripe. Aucun compte ni site n’est créé tant que le paiement n’est pas confirmé."
  },
  fields: {
    fullName: "Nom complet",
    fullNamePlaceholder: "Marie Dupont",
    propertyName: "Nom du bien",
    propertyPlaceholder: "Villa des Oliviers",
    email: "E-mail",
    emailPlaceholder: "vous@exemple.com",
    password: "Mot de passe",
    passwordPlaceholderSignup: "Créez un mot de passe sécurisé",
    passwordPlaceholderLogin: "Votre mot de passe"
  },
  slugStatus: {
    checking: "Vérification de la disponibilité…",
    available: "Nom disponible — votre site sera accessible sur /{slug}",
    taken: "Ce nom est déjà utilisé. Choisissez un autre nom de bien.",
    tooShort: "Nom trop court (au moins 3 caractères une fois converti en adresse web).",
    reserved: "Ce nom est réservé et ne peut pas être utilisé.",
    invalidFormat: "Le nom ne peut contenir que des lettres et des chiffres.",
    invalid: "Nom invalide pour l’adresse de votre site.",
    error: "Impossible de vérifier ce nom pour le moment.",
    preview: "Adresse prévue : /{slug}",
    hint: "Saisissez un nom pour générer l’adresse de votre site."
  },
  passwordRules: {
    intro:
      "Votre mot de passe doit être suffisamment long et complexe en intégrant des lettres (majuscules et minuscules), des chiffres, de la ponctuation et des caractères spéciaux :",
    length: "Au moins 8 caractères",
    lowercase: "Une lettre minuscule",
    uppercase: "Une lettre majuscule",
    digit: "Un chiffre",
    special: "Un caractère spécial ou de ponctuation"
  },
  errors: {
    paymentCancelled: "Paiement annulé. Aucun compte n’a été créé — vous pouvez réessayer.",
    nameAndEmail: "Renseignez votre nom et un e-mail valide.",
    passwordInvalid: "Choisissez un mot de passe qui respecte tous les critères de sécurité.",
    propertyRequired: "Indiquez le nom de votre bien pour créer votre site.",
    propertyTaken: "Ce nom de bien est déjà utilisé. Modifiez-le pour continuer.",
    propertyInvalid: "Choisissez un nom de bien valide et disponible.",
    checkoutFailed: "Impossible d’ouvrir le paiement. Réessayez plus tard.",
    loginCredentials: "Indiquez votre e-mail et votre mot de passe.",
    supabaseUnavailable: "Connexion indisponible : Supabase n’est pas configuré sur cet environnement.",
    noSite:
      "Connexion réussie, mais aucun site n’est associé à ce compte. Contactez-nous si le problème persiste.",
    loginFailed: "Connexion impossible. Vérifiez vos identifiants."
  },
  buttons: {
    payLoading: "Redirection vers Stripe…",
    pay: "Payer {price}€ / {period} — {name}",
    loginLoading: "Connexion…",
    login: "Se connecter"
  },
  forgotPasswordLink: "Mot de passe oublié ?",
  forgotPassword: {
    title: "Mot de passe oublié",
    subtitle:
      "Saisissez l’e-mail de votre compte Hostiv. Si un compte existe, vous recevrez un lien valable 24 h.",
    submit: "Envoyer le lien",
    submitting: "Envoi…",
    backToLogin: "Retour à la connexion",
    success:
      "Si un compte est associé à cette adresse, un e-mail vient de vous être envoyé avec un lien de réinitialisation.",
    errors: {
      invalidEmail: "Adresse e-mail invalide.",
      sendFailed: "Impossible d’envoyer l’e-mail pour le moment."
    }
  }
} as const

export const hostivContactModalUi = {
  close: "Fermer",
  title: "Nous contacter",
  subtitle: "Décrivez votre demande — nous vous répondons par e-mail.",
  fields: {
    name: "Nom complet",
    email: "E-mail",
    subject: "Sujet",
    message: "Message",
    messagePlaceholder: "Décrivez votre question ou votre situation…"
  },
  defaultSubject: "Question générale",
  subjectOptions: [
    "Question générale",
    "Compte et abonnement",
    "Site et réservations",
    "Stripe et paiements",
    "Autre"
  ] as const,
  submit: "Envoyer le message",
  submitting: "Envoi…",
  errors: {
    required: "Renseignez tous les champs obligatoires.",
    sendFailed: "Impossible d’envoyer votre message. Réessayez plus tard."
  },
  success:
    "Message envoyé. Un e-mail de confirmation vous a été adressé — nous vous répondrons sous 2 jours ouvrés en général."
} as const

export const hostivPasswordResetPageUi = {
  loading: "Vérification du lien…",
  title: "Nouveau mot de passe",
  subtitle: "Choisissez un mot de passe sécurisé. Ce lien est valable 24 h.",
  confirmPassword: "Confirmer le mot de passe",
  confirmPasswordPlaceholder: "Retapez votre mot de passe",
  submit: "Enregistrer le mot de passe",
  submitting: "Enregistrement…",
  successTitle: "Mot de passe mis à jour",
  successLead: "Vous pouvez vous connecter avec votre nouveau mot de passe.",
  openLogin: "Se connecter",
  backHome: "Retour à l’accueil",
  errors: {
    incompleteLink: "Lien incomplet. Utilisez le lien reçu par e-mail.",
    invalidLink: "Lien invalide ou déjà utilisé.",
    expiredLink: "Ce lien a expiré. Demandez un nouveau lien depuis la page de connexion.",
    loadFailed: "Impossible de vérifier ce lien.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordInvalid: "Choisissez un mot de passe qui respecte tous les critères de sécurité.",
    saveFailed: "Impossible de mettre à jour le mot de passe."
  },
  seoTitle: "Réinitialiser votre mot de passe | Hostiv",
  seoDescription:
    "Définissez un nouveau mot de passe pour votre compte Hostiv via le lien reçu par e-mail."
} as const

export const hostivFooter = {
  baseline: "Réservation directe pour les hôtes de locations saisonnières.",
  columns: [
    {
      id: "about",
      title: "À propos",
      links: [
        { label: "Qui sommes-nous ?", href: "/a-propos" },
        { label: "Guides hôtes", href: "/ressources" },
        { label: "Tarifs", href: "/tarifs" },
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
