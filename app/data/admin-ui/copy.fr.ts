type AdminCopyField = {
  key: string
  label: string
  type?: "text" | "textarea" | "time"
  fullWidth?: boolean
  hint?: string
  examples?: string[]
}

type AdminCopySection = {
  id: string
  title: string
  fields: AdminCopyField[]
}

/** Sections de textes (content.copy) pour le formulaire admin. */
export const adminCopySectionsFr: AdminCopySection[] = [
  {
    id: "hero",
    title: "Hero",
    fields: [
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: [
          "Appartement entier · Le Chesnay",
          "Maison de vacances · 10 min de la mer"
        ]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Séjournez au calme, sans compromis sur le confort",
          "Un pied-à-terre familial, à deux pas du centre-ville"
        ]
      },
      {
        key: "text",
        label: "Texte",
        type: "textarea" as const,
        examples: [
          "Un appartement de charme avec arrivée autonome, proche des commerces et des transports.",
          "54 m², 4 voyageurs, espace télétravail et équipements pensés pour les familles."
        ]
      }
    ]
  },
  {
    id: "platform_stats",
    title: "Plateformes (intro)",
    fields: [
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: ["Confiance voyageurs", "Notes et avis"]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Très bien noté sur les plateformes",
          "Des séjours appréciés par les voyageurs"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        type: "textarea",
        fullWidth: true,
        examples: [
          "Des séjours réussis, un logement soigné et un accueil apprécié.",
          "Plusieurs centaines d’avis positifs sur Airbnb, Booking et Abritel."
        ]
      }
    ]
  },
  {
    id: "host",
    title: "Hôte",
    fields: [
      {
        key: "caption",
        label: "Légende photo",
        fullWidth: true,
        examples: ["Sophie · votre hôte", "Marc & Julie · vos hôtes"]
      },
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: ["Votre hôte", "Rencontrez votre hôte"]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Une adresse familiale à laquelle nous sommes attachés",
          "Un logement que nous ouvrons avec soin, saison après saison"
        ]
      },
      {
        key: "quote",
        label: "Citation",
        type: "textarea" as const,
        fullWidth: true,
        examples: [
          "Un ancien chez-nous que nous ouvrons avec attention — pour que vous vous sentiez attendus.",
          "Nous aimons accueillir des voyageurs curieux, pas seulement des visiteurs de passage."
        ]
      },
      {
        key: "intro_1",
        label: "Intro 1",
        type: "textarea" as const,
        examples: [
          "Je m’occupe personnellement de l’accueil et reste disponible pendant votre séjour.",
          "Nous habitons à proximité et pouvons vous conseiller sur le quartier."
        ]
      },
      {
        key: "intro_2",
        label: "Intro 2",
        type: "textarea" as const,
        examples: [
          "Arrivée autonome le soir, assistance à distance en français et en anglais.",
          "Nous revenons régulièrement ici en famille — le logement est pensé pour durer."
        ]
      }
    ]
  },
  {
    id: "spaces",
    title: "Espaces",
    fields: [
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: ["Nos espaces coup de cœur", "À découvrir"]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Du salon à la chambre : un appartement à vivre comme chez vous",
          "Des espaces pensés pour se détendre, cuisiner et travailler"
        ]
      },
      {
        key: "intro",
        label: "Description",
        type: "textarea" as const,
        fullWidth: true,
        examples: [
          "Vivre le quotidien, bien dormir, cuisiner sur place et savourer le quartier depuis un cadre calme.",
          "Chaque pièce a sa raison d’être : repos, convivialité, télétravail ou repas en famille."
        ]
      }
    ]
  },
  {
    id: "benefits",
    title: "Atouts",
    fields: [
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: ["Les atouts du logement", "Pourquoi réserver ici"]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Un séjour simple à organiser, agréable à vivre",
          "Confort, autonomie et emplacement au rendez-vous"
        ]
      }
    ]
  },
  {
    id: "location",
    title: "Quartier",
    fields: [
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: ["Quartier & environnement", "Autour du logement"]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Un emplacement stratégique entre commerces et transports",
          "Au calme, à deux pas des commerces et des visites"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        type: "textarea" as const,
        fullWidth: true,
        examples: [
          "Quartier résidentiel calme, idéal pour conjuguer visites, vie quotidienne et déplacements.",
          "Commerces, marchés et gares à proximité pour un séjour sans voiture."
        ]
      },
      {
        key: "lead",
        label: "Chapô",
        type: "textarea" as const,
        fullWidth: true,
        examples: [
          "Quartier calme, commerces à pied et RER à 8 min pour Paris.",
          "Entre le château de Versailles et les forêts — cadre verdoyant, accès facile."
        ]
      }
    ]
  },
  {
    id: "visual",
    title: "Visuel / galerie",
    fields: [
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: ["Explorer le lieu", "En images"]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Quelques images pour vous projeter avant votre arrivée",
          "Parcourez le logement en photos"
        ]
      },
      {
        key: "intro",
        label: "Description",
        type: "textarea" as const,
        fullWidth: true,
        examples: [
          "L’appartement convient aussi bien à un week-end qu’à un séjour plus long, en famille ou pour le travail.",
          "Des photos de jour comme de nuit pour visualiser chaque espace."
        ]
      }
    ]
  },
  {
    id: "pricing",
    title: "Tarifs (textes)",
    fields: [
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: ["Tarifs", "Prix et conditions"]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Des repères simples avant de réserver",
          "Tarifs clairs, sans surprise"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        type: "textarea" as const,
        examples: [
          "En réservant en direct, vous évitez les commissions des plateformes.",
          "Remises à partir de 7 ou 28 nuits — le détail se finalise simplement avec vous."
        ]
      }
    ]
  },
  {
    id: "amenities",
    title: "Équipements (textes)",
    fields: [
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: ["Équipements", "Ce qui est inclus"]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Un cadre chaleureux avec tout le nécessaire pour un séjour serein",
          "Wifi, cuisine équipée et linge fourni"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        type: "textarea" as const,
        examples: [
          "Wifi fibre, cuisine complète, linge fourni et équipements famille.",
          "Tout est pensé pour éviter les mauvaises surprises à l’arrivée."
        ]
      }
    ]
  },
  {
    id: "reviews",
    title: "Avis (textes)",
    fields: [
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: ["Retours voyageurs", "Ils en parlent"]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Des expériences très positives autour du calme et de l’accueil",
          "Ce que disent les voyageurs après leur séjour"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        examples: [
          "Des retours authentiques recueillis après chaque séjour.",
          "La note moyenne est calculée automatiquement à partir de vos verbatims."
        ]
      }
    ]
  },
  {
    id: "rules",
    title: "Règlement",
    fields: [
      {
        key: "eyebrow",
        label: "Sur-titre",
        examples: ["Règlement intérieur", "Conditions de séjour"]
      },
      {
        key: "title",
        label: "Titre",
        examples: [
          "Des règles simples pour un séjour serein",
          "Quelques principes essentiels à respecter"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        type: "textarea" as const,
        examples: [
          "Quelques principes pour préserver le calme du voisinage et le bon état du logement.",
          "Des règles claires pour vous comme pour les voyageurs suivants."
        ]
      },
      {
        key: "check_in_label",
        label: "Label arrivée",
        examples: ["Arrivée", "Check-in"]
      },
      {
        key: "check_in_time",
        label: "Heure d'arrivée",
        type: "time" as const,
        hint: "Heures et minutes (format 24 h)",
        examples: ["17:00", "16:00"]
      },
      {
        key: "check_out_label",
        label: "Label départ",
        examples: ["Départ", "Check-out"]
      },
      {
        key: "check_out_time",
        label: "Heure de départ",
        type: "time" as const,
        hint: "Heures et minutes (format 24 h)",
        examples: ["11:00", "10:00"]
      }
    ]
  },
  {
    id: "booking",
    title: "Réservation (textes)",
    fields: [
      {
        key: "price_recap_note",
        label: "Note récap prix",
        type: "textarea" as const,
        examples: [
          "Montant calculé à partir des tarifs affichés (nuits, remises, voyageurs). Hors taxes de séjour.",
          "Le paiement par carte interviendra à l’étape suivante."
        ]
      },
      {
        key: "price_recap_note_payment",
        label: "Note récap paiement",
        type: "textarea" as const,
        examples: [
          "Règlement par carte sécurisé ci-dessous.",
          "Montant final confirmé avant validation du paiement."
        ]
      }
    ]
  }
] as const

