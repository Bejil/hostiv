export const adminUiLabelsExtendedFr = {
  general: {
    statusKicker: "Statut",
    publicationTitle: "Publication",
    publishedOn: "Publié",
    publishedOff: "Brouillon",
    publishedToggleLabel: "Site publié",
    publishedToggleHint:
      "Visible par les visiteurs sur l’URL publique. Stripe Connect doit être configuré pour publier.",
    seoKicker: "Référencement",
    seoTitle: "SEO",
    seoHint: "Titre, description et image de partage sont gérés dans la personnalisation.",
    trafficKicker: "Audience",
    trafficTitle: "Visites du site",
    trafficHint:
      "Comptabilise les pages vues et visiteurs uniques sur votre site public publié (hors aperçu admin). Fuseau horaire : Europe/Paris.",
    trafficUnpublished:
      "Publiez votre site pour commencer à enregistrer les visites des visiteurs.",
    trafficRefresh: "Actualiser"
  },
  traffic: {
    periodLabel: "Période analysée",
    presets: {
      last7Days: "7 derniers jours",
      last30Days: "30 derniers jours",
      lastSixMonths: "6 derniers mois"
    },
    loading: "Chargement des statistiques…",
    errors: {
      load: "Impossible de charger les statistiques de trafic."
    },
    stats: {
      pageViews: "Pages vues",
      uniqueVisitors: "Visiteurs uniques",
      dailyAverage: "Moyenne / jour",
      onPeriod: "sur la période",
      viewsPerDay: "pages vues / jour"
    },
    dailyTitle: "Par jour",
    monthlyTitle: "Par mois",
    chartAria: "Évolution du trafic sur la période",
    chartTooltipViews: "Pages vues",
    chartTooltipVisitors: "Visiteurs uniques",
    summaryAria: "Synthèse du trafic",
    dayMeta: "{views} vues · {visitors} visiteur(s)",
    dayMetaPlural: "{views} vues · {visitors} visiteurs",
    monthMeta: "{views} vues · {visitors} visiteur(s)",
    monthMetaPlural: "{views} vues · {visitors} visiteurs",
    empty: {
      title: "Aucune visite sur cette période",
      description:
        "Les statistiques apparaissent dès qu’un visiteur consulte votre site public publié."
    },
    note:
      "Les visiteurs uniques sont estimés sans cookie publicitaire, à partir d’une empreinte anonymisée renouvelée chaque jour."
  },
  cohosts: {
    kicker: "Équipe",
    title: "Co-hôtes",
    description:
      "Invitez une personne de confiance à gérer le site avec vous. Les co-hôtes ont accès au backoffice, sauf la publication, Stripe et la suppression du compte.",
    emailLabel: "E-mail du co-hôte",
    emailPlaceholder: "prenom@exemple.com",
    inviteCta: "Envoyer l’invitation",
    inviting: "Envoi…",
    membersTitle: "Co-hôtes actifs",
    pendingTitle: "Invitations en attente",
    emptyMembers: "Aucun co-hôte pour le moment.",
    emptyPending: "Aucune invitation en cours.",
    removeMember: "Retirer",
    removeConfirmTitle: "Retirer ce co-hôte ?",
    removeConfirmMessage: "{email} n’aura plus accès au backoffice de ce site.",
    removeConfirmCta: "Retirer le co-hôte",
    removingMember: "Retrait…",
    revokeInvite: "Annuler",
    inviteSent: "Invitation envoyée.",
    memberRemoved: "Co-hôte retiré.",
    inviteRevoked: "Invitation annulée.",
    lockedCta: "Débloquer les co-hôtes",
    inviteRequiresPremium: "L’invitation de co-hôtes est réservée aux forfaits Pro et Starter +.",
    expiresOn: "Expire le {date}",
    invitePageChecking: "Vérification de l’invitation…",
    invitePageLead: "Vous êtes invité·e à co-gérer {brand} (/{slug}).",
    invitePageEmailHint: "Connectez-vous avec l’adresse {email}.",
    invitePageCreateHint: "Aucun compte Hostiv pour cette adresse. Créez le vôtre pour rejoindre l’équipe.",
    invitePageConfirmPassword: "Confirmer le mot de passe",
    invitePageCreateCta: "Créer mon compte et accepter",
    invitePageCreating: "Création du compte…",
    invitePageFirstNameRequired: "Indiquez votre prénom.",
    invitePageAcceptCta: "Accepter l’invitation",
    invitePageAccepting: "Acceptation…",
    invitePageSignInCta: "Se connecter et accepter",
    invitePageSigningIn: "Connexion…",
    invitePageInvalidToken: "Lien d’invitation invalide.",
    invitePageVerifyFailed: "Impossible de vérifier cette invitation.",
    invitePageAcceptFailed: "Impossible d’accepter l’invitation.",
    invitePageSignInFailed: "Connexion impossible.",
    invitePageAlreadyAccepted: "Cette invitation a déjà été acceptée.",
    invitePageExpired: "Cette invitation a expiré.",
    invitePageInvalid: "Invitation introuvable ou invalide."
  },
  layout: {
    listAria: "Mises en page du site",
    statusActive: "Sélectionnée",
    choose: "Choisir"
  },
  appearance: {
    layoutLegend: "Mise en page",
    layoutHint: "Structure du hero, de la réservation et des sections sur tout le site.",
    themeLegend: "Ambiance",
    themeHint: "Couleurs, typographies et style des cartes sur l’ensemble du site."
  },
  welcomeGuide: {
    lockedTitle: "Guide d’accueil",
    lockedLead:
      "Créez un guide d’accueil PDF imprimable pour vos voyageurs — activez Starter + ({price}€/an) ou passez au forfait Pro.",
    unlockCta: "Débloquer le guide d’accueil"
  },
  publishPaywall: {
    planChangeFailed: "Impossible de changer de forfait.",
    loginRequired: "Connectez-vous pour régler votre forfait.",
    paymentOpenFailed: "Impossible d’ouvrir la page de paiement.",
    kickerAccess: "Forfait Hostiv",
    kickerPublish: "Publication",
    titleAccess: "Renouvelez votre forfait pour accéder au backoffice",
    titlePublish: "Activez votre forfait pour publier",
    leadAccess:
      "Votre forfait annuel n’est plus actif. Réglez le renouvellement (12 mois, sans reconduction automatique) pour retrouver l’éditeur.",
    leadPublish:
      "Réglez le forfait annuel Hostiv pour publier (12 mois, sans reconduction automatique).",
    plansLegend: "Choisir un forfait",
    plansAriaLabel: "Forfait Hostiv",
    expiredNotice:
      "Votre précédente période a expiré le {date} — le site a été remis en brouillon.",
    continueDraft: "Continuer en brouillon",
    paying: "Redirection…",
    planUpdating: "Mise à jour…",
    payCta: "Payer {price}€ / an"
  },
  promoCode: {
    label: "Code promo",
    placeholder: "Saisissez votre code",
    apply: "Appliquer",
    applying: "Vérification…",
    remove: "Retirer",
    applied: "Code appliqué :"
  },
  publishStripe: {
    title: "Publication impossible",
    subtitle:
      "Stripe Connect n’est pas encore configuré ou validé. Terminez la configuration dans Comptabilité pour recevoir les paiements et publier votre site.",
    openAccounting: "Ouvrir Comptabilité"
  },
  starterPlusSuccess: {
    title: "Starter + activé",
    subtitle:
      "Votre paiement est confirmé. Vous pouvez créer votre guide d’accueil PDF et générer des factures pour vos réservations directes.",
    periodLabel: "Période Starter +",
    periodRange: "Du {start} au {end}",
    openWelcomeGuide: "Ouvrir le guide d’accueil"
  },
  subscription: {
    statusExpired: "Expiré",
    statusInactive: "Inactif",
    statusStarterPlusActive: "Starter + actif",
    statusActive: "Actif",
    statusPlatformAdmin: "Actif — équipe Hostiv",
    periodUntil: "Jusqu’au {date}",
    periodSince: "Depuis le {date}",
    periodRange: "Du {start} au {end}",
    periodUnlimited: "Illimité",
    kicker: "Abonnement Hostiv",
    platformAdminPriceLabel: "Offert",
    platformAdminNote:
      "Compte administrateur Hostiv : forfait Pro actif sans limite de durée, sans paiement annuel.",
    platformAdminRenewalNote: "Aucun renouvellement requis pour ce compte.",
    starterPlusPeriodLabel: "Starter +",
    renewalNote: "Renouvellement manuel · 12 mois, sans reconduction automatique",
    footerExpired:
      "Forfait expiré — renouvelez pour retrouver l’accès complet au backoffice.",
    footerNoPlan: "Aucun forfait actif — réglez le paiement annuel Hostiv pour activer l’accès.",
    footerStarterPlusUpsell:
      "Starter + : guide d’accueil PDF et factures réservations (+{price}€ / {period}).",
    footerStarterPlusActive:
      "Guide d’accueil PDF et factures réservations actifs jusqu’à la fin de Starter +.",
    starterPlusInsightTitle: "Boostez votre forfait Starter",
    starterPlusInsightKicker: "Option Starter +",
    starterPlusInsightCta: "Activer Starter + — {price}€ / {period}"
  },
  guestReviews: {
    loading: "Chargement des avis...",
    errors: {
      load: "Impossible de charger les avis.",
      delete: "Suppression impossible."
    },
    summary: {
      ariaLabel: "Synthèse des avis voyageurs",
      averageRating: "Note moyenne",
      outOfFive: "sur 5",
      totalReviews: "Avis reçus",
      withComment: "Avec commentaire",
      withCommentRate: "{percent} % du total",
      latestReview: "Dernier avis",
      distribution: "Répartition des notes",
      starCount: "{count} avis",
      starCountOne: "1 avis",
      noDate: "—"
    },
    empty: {
      title: "Aucun avis pour le moment",
      description:
        "Les voyageurs reçoivent un e-mail après leur départ pour laisser un avis pendant 7 jours."
    },
    sort: {
      label: "Trier par",
      dateDesc: "Plus récents",
      dateAsc: "Plus anciens",
      ratingDesc: "Meilleure note",
      ratingAsc: "Note la plus basse"
    },
    count: "{count} avis",
    countPlural: "{count} avis",
    paginationRange: "{start}–{end} sur {total}",
    paginationPage: "Page {page} / {total}",
    paginationAria: "Pagination des avis",
    paginationPrev: "Précédent",
    paginationNext: "Suivant",
    stayDates: "Séjour : {dates}",
    deleteConfirmTitle: "Supprimer cet avis ?",
    deleteConfirmBody: "Cette action est définitive.",
    addVerbatim: "Ajouter aux verbatims",
    addVerbatimAlready: "Déjà ajouté",
    addVerbatimDisabled: "Commentaire vide — impossible d’ajouter ce verbatim."
  },
  reservations: {
    status: {
      all: "Tous les statuts",
      upcoming: "À venir",
      past: "Passée",
      cancelled: "Annulée"
    },
    calendar: {
      loading: "Chargement...",
      refresh: "Actualiser",
      otherCalendars: "Autres calendriers",
      icsExportLink: "Lien ICS export",
      externalCalendar: "Calendrier externe",
      loadingList: "Chargement des réservations...",
      manualBlockHint:
        "Cliquez sur une date disponible pour la bloquer manuellement, ou sur un blocage manuel pour la rouvrir.",
      clickToBlock: "Cliquer pour bloquer cette date",
      clickToUnblock: "Cliquer pour débloquer cette date",
      manualBlockSource: "Blocage manuel",
      hostivReservationSource: "Réservation Hostiv"
    },
    errors: {
      invoicePdf: "Impossible de générer la facture PDF.",
      delete: "Suppression impossible.",
      icsLoad: "Impossible de charger les calendriers ICS.",
      listLoad: "Impossible de charger les réservations.",
      icsUrl: "Impossible de générer le lien ICS.",
      manualBlock: "Impossible d’enregistrer le blocage manuel."
    },
    empty: {
      title: "Aucune réservation pour le moment",
      description:
        "Les réservations confirmées sur votre site apparaîtront ici dès qu’un voyageur aura finalisé son séjour."
    },
    noMatch: {
      title: "Aucune réservation ne correspond",
      description: "Modifiez les dates ou les statuts, ou réinitialisez les filtres pour tout afficher."
    },
    filters: {
      stayPeriod: "Période du séjour",
      allDates: "Toutes les dates",
      reset: "Réinitialiser"
    },
    plurals: {
      night: "nuit",
      nights: "nuits",
      adult: "adulte",
      adults: "adultes",
      child: "enfant",
      children: "enfants",
      baby: "bébé",
      babies: "bébés",
      reservation: "réservation",
      reservations: "réservations"
    },
    countAll: "{count} réservation",
    countAllPlural: "{count} réservations",
    countFiltered: "{visible} sur {total} réservation",
    countFilteredPlural: "{visible} sur {total} réservations",
    paginationRange: "{start}–{end} sur {total}",
    paginationPage: "Page {page} / {total}",
    paginationAria: "Pagination des réservations",
    paginationPrev: "Précédent",
    paginationNext: "Suivant",
    actions: {
      invoiceGenerating: "Génération de la facture…",
      invoiceDownload: "Télécharger la facture PDF",
      edit: "Modifier la réservation",
      delete: "Supprimer la réservation"
    },
    deleteConfirm: {
      title: "Supprimer la réservation",
      message:
        "Supprimer définitivement la réservation de {guest} ?\n\nCette action est irréversible.",
      confirm: "Supprimer"
    },
    guestFallback: "ce voyageur"
  },
  reservationModal: {
    kicker: "Détail réservation",
    refunded: "Remboursée",
    confirmedOn: "Confirmée le {date}",
    fields: {
      arrival: "Arrivée",
      departure: "Départ",
      adults: "Adultes",
      children: "Enfants",
      babies: "Bébés",
      amount: "Montant (€)",
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail",
      phone: "Téléphone",
      status: "Statut",
      message: "Message du voyageur"
    },
    hints: {
      invalidDates: "Dates invalides",
      night: "nuit",
      nights: "nuits",
      person: "personne",
      persons: "personnes",
      refundRecorded: "Remboursement Stripe enregistré"
    },
    statusOptions: {
      confirmed: "Confirmée",
      cancelled: "Annulée"
    },
    actions: {
      markCancelled: "Marquer comme annulée",
      refund: "Rembourser le voyageur (Stripe)",
      refunding: "Remboursement…",
      delete: "Supprimer",
      deleting: "Suppression…"
    },
    messages: {
      saved: "Réservation enregistrée.",
      saveFailed: "Enregistrement impossible.",
      deleteFailed: "Suppression impossible.",
      refundSuccess:
        "Remboursement effectué. Le voyageur sera crédité sous quelques jours ouvrés.",
      refundFailed: "Remboursement impossible."
    },
    confirm: {
      cancelTitle: "Marquer comme annulée",
      cancelMessage:
        "Marquer la réservation de {guest} comme annulée ?\n\nAucun remboursement ne sera effectué automatiquement.",
      cancelConfirm: "Marquer annulée",
      deleteTitle: "Supprimer la réservation",
      deleteMessage:
        "Supprimer définitivement la réservation de {guest} ?\n\nCette action est irréversible.",
      deleteConfirm: "Supprimer",
      refundTitle: "Rembourser le voyageur",
      refundMessage:
        "Rembourser {amount} à {guest} via Stripe ?\n\nLa réservation sera marquée comme annulée.",
      refundConfirm: "Rembourser"
    }
  },
  reservationsIcs: {
    title: "Lien ICS des réservations",
    subtitle:
      "Synchronisez les réservations directes de votre site vers Airbnb, Booking ou Abritel.",
    generating: "Génération du lien…",
    urlLabel: "URL ICS",
    hint:
      "Collez ce lien dans la section « importer un calendrier » de votre plateforme externe. Y figurent les réservations confirmées et les blocages manuels de votre admin.",
    rotateHint:
      "Si ce lien a été partagé par erreur, régénérez-le : l’ancien lien sera immédiatement invalidé.",
    rotateCta: "Régénérer le lien",
    rotating: "Régénération…",
    copied: "Copié",
    copyCta: "Copier le lien"
  },
  dateRange: {
    defaultLabel: "Période",
    emptySummary: "Toutes les dates",
    dayOne: "1 jour",
    days: "{count} jours",
    headTitle: "Sélectionnez une période",
    headHint: "Choisissez la date de début, puis la date de fin.",
    clear: "Effacer",
    start: "Début",
    end: "Fin"
  },
  stripeConnect: {
    loading: "Chargement du statut Stripe…",
    alerts: {
      connectModeMismatch:
        "Votre compte Stripe Connect a été créé en mode test. Les clés de production (Live) ne peuvent pas l’utiliser : cliquez sur « Connecter mon compte Stripe » pour refaire l’onboarding en mode réel.",
      testKeysWarning:
        "Les clés Stripe du serveur sont encore en mode test (sk_test_). Sur Vercel, utilisez STRIPE_SECRET_KEY et NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en sk_live_ / pk_live_, puis redéployez.",
      paymentsBlocked:
        "Les voyageurs ne pourront pas payer par carte tant que Stripe n’a pas validé votre compte."
    },
    status: {
      notConfigured: "Non configuré",
      paymentsActive: "Paiements actifs",
      verificationPending: "Vérification en cours",
      setupIncomplete: "Configuration à terminer"
    },
    progressLabel: "Progression de la configuration",
    readyNote:
      "Votre compte est opérationnel. Les paiements des réservations directes sont versés sur votre compte bancaire via Stripe.",
    steps: {
      account: "Compte Stripe créé",
      identity: "Identité transmise à Stripe",
      charges: "Paiements par carte activés",
      payouts: "Virements bancaires activés"
    },
    meta: {
      platformFee: "Commission plateforme",
      platformFeeValue: "{percent} % par réservation",
      activatedOn: "Activé le"
    },
    cta: {
      connect: "Connecter mon compte Stripe",
      resume: "Reprendre la configuration Stripe",
      dashboard: "Tableau de bord Stripe"
    },
    requirements: {
      title: "Informations demandées par Stripe",
      accountRestricted: "Compte restreint"
    }
  },
  accounting: {
    refresh: "Actualiser",
    paymentsNav: {
      verifying: "Vérification en cours…",
      paymentsActive: "Paiements par carte actifs",
      setupIncomplete: "Configuration à terminer",
      stripeConnect: "Stripe Connect"
    },
    stripeErrors: {
      load: "Impossible de charger le statut Stripe.",
      onboard: "Impossible d’ouvrir l’onboarding Stripe.",
      dashboard: "Impossible d’ouvrir le tableau de bord Stripe."
    },
    stripeReturn: {
      returnPending: "Retour depuis Stripe. Actualisation du statut…",
      refreshPending: "Reprise de la configuration Stripe…",
      ready: "Votre compte est prêt à recevoir les paiements.",
      incomplete:
        "Configuration enregistrée. Terminez les étapes indiquées par Stripe si nécessaire."
    },
    pricingTabsAria: "Tarification"
  },
  revenue: {
    periodLabel: "Période analysée",
    presets: {
      lastMonth: "Dernier mois",
      lastSixMonths: "6 derniers mois"
    },
    errors: {
      load: "Impossible de charger les rendements."
    },
    loading: "Chargement des rendements…",
    stats: {
      totalGross: "Total encaissé",
      monthlyAverage: "Moyenne mensuelle",
      netEstimated: "Net estimé",
      onPeriod: "sur la période",
      monthsShown: "Sur {count} mois affiché(s)",
      afterCommission: "Après commission {percent} %",
      commissionNotConfigured: "Commission plateforme non configurée"
    },
    reservationCount: "{count} réservation",
    reservationCountPlural: "{count} réservations",
    monthNet: "Net estimé {amount}",
    summaryAria: "Synthèse des encaissements",
    empty: {
      title: "Aucun encaissement sur cette période",
      description:
        "Élargissez la plage de dates ou attendez une nouvelle réservation directe confirmée et payée."
    }
  },
  bookingTabs: {
    night: "Par nuit",
    week: "Par semaine",
    month: "Par mois"
  },
  bookingConfig: {
    pricingAria: "Tarification",
    baseKicker: "Tarif de base",
    longStayKicker: "Remise longue durée",
    nightPrice: "Prix par nuit (€)",
    includedGuests: "Voyageurs inclus",
    extraGuest: "Supplément voyageur / nuit (€)",
    enableDiscount: "Activer la remise",
    minNights: "Nuits minimum",
    discountPercent: "Remise (%)"
  },
  cancellation: {
    kicker: "Conditions",
    title: "Politique d'annulation",
    lead:
      "Affichée sous les tarifs sur votre site et dans la modal de réservation. Laissez le remboursement à 0 % pour la masquer.",
    fields: {
      refundPercent: "Remboursement (%)",
      refundHint: "Part du montant remboursée si l'annulation est faite assez tôt.",
      daysBefore: "Délai minimum (jours)",
      daysHint: "Nombre de jours avant la date d'arrivée (inclus)."
    },
    previewLabel: "Aperçu site",
    previewHidden: "Non affichée sur le site tant que le remboursement est à 0 %.",
    policyFull:
      "Remboursement intégral en cas d'annulation au moins {days} avant la date d'arrivée.",
    policyPartial:
      "Remboursement de {percent} % en cas d'annulation au moins {days} avant la date d'arrivée.",
    dayOne: "1 jour",
    dayMany: "{count} jours"
  },
  pricingPreview: {
    label: "Aperçu",
    ariaLabel: "Aperçu section tarifs",
    fallback: {
      eyebrow: "Sur-titre",
      title: "Titre de la section",
      intro: "Introduction de la section tarifs."
    }
  },
  seoKeywords: {
    pillAria: "Langue des mots-clés SEO",
    frLabel: "Mots-clés (français)",
    enLabel: "Mots-clés (anglais)",
    label: "Mots-clés",
    chipsAria: "Mots-clés ajoutés",
    removeChip: "Retirer {keyword}",
    placeholder: {
      add: "Ajouter un mot-clé…",
      limit: "Limite atteinte",
      empty: "Saisir un mot-clé, puis virgule ou Entrée"
    },
    hint: "Ajoutez jusqu’à {max} mots-clés. Virgule ou Entrée pour valider. {remaining} restant(s).",
    suggestionsLabel: "Suggestions",
    limitModal: {
      title: "Limite de mots-clés atteinte",
      subtitle:
        "Vous pouvez enregistrer au maximum {max} mots-clés. Supprimez-en un pour en ajouter un autre.",
      understood: "Compris"
    }
  },
  customization: {
    blockStatus: {
      complete: "Section complète",
      incomplete: "Section à compléter"
    },
    fields: {
      logo: "Logo",
      title: "Titre",
      subtitle: "Sous-titre",
      heroImage: "Image de fond",
      eyebrow: "Sur-titre",
      text: "Texte",
      hostPhoto: "Photo hôte",
      reviewsBg: "Image de fond",
      checkInOut: "Arrivée & départ"
    },
    bookingNotice:
      "Le paramétrage des tarifs (prix par nuit, remises, voyageurs inclus) se fait dans l’onglet",
    bookingNoticeAccounting: "Comptabilité",
    openAccounting: "Ouvrir Comptabilité"
  },
  location: {
    geocodeAddressTooShort: "Saisissez une adresse complète (au moins 5 caractères).",
    geocodeAuthRequired: "Connexion requise pour géocoder l’adresse.",
    geocodeLoading: "Recherche de la position…",
    geocodeSuccess: "Position et zone mises à jour automatiquement.",
    geocodeFailed: "Impossible de localiser cette adresse.",
    addressLabel: "Adresse",
    addressHint:
      "La position et la zone sur le site public sont calculées automatiquement à partir de cette adresse.",
    leadLabel: "Chapô"
  },
  imageUpload: {
    ariaUploading: "Envoi de {label}",
    ariaReplace: "Remplacer {label}",
    uploading: "Envoi…",
    choose: "Choisir",
    chooseImage: "Choisir une image",
    uploadFailed: "Échec de l’envoi."
  },
  fieldTranslate: {
    aria: "Traduire ce champ",
    empty: "Rien à traduire.",
    error: "Traduction impossible."
  },
  liveEditor: {
    modeLabel: "Éditeur visuel",
    toolbarNoteWelcomeGuide:
      "Aperçu live du guide · modifications visibles en quelques secondes",
    toolbarNoteCustomization: "Aperçu instantané · enregistrez pour publier",
    siteLocalePillAria: "Langue du site à personnaliser",
    welcomeGuideLocalePillAria: "Langue du guide de bienvenue à personnaliser",
    galleryLocalePillAria: "Langue de la galerie à personnaliser",
    toggleHide: "Masquer l’aperçu",
    toggleShow: "Afficher l’aperçu"
  },
  livePreview: {
    badge: "Aperçu live",
    hint: "Modifications visibles sans enregistrer · faites défiler l’aperçu pour parcourir la page",
    dimensionsFull: "{width}px · 100 %",
    dimensionsScaled: "{width}px · {percent} % (ajusté au panneau)",
    viewportTabsAria: "Taille d’écran",
    iframeTitle: "Aperçu du site"
  },
  account: {
    settingsTitle: "Paramètres du compte",
    settingsSubtitle:
      "Gérez vos informations Hostiv, votre mot de passe et la suppression de compte. Les demandes et réservations sont envoyées à l’e-mail de ce compte.",
    pageTitle: "Compte — {name}",
    pageBack: "Retour au backoffice",
    deleteSlugMismatch: "Saisissez exactement « {slug} » pour confirmer.",
    deleteFailed: "Impossible de supprimer le compte.",
    loading: "Chargement…",
    loadFailed: "Impossible de charger votre compte.",
    identityTitle: "Identité",
    identityLead: "Ces informations sont liées à votre compte Hostiv (connexion au backoffice).",
    passwordTitle: "Mot de passe",
    passwordLead: "Laissez vide pour conserver le mot de passe actuel.",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    saveAccount: "Enregistrer le compte",
    dangerTitle: "Zone de danger",
    dangerLead:
      "La suppression de votre compte efface définitivement votre site, vos données et votre accès Hostiv.",
    deleteAccount: "Supprimer mon compte…",
    errors: {
      passwordInvalid: "Choisissez un mot de passe qui respecte tous les critères de sécurité.",
      passwordMismatch: "Les deux mots de passe ne correspondent pas.",
      passwordConfirmEmpty: "Saisissez le nouveau mot de passe ou videz la confirmation.",
      saveFailed: "Impossible d’enregistrer les modifications."
    },
    success: {
      updated: "Compte mis à jour.",
      emailChanged:
        "Compte mis à jour. Si vous changez d’e-mail, utilisez la nouvelle adresse pour vous reconnecter."
    },
    passwordRules: {
      intro:
        "Votre mot de passe doit être suffisamment long et complexe en intégrant des lettres (majuscules et minuscules), des chiffres, de la ponctuation et des caractères spéciaux :",
      length: "Au moins {min} caractères",
      lowercase: "Une lettre minuscule",
      uppercase: "Une lettre majuscule",
      digit: "Un chiffre",
      special: "Un caractère spécial ou de ponctuation"
    },
    fields: {
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail"
    },
    plans: {
      loading: "Chargement des forfaits…",
      loadFailed: "Impossible de charger vos forfaits.",
      propertiesTitle: "Forfaits par logement",
      propertiesLead:
        "Chaque logement a son propre forfait annuel Hostiv. Les dates et options actives sont indiquées ci-dessous.",
      currentPropertyBadge: "Site actuel",
      unpublishedBadge: "Non publié",
      paymentsTitle: "Historique des paiements",
      paymentsLead: "Paiements Stripe enregistrés sur votre compte Hostiv (50 derniers).",
      paymentsEmpty: "Aucun paiement enregistré pour le moment.",
      paymentsDate: "Date",
      paymentsProduct: "Produit",
      paymentsProperty: "Logement",
      paymentsAmount: "Montant",
      checkoutTypes: {
        hostiv_signup: "Inscription",
        hostiv_subscription: "Forfait annuel",
        hostiv_premium_tools: "Starter +"
      }
    },
    deleteModal: {
      title: "Supprimer définitivement votre compte ?",
      subtitle: "Cette action est irréversible. Les éléments suivants seront supprimés :",
      items: [
        "Votre compte Hostiv et votre accès au backoffice",
        "Votre site /{slug} et tous ses contenus",
        "Les fichiers et images associés",
        "Votre compte Stripe Connect",
        "L’historique des réservations enregistrées sur ce site",
        "Les accès co-hôtes sur ce site (et leurs comptes Hostiv s’ils n’ont pas d’autre site)"
      ],
      confirmLabel: "Pour confirmer, saisissez l’adresse de votre site :",
      confirmation: "Confirmation",
      deleting: "Suppression…",
      confirmCta: "Supprimer mon compte"
    }
  },
  onboardingFields: {
    examplesLabel: "Exemples :",
    layoutLegend: "Mise en page",
    themeLegend: "Ambiance",
    labels: {
      logo: "Logo",
      brandName: "Nom affiché",
      brandMeta: "Sous-titre",
      heroPhoto: "Photo principale",
      heroEyebrow: "Sur-titre",
      heroTitle: "Titre d’accueil",
      heroText: "Texte d’introduction",
      hostPhoto: "Photo hôte",
      hostCaption: "Légende photo",
      hostTitle: "Titre",
      hostQuote: "Citation",
      hostIntro: "Intro 1",
      nightPrice: "Prix par nuit (€)",
      includedGuests: "Voyageurs inclus"
    },
    includedGuestsHint: "Nombre de voyageurs couverts par le tarif de base.",
    examples: {
      brandName: ["The Grand Appartement", "Maison des Lilas"],
      logo: ["Logo horizontal sur fond clair", "PNG ou SVG, fond transparent de préférence"],
      brandMeta: ["Le Chesnay · Versailles", "Appartement familial · 10 min du centre"],
      heroPhoto: [
        "Salon lumineux vu depuis l’entrée",
        "Façade ou pièce la plus représentative du logement"
      ],
      heroEyebrow: [
        "Appartement entier · Le Chesnay",
        "Maison de vacances · 10 min de la mer"
      ],
      heroTitle: [
        "Séjournez au calme, sans compromis sur le confort",
        "Un pied-à-terre familial, à deux pas du centre-ville"
      ],
      heroText: [
        "Un appartement de charme avec arrivée autonome, proche des commerces et des transports.",
        "54 m², 4 voyageurs, espace télétravail et équipements pensés pour les familles."
      ],
      hostPhoto: [
        "Portrait en situation, regard caméra",
        "Photo naturelle, sourire, dans le logement ou devant l’entrée"
      ],
      hostCaption: ["Sophie · votre hôte", "Marc & Julie · vos hôtes"],
      hostTitle: [
        "Une adresse familiale à laquelle nous sommes attachés",
        "Un logement que nous ouvrons avec soin, saison après saison"
      ],
      hostQuote: [
        "Un ancien chez-nous que nous ouvrons avec attention — pour que vous vous sentiez attendus.",
        "Nous aimons accueillir des voyageurs curieux, pas seulement des visiteurs de passage."
      ],
      hostIntro: [
        "Je m’occupe personnellement de l’accueil et reste disponible pendant votre séjour pour répondre à vos questions.",
        "Nous habitons à proximité : arrivée autonome le soir, conseils sur le quartier le lendemain si besoin."
      ],
      nightPrice: ["95 € / nuit", "120 € en haute saison"],
      includedGuests: ["2 voyageurs", "4 voyageurs (famille)"]
    }
  },
  template: {
    ariaSelected: "Thème du site : {name}",
    listAria: "Choisir un thème",
    statusActive: "Actif",
    choose: "Choisir"
  },
  fieldHelp: {
    ariaOne: "Exemple : {example}",
    ariaMany: "Exemples : {examples}",
    tooltipLabel: "Exemples"
  }
} as const
