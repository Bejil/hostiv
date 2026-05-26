export type HestiaFeature = {
  icon: string
  title: string
  description: string
}

export type HestiaStep = {
  step: string
  title: string
  description: string
}

export type HestiaExample = {
  title: string
  location: string
  tag: string
  image: string
}

export type HestiaTestimonial = {
  quote: string
  name: string
  role: string
  country: string
  initials: string
}

export type HestiaPlan = {
  id: string
  name: string
  priceMonthly: number
  priceYearly: number
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export type HestiaFaq = {
  question: string
  answer: string
}

export const hestiaNavLinks = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Comment ça marche", href: "#comment-ca-marche" },
  { label: "Exemples", href: "#exemples" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" }
] as const

export const hestiaStats = [
  { value: "2 500+", label: "hôtes actifs" },
  { value: "€1,2M+", label: "de commissions économisées" },
  { value: "50+", label: "pays" },
  { value: "4,9/5", label: "satisfaction moyenne" }
] as const

export const hestiaLogos = ["Airbnb", "Booking.com", "Abritel", "Stripe", "Google", "Vrbo"] as const

export const hestiaFeatures: HestiaFeature[] = [
  {
    icon: "Globe",
    title: "Réservations directes",
    description:
      "Un site de réservation à votre nom, sans intermédiaire. Vos voyageurs réservent chez vous, pas sur une marketplace."
  },
  {
    icon: "CalendarSync",
    title: "Synchronisation calendrier",
    description:
      "Connectez Airbnb, Booking, Abritel et vos autres canaux. Une seule disponibilité, zéro double réservation."
  },
  {
    icon: "CreditCard",
    title: "Paiements Stripe",
    description:
      "Encaissez par carte, Apple Pay et Google Pay. Versements sécurisés, conformes et familiers pour vos voyageurs."
  },
  {
    icon: "Images",
    title: "Galerie premium",
    description:
      "Mettez votre bien en valeur avec des galeries rapides, optimisées mobile et pensées pour convertir."
  },
  {
    icon: "Smartphone",
    title: "Sites mobile-first",
    description:
      "Plus de 70 % des recherches se font sur mobile. Votre site s’adapte parfaitement à chaque écran."
  },
  {
    icon: "Inbox",
    title: "Gestion des réservations",
    description:
      "Vue centralisée des demandes, confirmations, messages et statuts — sans jongler entre dix onglets."
  },
  {
    icon: "Link",
    title: "Domaine personnalisé",
    description:
      "Publiez sur votre-domaine.com pour renforcer votre marque et inspirer confiance dès la première visite."
  },
  {
    icon: "Search",
    title: "Pages optimisées SEO",
    description:
      "Balises, structure sémantique et performances soignées pour être trouvé sur Google par les voyageurs en direct."
  },
  {
    icon: "MessageSquare",
    title: "Messagerie voyageurs",
    description:
      "Échangez avec vos hôtes avant et pendant le séjour, depuis un fil unique lié à chaque réservation."
  },
  {
    icon: "BarChart3",
    title: "Tableau de bord",
    description:
      "Revenus, occupation, canaux et tendances — les chiffres utiles pour piloter votre activité."
  },
  {
    icon: "Building2",
    title: "Multi-biens",
    description:
      "Gérez plusieurs logements, équipes et sites depuis un seul compte, avec des droits par propriété."
  },
  {
    icon: "Zap",
    title: "Réservation instantanée",
    description:
      "Confirmez automatiquement les séjours éligibles et réduisez les allers-retours inutiles."
  }
]

export const hestiaSteps: HestiaStep[] = [
  {
    step: "01",
    title: "Créez votre page bien",
    description:
      "Importez vos photos, vos tarifs et votre description. Hestia génère un site élégant en quelques minutes — sans code."
  },
  {
    step: "02",
    title: "Synchronisez vos calendriers",
    description:
      "Reliez vos annonces existantes. Vos nuits disponibles restent à jour partout, automatiquement."
  },
  {
    step: "03",
    title: "Recevez des réservations directes",
    description:
      "Partagez votre lien, acceptez les paiements et gardez la relation avec vos voyageurs — et vos marges."
  }
]

export const hestiaExamples: HestiaExample[] = [
  {
    title: "Villa Écrins",
    location: "Chamonix, France",
    tag: "Villa · 8 voyageurs",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Loft Marais",
    location: "Paris, France",
    tag: "Appartement · 4 voyageurs",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef936e88a?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Cabane des Cévennes",
    location: "Lozère, France",
    tag: "Nature · 2 voyageurs",
    image:
      "https://images.unsplash.com/photo-1518780664697-55e3ad2bdbf2?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Maison Lagon",
    location: "Île de Ré, France",
    tag: "Bord de mer · 6 voyageurs",
    image:
      "https://images.unsplash.com/photo-1499793983690-e29da9e6caae?auto=format&fit=crop&w=900&q=80",
  }
]

export const hestiaBenefits = [
  {
    title: "Économisez sur les commissions",
    description: "Gardez jusqu’à 15–20 % par réservation en passant au direct."
  },
  {
    title: "Possédez votre marque",
    description: "Votre nom, vos photos, votre ton — pas celui d’une plateforme."
  },
  {
    title: "Fidélisez vos voyageurs",
    description: "Les clients satisfaits reviennent chez vous, pas via un algorithme."
  },
  {
    title: "Moins de dépendance",
    description: "Diversifiez vos canaux sans abandonner Airbnb — complétez-le."
  },
  {
    title: "Marges plus saines",
    description: "Fixez vos prix, vos frais et vos règles sans surprise."
  },
  {
    title: "Relation directe",
    description: "Échangez avec vos hôtes avant, pendant et après le séjour."
  }
] as const

export const hestiaTestimonials: HestiaTestimonial[] = [
  {
    quote:
      "En trois semaines, 40 % de mes réservations passent par mon site Hestia. L’interface est plus claire que mes anciens outils.",
    name: "Sophie Martin",
    role: "Villa · Provence",
    country: "France",
    initials: "SM"
  },
  {
    quote:
      "La synchro calendrier Airbnb + Booking fonctionne sans accroc. Je dors mieux depuis que les doubles réservations ont disparu.",
    name: "James Okonkwo",
    role: "3 appartements · Londres",
    country: "Royaume-Uni",
    initials: "JO"
  },
  {
    quote:
      "Mes voyageurs adorent payer en deux clics. Stripe est intégré proprement — exactement ce qu’on attend d’un produit sérieux.",
    name: "Elena Ruiz",
    role: "Gestionnaire · Costa Brava",
    country: "Espagne",
    initials: "ER"
  },
  {
    quote:
      "On dirait le Shopify de la location saisonnière : rapide à lancer, beau, et ça scale quand j’ajoute un nouveau bien.",
    name: "Thomas Keller",
    role: "12 logements · Berlin",
    country: "Allemagne",
    initials: "TK"
  },
  {
    quote:
      "Le SEO m’a apporté des réservations directes que je ne voyais jamais sur les marketplaces. ROI visible dès le premier mois.",
    name: "Marie Dubois",
    role: "Maison d’hôtes · Normandie",
    country: "France",
    initials: "MD"
  },
  {
    quote:
      "Support réactif, produit soigné. Hestia nous a permis de proposer une marque pro à nos propriétaires partenaires.",
    name: "Alex Chen",
    role: "Conciergerie · Lisbonne",
    country: "Portugal",
    initials: "AC"
  }
]

export const hestiaPlans: HestiaPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    priceYearly: 24,
    description: "Pour lancer votre premier site de réservation directe.",
    features: [
      "1 bien",
      "Site Hestia inclus",
      "Synchronisation calendrier",
      "Paiements Stripe",
      "Support e-mail"
    ],
    cta: "Commencer gratuitement"
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 79,
    priceYearly: 65,
    description: "Pour les hôtes qui veulent accélérer le direct.",
    highlighted: true,
    features: [
      "Jusqu’à 5 biens",
      "Domaine personnalisé",
      "Réservation instantanée",
      "Tableau de bord avancé",
      "SEO & analytics",
      "Support prioritaire"
    ],
    cta: "Essayer Pro"
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 199,
    priceYearly: 165,
    description: "Pour les gestionnaires et portefeuilles multi-biens.",
    features: [
      "Biens illimités",
      "Multi-utilisateurs",
      "API & exports",
      "Marque blanche",
      "Account manager dédié",
      "SLA entreprise"
    ],
    cta: "Réserver une démo"
  }
]

export const hestiaFaqs: HestiaFaq[] = [
  {
    question: "Puis-je synchroniser mon calendrier Airbnb ?",
    answer:
      "Oui. Hestia importe et exporte les disponibilités via iCal ou connexions natives selon les canaux. Vos dates restent alignées en continu."
  },
  {
    question: "Puis-je utiliser mon propre nom de domaine ?",
    answer:
      "Dès l’offre Pro, connectez un domaine que vous possédez déjà. Nous gérons le SSL et la configuration technique."
  },
  {
    question: "Faut-il savoir coder ?",
    answer:
      "Non. L’éditeur visuel, les modèles et l’assistant de mise en route vous permettent de publier sans compétence technique."
  },
  {
    question: "Comment fonctionnent les paiements ?",
    answer:
      "Les voyageurs paient sur votre site via Stripe. Les fonds sont versés sur votre compte connecté, avec relevés et rapprochement dans le tableau de bord."
  },
  {
    question: "Stripe est-il pris en charge ?",
    answer:
      "Oui, nativement : cartes, Apple Pay, Google Pay et moyens locaux selon votre pays d’activité."
  },
  {
    question: "Puis-je gérer plusieurs propriétés ?",
    answer:
      "Absolument. Passez d’un bien à un portefeuille complet avec des sites dédiés ou un hub multi-logements."
  }
]
