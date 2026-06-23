import type { HostivResourceArticle, HostivResourceArticleId } from "./hostiv-resources.types"

export const hostivResourceArticlesExtra: Record<
  Exclude<
    HostivResourceArticleId,
    "passer-au-direct" | "sync-calendrier-ical" | "promouvoir-site-direct"
  >,
  HostivResourceArticle
> = {
  "configurer-stripe-connect": {
    id: "configurer-stripe-connect",
    title: "Configurer Stripe Connect pour encaisser vos réservations directes",
    description:
      "Étapes pour connecter votre compte Stripe, activer les paiements et recevoir les virements sur votre compte hôte.",
    seoTitle: "Configurer Stripe Connect | Guide Hostiv",
    seoDescription:
      "Connectez Stripe Connect à Hostiv : onboarding, vérification d’identité, paiements voyageurs et virements sur votre compte.",
    publishedAt: "2026-06-05",
    readingMinutes: 7,
    sections: [
      {
        title: "Pourquoi Stripe Connect ?",
        paragraphs: [
          "Hostiv ne touche pas au montant du séjour : les paiements des voyageurs sont traités par Stripe et versés sur votre compte hôte Connect. Vous restez payeur officiel de la transaction.",
          "Stripe gère la conformité PCI (sécurité des cartes) et les virements bancaires — vous n’avez pas à intégrer un module de paiement vous-même."
        ],
      },
      {
        title: "Créer ou connecter un compte",
        paragraphs: [
          "Depuis votre admin Hostiv, lancez la connexion Stripe Connect. Vous pouvez créer un nouveau compte ou rattacher un compte Stripe existant si vous en avez déjà un.",
          "Préparez une pièce d’identité, votre IBAN et — selon votre statut — un numéro SIRET ou des informations de particulier. L’onboarding prend en général 10 à 20 minutes."
        ],
        list: [
          "Compte particulier : location en nom propre",
          "Compte professionnel : si vous êtes déjà immatriculé",
          "Même compte utilisable pour plusieurs activités Stripe si besoin"
        ]
      },
      {
        title: "Activer les paiements sur votre site",
        paragraphs: [
          "Une fois Stripe validé, les voyageurs peuvent payer par carte lors de la réservation. Hostiv affiche le récapitulatif du séjour avant paiement.",
          "Les frais Stripe (commission carte) s’appliquent sur chaque transaction, comme sur tout terminal de paiement en ligne. Hostiv ne prélève aucune commission sur le montant du séjour."
        ],
      },
      {
        title: "Suivre vos virements",
        paragraphs: [
          "Les encaissements apparaissent dans votre tableau de bord Stripe. Les virements vers votre banque suivent le calendrier Stripe (souvent quelques jours ouvrés selon le pays).",
          "En cas de litige ou de demande de remboursement, traitez-le depuis Stripe ou votre admin Hostiv selon votre politique d’annulation."
        ],
      }
    ]
  },
  "choisir-template-site": {
    id: "choisir-template-site",
    title: "Choisir le bon template pour votre site de location",
    description:
      "Riviera, Classique ou Terre & lin : comment picker un design adapté à votre logement et à votre clientèle.",
    seoTitle: "Choisir un template Hostiv | Guide design",
    seoDescription:
      "Comparez les templates Hostiv pour votre site de réservation directe : style, conversion et personnalisation.",
    publishedAt: "2026-06-04",
    readingMinutes: 6,
    sections: [
      {
        title: "Le template pose le ton",
        paragraphs: [
          "Votre template définit la première impression : couleurs, typographie, mise en page du hero et des galeries. Hostiv propose plusieurs styles prêts à l’emploi — même moteur de réservation, identité visuelle différente.",
          "Choisissez en fonction de votre logement et de votre cible : épuré et rassurant pour une clientèle business, chaleureux pour une maison de vacances, premium pour un bien haut de gamme."
        ],
      },
      {
        title: "Comparer les trois styles",
        paragraphs: [
          "Prenez 10 minutes pour prévisualiser chaque template avec vos propres photos. Le bon choix est celui qui met votre atout principal en valeur dès la première seconde."
        ],
        list: [
          "Riviera : dégradés, ambiance haut de gamme, idéal villa ou vue mer",
          "Classique : fond clair, touches rouges, lisible et orienté conversion",
          "Terre & lin : beige et terracotta, parfait pour maisons de caractère"
        ],
      },
      {
        title: "Personnaliser sans tout refaire",
        paragraphs: [
          "Après le choix du template, ajustez couleurs, textes, logo et photos. L’éditeur Hostiv prévisualise en direct : vous voyez le rendu voyageur avant publication.",
          "Le forfait Pro débloque le multi-logements, le guide PDF, les factures et les co-hôtes — idéal si vous gérez plusieurs biens ou une équipe."
        ],
      },
      {
        title: "Tester sur mobile",
        paragraphs: [
          "Une grande partie des réservations se fait sur smartphone. Vérifiez le rendu mobile dans l’aperçu avant de partager votre lien.",
          "Si une photo hero manque d’impact en petit format, recadrez ou choisissez une image plus lisible — c’est souvent le levier n°1 de conversion."
        ],
      }
    ]
  },
  "optimiser-fiche-logement": {
    id: "optimiser-fiche-logement",
    title: "Optimiser la fiche de votre logement sur le site direct",
    description:
      "Photos, textes, équipements et règles : les bonnes pratiques pour inspirer confiance et remplir le calendrier.",
    seoTitle: "Optimiser sa fiche logement | Guide Hostiv",
    seoDescription:
      "Améliorez photos, description, équipements et règles sur votre site Hostiv pour convertir plus de visiteurs en réservations.",
    publishedAt: "2026-06-03",
    readingMinutes: 8,
    sections: [
      {
        title: "La photo hero fait 80 % du travail",
        paragraphs: [
          "Choisissez une image lumineuse, en paysage, qui montre l’atout principal : vue, salon, piscine ou façade. Évitez les photos floues ou trop sombres.",
          "Complétez avec une galerie ordonnée : pièces de vie, chambres, salle de bain, extérieur. Reprenez vos meilleures photos OTA si elles sont de qualité."
        ],
      },
      {
        title: "Rédiger une description qui convertit",
        paragraphs: [
          "Structurez en trois temps : accroche (pourquoi votre logement), détails (espaces, capacité, équipements clés), quartier (commerces, plage, transports).",
          "Soyez concret : « canapé convertible 140 cm » vaut mieux que « canapé confortable ». Reprenez le ton de vos annonces OTA en l’adaptant au direct."
        ],
        list: [
          "Capacité exacte et configuration des chambres",
          "Équipements différenciants (parking, clim, wifi fibre…)",
          "Distances à pied ou en voiture des points d’intérêt"
        ]
      },
      {
        title: "Équipements et règles de la maison",
        paragraphs: [
          "Cochez tous les équipements réellement disponibles — les voyageurs filtrent mentalement selon leurs besoins (lit bébé, lave-linge, barbecue…).",
          "Les règles claires réduisent les frictions : horaires d’arrivée/départ, fêtes, animaux, fumeurs. Mieux vaut perdre une réservation incompatible que gérer un conflit sur place."
        ],
      },
      {
        title: "SEO et mots-clés",
        paragraphs: [
          "Dans l’admin Hostiv, renseignez titre et meta description pour Google : type de bien + ville + « réservation directe » fonctionne bien.",
          "Exemple : « Villa avec piscine à Nice — réservation directe ». Évitez le keyword stuffing : une phrase naturelle suffit."
        ],
      }
    ]
  },
  "convertir-visiteurs": {
    id: "convertir-visiteurs",
    title: "Convertir les visiteurs de votre site en réservations",
    description:
      "Parcours, preuves sociales, tarifs clairs et appels à l’action : les leviers pour passer du clic au séjour confirmé.",
    seoTitle: "Convertir les visiteurs | Guide Hostiv",
    seoDescription:
      "Augmentez le taux de conversion de votre site Hostiv : clarté du parcours, avis, tarifs et boutons de réservation.",
    publishedAt: "2026-06-02",
    readingMinutes: 7,
    sections: [
      {
        title: "Réduire la friction",
        paragraphs: [
          "Chaque étape supplémentaire fait chuter la conversion. Votre site Hostiv regroupe déjà vitrine, calendrier et paiement — assurez-vous que le bouton « Réserver » est visible dès le hero.",
          "Vérifiez que les dates indisponibles sont bien grisées et que le prix total s’affiche avant le paiement : pas de surprise au checkout."
        ],
      },
      {
        title: "Preuves sociales",
        paragraphs: [
          "Affichez vos avis voyageurs (y compris ceux collectés après séjour). Même quelques témoignages authentiques rassurent autant qu’un long historique OTA.",
          "Si vous débutez, soyez transparent : « Premiers voyageurs directs — bienvenue » avec un petit geste commercial peut déclencher la première réservation."
        ],
        list: [
          "Avis avec prénom et contexte (« famille de 4, août 2025 »)",
          "Note moyenne si vous en avez plusieurs",
          "Réponse de l’hôte aux avis — montre votre réactivité"
        ]
      },
      {
        title: "Tarifs lisibles",
        paragraphs: [
          "Indiquez le prix par nuit, les frais de ménage et la taxe de séjour si applicable. Le voyageur direct compare souvent avec l’OTA : la transparence lève le doute.",
          "Vous pouvez proposer un tarif direct identique à l’OTA et mettre en avant l’absence de frais de service plateforme plutôt qu’une remise agressive."
        ],
      },
      {
        title: "Relancer sans harceler",
        paragraphs: [
          "Si un voyageur vous contacte via OTA puis hésite, proposez une fois le lien direct avec les disponibilités à jour. Pas de spam : un message utile au bon moment suffit.",
          "Analysez les abandons : dates complètes, prix trop élevé ou manque d’infos ? Ajustez en conséquence."
        ],
      }
    ]
  },
  "comparer-starter-pro": {
    id: "comparer-starter-pro",
    title: "Starter ou Pro : quel forfait Hostiv choisir ?",
    description:
      "Comparez les fonctionnalités, le prix et les cas d’usage pour choisir entre 49 € et 99 € par an.",
    seoTitle: "Starter vs Pro | Comparatif forfaits Hostiv",
    seoDescription:
      "Forfait Starter ou Pro Hostiv ? Comparatif prix, fonctionnalités, guide PDF, factures, co-hôtes et multi-logements.",
    publishedAt: "2026-05-28",
    readingMinutes: 6,
    sections: [
      {
        title: "Ce qui est identique",
        paragraphs: [
          "Starter et Pro incluent l’essentiel : un site de réservation directe, paiements Stripe, sync iCal, galerie, admin des réservations et 0 % de commission Hostiv sur vos nuitées.",
          "La différence Pro concerne le multi-logements et les outils avancés (guide PDF, factures, co-hôtes). Sur Starter, l’option Starter + (+30 €/an) débloque ces outils pour un seul logement."
        ],
      },
      {
        title: "Forfait Starter — 49 €/an",
        paragraphs: [
          "Idéal pour lancer rapidement un premier site direct sans budget élevé. Vous avez tout pour publier, synchroniser et encaisser."
        ],
        list: [
          "1 logement",
          "Réservation et paiement Stripe",
          "Import / export iCal",
          "Galerie et gestion des réservations"
        ]
      },
      {
        title: "Forfait Pro — 99 €/an",
        paragraphs: [
          "Recommandé si vous gérez plusieurs logements ou voulez guide PDF, factures et co-hôtes inclus sans option. Chaque logement supplémentaire nécessite un abonnement Pro."
        ],
        list: [
          "Tout Starter inclus",
          "Plusieurs logements",
          "Guide d’accueil PDF personnalisable",
          "Factures PDF",
          "Co-hôtes illimités"
        ],
      },
      {
        title: "Comment trancher ?",
        paragraphs: [
          "Choisissez Starter si vous testez le direct pour la première fois sur un seul logement. Activez Starter + si vous voulez guide PDF, factures et co-hôtes sans passer Pro. Choisissez Pro pour le multi-logements ou si vous voulez tout inclus d’emblée.",
          "Vous pouvez commencer en Starter et évoluer — l’important est de publier tôt et de connecter vos calendriers."
        ],
      }
    ]
  },
  "premiere-reservation-directe": {
    id: "premiere-reservation-directe",
    title: "Recevoir sa première réservation directe sur Hostiv",
    description:
      "De la publication au e-mail de confirmation : le déroulé complet pour valider que tout fonctionne.",
    seoTitle: "Première réservation directe | Guide Hostiv",
    seoDescription:
      "Publiez, testez et recevez votre première réservation sur Hostiv : Stripe, calendrier, confirmation voyageur.",
    publishedAt: "2026-05-25",
    readingMinutes: 7,
    sections: [
      {
        title: "Checklist avant d’ouvrir",
        paragraphs: [
          "Avant de partager votre lien, vérifiez : site publié, Stripe Connect actif, au moins un calendrier iCal importé, photos et tarifs à jour.",
          "Faites un parcours complet vous-même : choix des dates, formulaire voyageur, paiement test si Stripe le permet en mode test."
        ],
        list: [
          "Site en ligne et slug mémorisable",
          "Stripe Connect validé (charges activées)",
          "Import iCal depuis vos OTA",
          "Export iCal Hostiv collé sur chaque plateforme"
        ],
      },
      {
        title: "Partager le lien au bon moment",
        paragraphs: [
          "Votre première réservation directe viendra souvent d’un contact existant : ancien voyageur, famille, recommandation ou réponse à un message OTA.",
          "Envoyez le lien avec les dates libres et un message rassurant sur le paiement sécurisé."
        ],
      },
      {
        title: "Le jour de la réservation",
        paragraphs: [
          "Quand un voyageur réserve, vous recevez une notification. La date se bloque sur Hostiv et doit remonter sur vos OTA via l’export iCal sous quelques heures.",
          "Le voyageur reçoit une confirmation par e-mail. Préparez votre message de bienvenue avec instructions d’arrivée."
        ],
      },
      {
        title: "Après le séjour",
        paragraphs: [
          "Demandez un avis pour enrichir votre site. Notez d’où venait la réservation pour reproduire ce canal.",
          "Si tout s’est bien passé, proposez le direct pour les prochains séjours — la fidélisation est le canal le plus rentable."
        ],
      }
    ]
  },
  "factures-pdf": {
    id: "factures-pdf",
    title: "Éditer des factures PDF pour vos réservations directes",
    description:
      "Fonctionnalité Pro (et module Starter+) : générer des factures claires pour vos voyageurs et votre comptabilité.",
    seoTitle: "Factures PDF réservations | Guide Hostiv Pro",
    seoDescription:
      "Générez des factures PDF pour chaque réservation directe Hostiv — forfait Pro ou module Starter+.",
    publishedAt: "2026-05-22",
    readingMinutes: 5,
    sections: [
      {
        title: "Pourquoi une facture PDF ?",
        paragraphs: [
          "Les voyageurs professionnels ou en déplacement longue durée demandent parfois une facture au nom de leur entreprise. Les particuliers apprécient aussi un récapitulatif clair.",
          "Avec Hostiv Pro, vous générez une facture PDF liée à la réservation — sans ressaisir les montants dans un tableur."
        ],
      },
      {
        title: "Ce que contient la facture",
        paragraphs: [
          "La facture reprend les informations de la réservation : dates, montant du séjour, frais annexes si vous les avez configurés, coordonnées hôte et voyageur.",
          "Vérifiez vos informations légales dans l’admin avant la première émission (nom, adresse, identifiant si applicable)."
        ],
        list: [
          "Dates de séjour et nombre de nuits",
          "Montant total payé via Stripe",
          "Vos coordonnées d’hôte",
          "Référence de réservation"
        ]
      },
      {
        title: "Quand l’envoyer",
        paragraphs: [
          "Envoyez la facture après confirmation du paiement ou après le séjour, selon votre processus. Pour les entreprises, une facture avant paiement peut être demandée — adaptez votre échange en amont.",
          "Conservez une copie pour votre comptabilité ; le PDF Hostiv complète vos exports Stripe."
        ],
      },
      {
        title: "Starter+ ou Pro ?",
        paragraphs: [
          "Les factures PDF sont incluses dans le forfait Pro. Le module Starter+ les ajoute au forfait Starter si vous n’avez pas encore besoin du pack complet Pro.",
          "Si vous facturez souvent des séjours pro, le Pro est en général le meilleur rapport qualité-prix."
        ],
      }
    ]
  },
  "guide-accueil-voyageurs": {
    id: "guide-accueil-voyageurs",
    title: "Créer un guide d’accueil PDF pour vos voyageurs",
    description:
      "Wi-Fi, codes d’accès, recommandations locales : centralisez l’essentiel dans un PDF imprimable (Pro).",
    seoTitle: "Guide d’accueil PDF | Guide Hostiv Pro",
    seoDescription:
      "Créez un guide d’accueil PDF personnalisé pour vos voyageurs Hostiv — codes, wifi, règles et bonnes adresses.",
    publishedAt: "2026-05-20",
    readingMinutes: 6,
    sections: [
      {
        title: "Le guide qui remplace 10 messages",
        paragraphs: [
          "Après la réservation, les voyageurs posent souvent les mêmes questions : code de la boîte à clés, wifi, poubelles, boulangerie la plus proche… Un guide d’accueil PDF regroupe tout.",
          "Hostiv Pro permet de générer un PDF personnalisé à partir de votre contenu — prêt à imprimer ou à envoyer par e-mail."
        ],
      },
      {
        title: "Que inclure",
        paragraphs: [
          "Structurez par thèmes pour une lecture rapide sur smartphone ou papier."
        ],
        list: [
          "Accès : adresse précise, parking, digicode, boîte à clés",
          "Wifi : nom du réseau et mot de passe",
          "Règles : fumeurs, animaux, heures calmes",
          "Équipements : chaudière, lave-linge, poubelles/tri",
          "Local : commerces, restaurants, urgences"
        ]
      },
      {
        title: "Quand l’envoyer",
        paragraphs: [
          "Envoyez le guide 2 à 3 jours avant l’arrivée avec un message de bienvenue personnalisé. Évitez de dévoiler les codes trop tôt si vous préférez — vous pouvez scinder « infos pratiques » et « accès ».",
          "Laissez aussi une version imprimée sur place pour les voyageurs qui n’ouvrent pas leurs e-mails en vacances."
        ],
      },
      {
        title: "Mettre à jour régulièrement",
        paragraphs: [
          "Change de code wifi, nouveau restaurant favori, travaux dans l’immeuble : mettez le guide à jour dès que quelque chose change.",
          "Un guide obsolète crée plus de frustration qu’aucun guide — vérifiez-le à chaque saison."
        ],
      }
    ]
  },
  "referencement-site-direct": {
    id: "referencement-site-direct",
    title: "Référencer son site de location sur Google",
    description:
      "Titres, descriptions, mots-clés et maillage interne : les bases du SEO pour un site de réservation directe.",
    seoTitle: "Référencement site location saisonnière | Guide Hostiv",
    seoDescription:
      "Optimisez le SEO de votre site Hostiv : balises title, mots-clés quartier, structure de page et liens internes pour attirer des réservations directes.",
    publishedAt: "2026-06-11",
    readingMinutes: 8,
    sections: [
      {
        title: "Pourquoi le SEO compte en direct",
        paragraphs: [
          "Sur une plateforme OTA, c’est Airbnb ou Booking qui attirent le trafic. En direct, c’est votre site qui doit être trouvé sur Google quand un voyageur tape « location vacances + votre ville ».",
          "Un bon référencement ne remplace pas la promotion (lien en bio Airbnb, Google Business, réseaux sociaux), mais il complète ces canaux sur le long terme."
        ]
      },
      {
        title: "Les fondamentaux dans Hostiv",
        paragraphs: [
          "Dans Personnalisation → SEO, renseignez un titre clair (ville + type de bien), une meta description qui donne envie, et des mots-clés ciblés (quartier, équipements, capacité).",
          "Utilisez le bandeau « Moteur de recherche » : le titre du hero alimente automatiquement votre balise title si vous ne surchargez pas le champ SEO."
        ],
        links: [
          { articleId: "optimiser-fiche-logement" },
          { articleId: "promouvoir-site-direct" }
        ]
      },
      {
        title: "Structurer la page pour Google",
        paragraphs: [
          "Votre site Hostiv est une page riche : hébergement, espaces, quartier, tarifs, équipements, avis. Chaque section est une opportunité de placer des expressions naturelles (« proche Versailles », « wifi fibre », « 6 voyageurs »).",
          "Le menu de navigation interne aide Google à comprendre la structure — et les voyageurs à trouver tarifs ou avis rapidement."
        ]
      },
      {
        title: "Maillage et signaux locaux",
        paragraphs: [
          "Liez votre site depuis votre fiche Google Business, vos réseaux sociaux et votre signature e-mail. Plus des sites de qualité pointent vers vous, plus Google vous fait confiance.",
          "Encouragez les avis voyageurs : la section témoignages enrichit votre page et rassure au moment de réserver."
        ],
        links: [{ articleId: "convertir-visiteurs" }]
      }
    ]
  }
}
