import type {
  HostivResourceArticle,
  HostivResourceArticleId,
  HostivResourcesIndexContent
} from "./hostiv-resources.types"

export const hostivResourcesIndex: HostivResourcesIndexContent = {
  eyebrow: "Guides hôtes",
  title: "Ressources pour passer au direct",
    intro:
    "11 guides pratiques pour lancer votre site de réservation directe, configurer Stripe, synchroniser vos calendriers et convertir plus de visiteurs.",
  seoTitle: "Ressources Hostiv | Guides site location saisonnière et vacances",
  seoDescription:
    "Guides pour créer et promouvoir votre site de location saisonnière : réservation directe, sync iCal, Stripe et conversion sans commission plateforme.",
  readMoreLabel: "Lire le guide",
  backToIndexLabel: "← Tous les guides",
  readingTimeLabel: "min de lecture"
}

export const hostivResourceArticles: Record<HostivResourceArticleId, HostivResourceArticle> = {
  "passer-au-direct": {
    id: "passer-au-direct",
    title: "Comment passer à la réservation directe sans quitter les OTA",
    description:
      "Stratégie concrète pour lancer un canal direct tout en gardant Airbnb, Booking ou Abritel pour la visibilité.",
    seoTitle: "Passer à la réservation directe | Guide Hostiv",
    seoDescription:
      "Étapes pour lancer un site de réservation directe : positionnement, calendrier, paiement Stripe et promotion sans couper les OTA.",
    publishedAt: "2026-05-01",
    readingMinutes: 11,
    sections: [
      {
        title: "Pourquoi ajouter le direct à votre mix",
        paragraphs: [
          "Les plateformes restent utiles pour la visibilité, mais leur commission réduit votre marge sur chaque nuit. Un site de réservation directe vous permet de convertir les voyageurs déjà intéressés par votre logement — sans reverser ~15 à 20 % au séjour.",
          "Hostiv n’est pas une marketplace : c’est votre site, votre calendrier et vos paiements Stripe. Vous gardez le contrôle du tarif, des conditions et de la relation client.",
          "Le direct n’est pas un « tout ou rien ». La plupart des hôtes qui réussissent combinent visibilité OTA et canal officiel — chaque réservation directe améliore votre résultat net, même en petit volume."
        ],
      },
      {
        title: "À qui s’adresse le direct ?",
        paragraphs: [
          "Le direct fonctionne particulièrement bien si vous avez déjà des avis sur les OTA, des photos de qualité et une capacité à répondre rapidement aux messages. Même avec peu de réservations au départ, chaque séjour direct améliore votre marge annuelle.",
          "Si des voyageurs vous demandent déjà « avez-vous un site ? » ou « pouvez-vous m’envoyer le lien ? », vous avez une demande latente prête à être captée."
        ],
        list: [
          "Hôtes avec une annonce déjà bien notée sur Airbnb ou Booking",
          "Propriétaires qui reçoivent des demandes récurrentes",
          "Locations avec une identité forte (vue, déco, emplacement)",
          "Hôtes qui veulent maîtriser leurs conditions d’annulation et leur relation client"
        ],
      },
      {
        title: "Les 4 piliers d’un lancement réussi",
        paragraphs: [
          "Avant de pousser le trafic vers votre site, assurez-vous que ces quatre fondations sont en place. Elles font la différence entre un lien « sympa » et un canal qui convertit réellement.",
          "Ne lancez pas de campagne de promotion tant que le paiement Stripe et la synchronisation calendrier ne sont pas opérationnels — un voyageur bloqué sur une date ou un paiement est un client perdu."
        ],
        list: [
          "Un site clair avec photos, équipements et disponibilités à jour",
          "Un calendrier synchronisé (iCal) pour éviter les doubles réservations",
          "Un paiement en ligne sécurisé via Stripe Connect",
          "Un lien « Réserver en direct » dans votre bio, vos messages et vos réseaux"
        ],
      },
      {
        title: "Combiner OTA et direct sans conflit",
        paragraphs: [
          "Gardez vos annonces actives sur Airbnb, Booking ou Abritel pour rester visible dans les recherches. Utilisez ces canaux comme vitrine et entonnoir, pas comme seul point de vente.",
          "Dans vos échanges avec les voyageurs intéressés, proposez naturellement votre site officiel : mêmes photos, mêmes disponibilités, paiement sécurisé. Vous ne « contournez » pas la plateforme au détriment du voyageur — vous lui offrez un canal direct transparent."
        ],
      },
      {
        title: "Plan de lancement sur 30 jours",
        paragraphs: [
          "Semaine 1 : publiez le site Hostiv, connectez Stripe et importez vos calendriers OTA. Vérifiez qu’une réservation test ou un import iCal bloque bien les dates sur votre site.",
          "Semaine 2 : ajoutez le lien direct dans votre annonce, votre profil hôte et vos réponses types aux voyageurs.",
          "Semaines 3 et 4 : suivez les réservations, affinez photos et textes, testez un petit geste commercial sur le direct (frais de ménage offerts, arrivée flexible…).",
          "Objectif réaliste : 1 à 3 réservations directes dans les 60 premiers jours est un bon début. Le volume augmente avec la constance de promotion."
        ],
      },
      {
        title: "Erreurs fréquentes à éviter",
        paragraphs: [
          "Ne coupez pas vos annonces OTA du jour au lendemain : le direct se construit progressivement. Ne laissez pas le calendrier direct désynchronisé — une double réservation peut coûter cher en confiance et en compensation.",
          "Ne sous-estimez pas la confiance : un site soigné, des avis (même repris de vos OTA dans votre communication) et des conditions claires rassurent les voyageurs.",
          "Ne fixez pas un tarif direct incohérent avec vos OTA sans raison : privilégiez la transparence et, si besoin, un avantage modeste plutôt qu’un écart de prix suspect."
        ],
      }
    ]
  },
  "sync-calendrier-ical": {
    id: "sync-calendrier-ical",
    title: "Synchroniser son calendrier iCal entre Airbnb, Booking et Hostiv",
    description:
      "Comment importer et exporter vos calendriers pour garder une seule source de vérité sur vos disponibilités.",
    seoTitle: "Sync calendrier iCal | Guide Hostiv pour hôtes",
    seoDescription:
      "Synchronisez Airbnb, Booking et votre site Hostiv via iCal : import, export et bonnes pratiques anti double réservation.",
    publishedAt: "2026-05-15",
    readingMinutes: 10,
    sections: [
      {
        title: "Comment fonctionne iCal",
        paragraphs: [
          "iCal (.ics) est un format standard d’échange de disponibilités. Airbnb, Booking, Abritel et Hostiv peuvent exporter un flux « calendrier occupé » et en importer un autre.",
          "L’objectif : quand une nuit est réservée sur un canal, elle apparaît bloquée partout ailleurs après la prochaine synchronisation. Ce n’est pas instantané — prévoyez un délai de quelques heures selon les plateformes.",
          "iCal transporte des dates bloquées, pas le détail du voyageur. C’est suffisant pour éviter les chevauchements, à condition de vérifier régulièrement que les flux sont actifs."
        ],
      },
      {
        title: "Où trouver vos URL iCal sur les OTA",
        paragraphs: [
          "Chaque plateforme expose un lien d’export dans les paramètres du calendrier de l’annonce. Copiez l’URL complète (elle se termine souvent par .ics). Conservez ces liens dans un document privé — ils donnent accès à vos disponibilités.",
          "Si vous multipliez les annonces (plusieurs plateformes), créez un import Hostiv par flux pour garder une vue consolidée."
        ],
        list: [
          "Airbnb : Calendrier → Disponibilités → Synchroniser les calendriers → Exporter",
          "Booking : Extranet → Calendrier → Synchronisation iCal",
          "Abritel / Vrbo : section Calendrier → Importer / Exporter"
        ],
      },
      {
        title: "Configurer Hostiv pas à pas",
        paragraphs: [
          "Dans votre admin Hostiv, ouvrez la section Calendriers et ajoutez les URL iCal de vos annonces OTA en import. Hostiv bloque automatiquement les dates reçues.",
          "Copiez ensuite l’URL iCal de votre site Hostiv (export) et collez-la dans les paramètres calendrier de chaque plateforme. Les réservations directes remonteront sur vos OTA après la prochaine sync.",
          "Pour valider la configuration : bloquez une date sur une OTA connectée et contrôlez qu’elle apparaît indisponible sur Hostiv sous 24 h — et inversement après une réservation directe."
        ],
      },
      {
        title: "Scénarios courants",
        paragraphs: [
          "Réservation directe : la date se bloque sur Hostiv, puis remonte sur Airbnb/Booking via l’export iCal. Réservation OTA : l’import Hostiv bloque la date sur votre site.",
          "Période fermée (travaux, usage perso) : bloquez-la dans l’admin Réservations (clic sur la date) ou sur une OTA importée en iCal.",
          "Modification de dates : si un voyageur décale son séjour, mettez à jour tous les canaux le même jour pour éviter un trou de disponibilité fantôme."
        ],
      },
      {
        title: "Délais et limites à connaître",
        paragraphs: [
          "La synchronisation iCal n’est pas temps réel. Selon la plateforme, comptez de 15 minutes à plusieurs heures. En haute saison, ne vous fiez pas uniquement à la sync automatique — un contrôle visuel quotidien reste indispensable.",
          "iCal ne gère pas les tarifs dynamiques ni les restrictions de séjour minimum entre plateformes : vous restez responsable de la cohérence de vos règles tarifaires sur chaque canal."
        ],
      },
      {
        title: "Bonnes pratiques",
        paragraphs: [
          "En haute saison, vérifiez la sync au moins une fois par jour. Après une réservation ou un blocage sur une OTA, contrôlez que la date est bien reflétée sur Hostiv.",
          "En cas de doute, fermez la période sur l’OTA qui alimente vos imports iCal plutôt que de risquer un chevauchement.",
          "Tenez un journal simple (date, canal, action) le temps d’habituer vos flux — cela évite les « trous » de mémoire en période chargée."
        ],
      }
    ]
  },
  "promouvoir-site-direct": {
    id: "promouvoir-site-direct",
    title: "Comment promouvoir son site de réservation directe",
    description:
      "Canaux, messages et habitudes pour envoyer du trafic qualifié vers votre site Hostiv sans publicité coûteuse.",
    seoTitle: "Promouvoir son site direct | Guide Hostiv",
    seoDescription:
      "Attirez vos premières réservations directes : lien OTA, e-mail, réseaux sociaux et arguments pour convaincre les voyageurs de réserver sans commission.",
    publishedAt: "2026-06-01",
    readingMinutes: 9,
    sections: [
      {
        title: "Pourquoi les voyageurs réservent en direct",
        paragraphs: [
          "Certains voyageurs préfèrent réserver chez l’hôte : relation plus directe, parfois un tarif plus clair, moins d’intermédiaires. Votre rôle est de rendre le passage évident et rassurant.",
          "Le direct attire souvent les voyageurs récurrents, les séjours longs ou les groupes qui posent des questions avant de réserver — exactement le profil qui valorise un échange direct."
        ],
        list: [
          "Paiement sécurisé par carte (Stripe)",
          "Mêmes informations que sur l’OTA : photos, équipements, conditions",
          "Réponse rapide et conditions d’annulation lisibles",
          "Site mobile adapté pour réserver depuis un smartphone"
        ],
      },
      {
        title: "Où placer votre lien",
        paragraphs: [
          "Multipliez les points de contact sans être intrusif. L’objectif est d’être présent au moment où le voyageur est déjà intéressé par votre logement.",
          "Les hôtes qui performent le mieux placent le lien à chaque touchpoint post-contact : ce n’est pas de la publicité froide, c’est une suite logique à une conversation déjà engagée."
        ],
        list: [
          "Bio ou description de votre profil hôte sur les OTA",
          "Réponses aux messages : « Vous pouvez aussi réserver sur mon site officiel »",
          "Signature e-mail, carte de visite, QR code dans le logement",
          "Instagram, Facebook ou newsletter si vous communiquez déjà"
        ],
      },
      {
        title: "Messages qui convertissent",
        paragraphs: [
          "Évitez le ton « contournement de plateforme ». Préférez un message transparent : vous proposez un canal officiel, avec les mêmes garanties de réservation et un paiement sécurisé.",
          "Exemple : « Notre site officiel reprend les mêmes photos et disponibilités — vous pouvez réserver directement ici : [lien]. Paiement sécurisé par carte. »",
          "Si le voyageur hésite, répondez aux objections : annulation, paiement, localisation, avis. Le direct gagne quand il est aussi clair qu’une OTA."
        ],
      },
      {
        title: "Inciter sans casser vos prix OTA",
        paragraphs: [
          "Inutile d’aligner systématiquement un tarif inférieur : la marge gagnée sur l’absence de commission OTA peut financer un petit geste commercial sur le direct.",
          "Exemples : frais de ménage offerts, arrivée flexible, bouteille de bienvenue ou late check-out selon votre politique.",
          "Communiquez l’avantage comme un bonus du canal direct, pas comme une obligation — cela préserve votre positionnement tarifaire sur les plateformes."
        ],
      },
      {
        title: "Réseaux sociaux et contenu local",
        paragraphs: [
          "Publiez des photos de votre logement, du quartier et des activités à proximité. Chaque post peut inclure un lien « Réserver » vers votre site Hostiv.",
          "Les contenus authentiques (avant/après rénovation, saisonnalité, événements locaux) attirent un trafic qualifié sans budget publicitaire.",
          "Encouragez les voyageurs satisfaits à mentionner votre nom ou votre site — le bouche-à-oreille reste le canal le plus rentable."
        ],
      },
      {
        title: "Mesurer et ajuster",
        paragraphs: [
          "Notez d’où viennent vos réservations directes (message OTA, réseau social, bouche-à-oreille). Doublez sur le canal qui fonctionne.",
          "Améliorez en continu : photos héro, clarté des équipements, temps de réponse et conditions d’annulation lisibles.",
          "Chaque mois, comparez le nombre de clics sur votre lien et les réservations effectives : si l’écart est grand, travaillez la page d’accueil et le parcours de réservation."
        ],
      }
    ]
  }
}
