export const platformAdminUiFr = {
  shell: {
    title: "Admin Hostiv",
    subtitle: "Administration plateforme",
    logout: "Déconnexion",
    refresh: "Actualiser",
    loading: "Chargement…",
    errorGeneric: "Une erreur est survenue.",
    accessDenied: "Accès réservé aux administrateurs Hostiv.",
    notConfigured: "Admin plateforme non configuré (HOSTIV_PLATFORM_ADMIN_EMAILS)."
  },
  header: {
    account: "Mon compte",
    logout: "Déconnexion",
    refresh: "Actualiser",
    platformLabel: "Administration plateforme"
  },
  common: {
    cancel: "Annuler",
    close: "Fermer",
    save: "Enregistrer",
    saving: "Enregistrement…",
    delete: "Supprimer",
    edit: "Modifier"
  },
  login: {
    title: "Connexion admin",
    subtitle: "Espace réservé à l’équipe Hostiv",
    email: "E-mail",
    password: "Mot de passe",
    submit: "Se connecter",
    checking: "Vérification de la session…"
  },
  dashboard: {
    title: "Vue d’ensemble",
    intro: "Pilotez la plateforme Hostiv en un coup d’œil.",
    hero: {
      members: "Membres",
      sites: "Sites",
      activePlans: "Forfaits actifs",
      revenue: "Revenus encaissés",
      revenue30d: "30 derniers jours"
    },
    sections: {
      plans: "Répartition des forfaits",
      activity: "Activité récente",
      bookings: "Réservations directes",
      health: "Points d’attention"
    },
    recentPayments: "Derniers paiements",
    noRecentPayments: "Aucun paiement enregistré pour le moment.",
    estimatedAnnual: "Estimation annuelle (forfaits actifs)",
    vsLastMonth: "vs mois dernier",
    kpi: {
      sites: "Sites",
      published: "Publiés",
      draft: "Brouillons",
      members: "Membres",
      activeSubs: "Forfaits actifs",
      expiredSubs: "Forfaits expirés",
      unpaidSubs: "Sans paiement",
      pendingSignups: "Inscriptions en attente",
      reservations: "Réservations",
      gmv: "Volume réservations",
      guestReviews: "Avis voyageurs",
      avgRating: "Note moyenne",
      estimatedRevenue: "Revenus (estim.)",
      stripeConnect: "Stripe Connect",
      newMembers30d: "Nouveaux membres (30 j)",
      newSites30d: "Nouveaux sites (30 j)",
      starterActive: "Starter actifs",
      proActive: "Pro actifs",
      starterPlusActive: "Starter+ actifs",
      publishedRate: "Taux de publication",
      connectRate: "Stripe Connect configurés"
    },
    health: {
      expired: "Forfaits expirés",
      unpaid: "Comptes sans paiement",
      pendingSignups: "Inscriptions en attente",
      stripeMissing: "Sites sans Stripe",
      drafts: "Sites en brouillon"
    },
    checkoutTypes: {
      hostiv_signup: "Inscription",
      hostiv_subscription: "Renouvellement",
      hostiv_premium_tools: "Starter+"
    }
  },
  sites: {
    title: "Sites",
    intro: "Tous les sites de location hébergés sur Hostiv.",
    searchPlaceholder: "Rechercher par nom, slug ou e-mail…",
    columns: {
      site: "Site",
      member: "Membre",
      plan: "Forfait",
      status: "Statut",
      subscription: "Abonnement",
      reservations: "Réservations",
      reviews: "Avis",
      stripe: "Stripe",
      created: "Créé le",
      actions: "Actions"
    },
    published: "Publié",
    draft: "Brouillon",
    active: "Actif",
    expired: "Expiré",
    unpaid: "Non payé",
    stripeOk: "Connecté",
    stripeMissing: "Non configuré",
    openAdmin: "Admin site",
    openSite: "Voir le site",
    deleteSite: "Supprimer le site",
    empty: "Aucun site trouvé.",
    deleteModal: {
      title: "Supprimer ce site ?",
      subtitle: "Cette action est irréversible. Les éléments suivants seront supprimés :",
      items: [
        "Le site /{slug} ({brand}) et tous ses contenus",
        "Les fichiers et images associés",
        "Le compte Stripe Connect du site",
        "L’historique des réservations enregistrées sur ce site"
      ],
      confirmLabel: "Pour confirmer, saisissez l’adresse du site :",
      confirmation: "Confirmation",
      deleting: "Suppression…",
      confirmCta: "Supprimer le site"
    }
  },
  members: {
    title: "Membres",
    intro: "Comptes Hostiv et forfaits associés.",
    searchPlaceholder: "Rechercher par e-mail ou nom…",
    columns: {
      member: "Membre",
      plan: "Forfait",
      subscription: "Forfait jusqu’au",
      starterPlus: "Starter+",
      site: "Site",
      registeredAt: "Date d'inscription",
      stripe: "Stripe",
      joined: "Inscrit le",
      actions: "Actions"
    },
    yes: "Oui",
    no: "Non",
    noSite: "—",
    empty: "Aucun membre trouvé.",
    editMember: "Modifier le membre",
    deleteMember: "Supprimer le membre",
    viewMember: "Voir la fiche membre",
    detailModal: {
      title: "Fiche membre",
      subtitle: "Récapitulatif du compte et de l’abonnement.",
      loadFailed: "Impossible de charger le membre.",
      sections: {
        identity: "Identité",
        subscription: "Abonnement",
        site: "Site",
        timeline: "Dates clés"
      },
      fields: {
        name: "Nom",
        email: "E-mail",
        plan: "Forfait",
        subscription: "Statut",
        paidUntil: "Forfait jusqu’au",
        premiumUntil: "Starter+ jusqu’au",
        site: "Adresse",
        siteStatus: "Publication",
        stripe: "Stripe Connect",
        joined: "Inscription",
        subscriptionStarted: "Abonnement depuis"
      }
    },
    deleteModal: {
      title: "Supprimer ce membre ?",
      subtitle: "Cette action est irréversible. Les éléments suivants seront supprimés :",
      items: [
        "Le compte Hostiv et l’accès au backoffice",
        "Le site associé le cas échéant",
        "Les fichiers, images et données Stripe Connect liés"
      ],
      confirmLabel: "Pour confirmer, saisissez l’e-mail du membre :",
      confirmation: "Confirmation",
      deleting: "Suppression…",
      confirmCta: "Supprimer le membre"
    },
    editModal: {
      title: "Modifier le membre",
      subtitle: "Mettez à jour le profil et les identifiants de connexion.",
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail",
      newPassword: "Nouveau mot de passe (optionnel)",
      confirmPassword: "Confirmer le mot de passe",
      loadFailed: "Impossible de charger le membre.",
      saveFailed: "Impossible d’enregistrer les modifications.",
      saved: "Membre mis à jour.",
      passwordMismatch: "Les mots de passe ne correspondent pas.",
      passwordInvalid: "Le mot de passe ne respecte pas tous les critères de sécurité."
    }
  },
  revenue: {
    title: "Revenus",
    intro: "Historique des paiements Stripe Hostiv (inscriptions, renouvellements et Starter+).",
    summary: {
      total: "Total encaissé",
      payments: "Paiements",
      last30d: "30 derniers jours",
      signup: "Inscriptions",
      renewal: "Renouvellements",
      premiumTools: "Starter+"
    },
    columns: {
      date: "Date",
      type: "Type",
      product: "Produit",
      member: "Membre",
      site: "Site",
      amount: "Montant"
    },
    checkoutTypes: {
      hostiv_signup: "Inscription",
      hostiv_subscription: "Renouvellement",
      hostiv_premium_tools: "Starter+"
    },
    empty: "Aucun paiement enregistré pour le moment."
  },
  reservations: {
    title: "Réservations",
    intro: "Réservations directes sur l’ensemble des sites.",
    summary: {
      total: "Total",
      confirmed: "Confirmées",
      cancelled: "Annulées",
      gmv: "Volume total",
      avg: "Panier moyen",
      last30d: "30 derniers jours"
    },
    columns: {
      site: "Site",
      guest: "Voyageur",
      dates: "Séjour",
      amount: "Montant",
      status: "Statut",
      created: "Créée le"
    },
    confirmed: "Confirmée",
    cancelled: "Annulée",
    empty: "Aucune réservation."
  },
  signups: {
    title: "Inscriptions",
    intro: "Inscriptions en cours ou récentes avant/après paiement Stripe.",
    columns: {
      contact: "Contact",
      property: "Projet",
      plan: "Forfait",
      status: "Statut",
      created: "Créée le",
      expires: "Expire le"
    },
    status: {
      pending: "En attente",
      completed: "Terminée",
      failed: "Échouée"
    },
    empty: "Aucune inscription."
  },
  guestReviews: {
    title: "Avis voyageurs",
    intro: "Avis laissés par les voyageurs après leur séjour.",
    columns: {
      site: "Site",
      guest: "Voyageur",
      rating: "Note",
      stay: "Séjour",
      comment: "Commentaire",
      date: "Date"
    },
    empty: "Aucun avis."
  },
  alerts: {
    title: "Alertes",
    intro: "Points d’attention : expirations, Stripe, brouillons, inscriptions.",
    empty: "Aucune alerte pour le moment.",
    severity: {
      critical: "Critique",
      warning: "Attention",
      info: "Info"
    }
  },
  filters: {
    all: "Tous",
    active: "Actifs",
    expired: "Expirés",
    published: "Publiés",
    draft: "Brouillons"
  }
} as const

export type PlatformAdminUi = typeof platformAdminUiFr
