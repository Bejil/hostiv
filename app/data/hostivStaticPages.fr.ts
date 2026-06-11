import type { HostivStaticPage, HostivStaticPageId } from "./hostiv-static-page.types"
import { hostivLegalEditor, hostivLegalHosting } from "./hostiv-legal-editor"

const { fullName, tradeName, domain, email, postalAddress, phone } = hostivLegalEditor
const { vercel, supabase } = hostivLegalHosting

export const hostivStaticPagesFr: Record<HostivStaticPageId, HostivStaticPage> = {
  "a-propos": {
    id: "a-propos",
    path: "/a-propos",
    title: "Qui sommes-nous ?",
    description:
      "Hostiv aide les propriétaires de locations saisonnières à recevoir des réservations directes avec un site dédié et des paiements Stripe.",
    eyebrow: "À propos",
    lead: "Hostiv est né d’un constat simple : les hôtes perdent une part importante de leurs revenus sur les commissions des plateformes.",
    sections: [
      {
        title: "Notre mission",
        paragraphs: [
          "Nous permettons à chaque hôte de publier un site de réservation directe pour un seul logement — avec synchronisation des calendriers, paiements sécurisés et gestion des réservations.",
          "Hostiv ne remplace pas Airbnb ou Booking : il complète votre stratégie en vous donnant un canal direct que vous contrôlez."
        ]
      },
      {
        title: "Ce que nous faisons — et ce que nous ne faisons pas",
        paragraphs: [
          "Hostiv est un outil de publication et de gestion pour hôtes indépendants. Nous ne sommes pas une marketplace et nous ne prélevons pas de commission sur vos nuitées."
        ],
        list: [
          "Un site vitrine + réservation par logement",
          "Paiements Stripe Connect sur votre compte",
          "Synchronisation iCal avec vos autres canaux",
          "Pas d’intermédiation sur le montant du séjour"
        ]
      }
    ]
  },
  contact: {
    id: "contact",
    path: "/contact",
    title: "Nous contacter",
    description: "Contactez l’équipe Hostiv pour toute question sur votre compte, votre site ou vos réservations directes.",
    eyebrow: "Contact",
    lead: "Une question sur Hostiv, votre abonnement ou la mise en ligne de votre site ? Écrivez-nous.",
    sections: [
      {
        title: "Formulaire",
        paragraphs: [
          "Utilisez le formulaire pour nous envoyer votre message. Nous vous répondons par e-mail, en général sous 2 jours ouvrés."
        ],
        info: {
          title: "Avant de nous écrire",
          paragraphs: [
            "Pour les questions liées à une réservation déjà passée sur votre site, précisez l’adresse de votre site et la date du séjour concerné.",
            "Pour un problème de paiement Stripe, vérifiez d’abord l’état de votre compte Connect dans votre espace admin."
          ]
        }
      }
    ]
  },
  "mentions-legales": {
    id: "mentions-legales",
    path: "/mentions-legales",
    title: "Mentions légales",
    description: "Mentions légales du site Hostiv — éditeur, hébergement et propriété intellectuelle.",
    eyebrow: "Informations légales",
    lead: "Conformément aux dispositions des articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN).",
    updatedAt: "mai 2026",
    sections: [
      {
        title: "Éditeur du site",
        paragraphs: [
          `Le site ${domain} est édité par ${fullName}, particulier, sous le nom commercial « ${tradeName} ».`,
          `Adresse postale : ${postalAddress}.`,
          `Contact : ${email} — Tél. ${phone}.`,
          `${tradeName} est un service en cours de développement, exploité à titre personnel. Aucune personne morale n’est constituée à ce jour ; il n’y a pas de numéro SIRET associé au nom commercial ${tradeName}.`
        ]
      },
      {
        title: "Directeur de la publication",
        paragraphs: [`${fullName}.`]
      },
      {
        title: "Hébergement",
        paragraphs: [
          `Le site et l’application sont hébergés par ${vercel.name}, ${vercel.address} — ${vercel.website}.`,
          `Les données applicatives (comptes, contenus des sites hôtes, réservations) sont stockées via ${supabase.name}, ${supabase.region} — ${supabase.website}.`
        ]
      },
      {
        title: "Propriété intellectuelle",
        paragraphs: [
          `L’ensemble des éléments du site ${tradeName} (textes, graphismes, logo, structure) est protégé par le droit de la propriété intellectuelle, sauf mention contraire.`,
          "Les contenus publiés par les hôtes sur leurs sites de réservation (textes, photographies) restent de leur responsabilité ; ils garantissent disposer des droits nécessaires.",
          "Toute reproduction non autorisée des éléments du site Hostiv est interdite."
        ]
      }
    ]
  },
  "politique-de-confidentialite": {
    id: "politique-de-confidentialite",
    path: "/politique-de-confidentialite",
    title: "Politique de confidentialité",
    description:
      "Comment Hostiv collecte et traite vos données personnelles — hôtes, voyageurs et visiteurs du site marketing.",
    eyebrow: "Données personnelles",
    lead: "Cette politique décrit les traitements réalisés par l’éditeur du service Hostiv et le rôle des hôtes pour les données collectées sur leurs sites.",
    updatedAt: "mai 2026",
    sections: [
      {
        title: "Responsable du traitement",
        paragraphs: [
          `Pour le site marketing ${domain}, la création de compte hôte, la facturation du forfait annuel et le support : ${fullName}, ${email}.`,
          "Pour les sites de réservation publiés par nos clients (hôtes), chaque hôte est responsable de traitement des données qu’il collecte auprès de ses voyageurs (nom, coordonnées, séjour, etc.). Hostiv agit alors comme sous-traitant technique pour l’hébergement et le traitement de ces données dans le cadre du service."
        ]
      },
      {
        title: "Données collectées",
        paragraphs: ["Selon votre usage du service, nous pouvons traiter notamment :"],
        list: [
          "Identité et coordonnées (nom, e-mail) lors de la création de compte hôte",
          "Identifiants de connexion (mot de passe stocké de manière sécurisée par notre prestataire d’authentification)",
          "Données de connexion, journaux techniques et adresse IP",
          "Contenus que vous publiez sur votre site (textes, photos, tarifs)",
          "Données de réservation saisies par les voyageurs sur votre site",
          "Identifiants et statut de votre compte Stripe (paiement du forfait Hostiv et, le cas échéant, Stripe Connect pour les paiements de séjour)",
          "Messages envoyés via le formulaire de contact"
        ]
      },
      {
        title: "Finalités et bases légales",
        paragraphs: [
          "Fourniture du service Hostiv, gestion des comptes, facturation des forfaits annuels, support client, sécurité, prévention de la fraude et amélioration du produit.",
          "Les bases légales sont principalement l’exécution du contrat (CGU / forfait), l’intérêt légitime (sécurité, amélioration du service) et, le cas échéant, le respect d’obligations légales."
        ]
      },
      {
        title: "Cookies et traceurs",
        paragraphs: [
          `Nous n’utilisons pas de cookies publicitaires ni d’outils de mesure d’audience (analytics) sur ${domain}.`,
          "Seuls des cookies ou stockages locaux strictement nécessaires au fonctionnement peuvent être utilisés (par exemple session d’authentification, sécurité). Sur les sites de réservation des hôtes, un stockage local peut mémoriser des préférences de formulaire de contact pour le confort du visiteur.",
          "Vous pouvez configurer votre navigateur pour refuser les cookies ; certaines fonctionnalités (connexion à l’espace admin, réservation) peuvent alors ne plus fonctionner correctement."
        ]
      },
      {
        title: "Durée de conservation",
        paragraphs: [
          "Les données de compte hôte sont conservées pendant la durée d’accès au forfait payé, puis supprimées ou archivées dans un délai de douze (12) mois après la clôture du compte, sauf obligation légale contraire.",
          "Les journaux techniques sont conservés pour une durée limitée (généralement quelques mois).",
          "Les données de réservation sur le site d’un hôte sont conservées selon les paramètres de son espace admin et les obligations de l’hôte en tant que responsable de traitement."
        ]
      },
      {
        title: "Vos droits",
        paragraphs: [
          "Conformément au règlement (UE) 2016/679 (RGPD), vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité, dans les limites prévues par la loi.",
          `Pour exercer vos droits concernant Hostiv : ${email}. Pour les données collectées sur un site hôte, contactez directement l’hôte concerné.`,
          "Vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr)."
        ]
      },
      {
        title: "Sous-traitants et transferts",
        paragraphs: [
          "Nous recourons aux prestataires suivants, agissant pour notre compte dans le cadre de contrats encadrant la protection des données :"
        ],
        list: [
          `${vercel.name} — hébergement de l’application`,
          `${supabase.name} — base de données et authentification (${supabase.region})`,
          "Stripe, Inc. — paiement des forfaits annuels et facilitation des paiements Connect (données pouvant être traitées aux États-Unis, avec garanties appropriées)",
          "Resend — envoi d’e-mails transactionnels et de contact"
        ]
      }
    ]
  },
  "conditions-generales": {
    id: "conditions-generales",
    path: "/conditions-generales",
    title: "Conditions générales d’utilisation",
    description: "Conditions générales d’utilisation du service Hostiv pour les hôtes.",
    eyebrow: "CGU",
    lead: "Les présentes conditions régissent l’accès et l’utilisation du service Hostiv par les hôtes. En créant un compte, vous les acceptez.",
    updatedAt: "mai 2026",
    sections: [
      {
        title: "Objet",
        paragraphs: [
          `${tradeName} fournit un outil en ligne permettant de créer et gérer un site de réservation directe pour un logement, incluant la synchronisation de calendriers (iCal) et l’intégration de paiements via Stripe.`,
          `${tradeName} n’est pas une agence de voyage ni une marketplace : il n’est pas partie aux contrats de location conclus entre l’hôte et le voyageur.`
        ]
      },
      {
        title: "Éditeur et acceptation",
        paragraphs: [
          `Le service est édité par ${fullName}, particulier, sous le nom commercial ${tradeName}, joignable à ${email}.`,
          "L’utilisation du service est réservée aux personnes majeures capables de contracter. L’hôte garantit l’exactitude des informations fournies lors de l’inscription."
        ]
      },
      {
        title: "Compte et forfait annuel",
        paragraphs: [
          "Un compte correspond à un logement. L’hôte choisit un forfait (Starter ou Pro) affiché sur la page Tarifs du site.",
          "L’accès au service est facturé pour une période de douze (12) mois, au tarif annuel indiqué sur le site. Le règlement s’effectue en un seul paiement via Stripe (paiement sécurisé), sans prélèvement automatique ni reconduction tacite : à l’issue des douze mois, l’hôte peut, s’il le souhaite, souscrire à nouveau un forfait pour prolonger l’accès, aux tarifs alors en vigueur.",
          "Le paiement du forfait Hostiv est distinct des paiements des séjours : ceux-ci sont traités sur le compte Stripe Connect de l’hôte, sous sa responsabilité."
        ]
      },
      {
        title: "Droit de rétractation",
        paragraphs: [
          "Si l’hôte est un consommateur au sens du Code de la consommation, il peut bénéficier d’un délai de rétractation de quatorze (14) jours pour le forfait souscrit à distance, sauf renonciation expresse conforme à la loi lorsque l’exécution du service commence immédiatement après souscription.",
          `Toute demande de rétractation ou remboursement doit être adressée à ${email} dans les délais légaux, en précisant l’e-mail du compte concerné.`
        ]
      },
      {
        title: "Obligations de l’hôte",
        paragraphs: ["L’hôte est seul responsable :"],
        list: [
          "Du contenu publié sur son site (exactitude, conformité, droits d’auteur et droit à l’image)",
          "Du respect de la réglementation applicable (location saisonnière, urbanisme, fiscalité, déclarations)",
          "Des relations avec ses voyageurs et de l’exécution des séjours",
          "De la configuration, de la conformité et du bon fonctionnement de son compte Stripe Connect",
          "Du traitement des données personnelles de ses voyageurs, conformément au RGPD"
        ]
      },
      {
        title: "Disponibilité du service",
        paragraphs: [
          `${tradeName} est fourni « en l’état ». L’éditeur met en œuvre des moyens raisonnables pour assurer la disponibilité du service, sans garantie d’absence d’interruption ou d’erreur.`,
          "Des opérations de maintenance ou des incidents chez les prestataires techniques (hébergement, base de données, Stripe) peuvent entraîner une indisponibilité temporaire."
        ]
      },
      {
        title: "Données personnelles",
        paragraphs: [
          `Le traitement des données dans le cadre du service est décrit dans la Politique de confidentialité. Pour toute question : ${email}.`
        ]
      },
      {
        title: "Limitation de responsabilité",
        paragraphs: [
          `${tradeName} ne saurait être tenu responsable des dommages indirects, de la perte de chiffre d’affaires, des annulations de séjours ou des litiges entre hôtes et voyageurs.`,
          `La responsabilité de l’éditeur, toutes causes confondues, est limitée au montant total des sommes effectivement versées par l’hôte au titre du forfait ${tradeName} au cours des douze (12) derniers mois précédant le fait générateur.`
        ]
      },
      {
        title: "Modification des CGU",
        paragraphs: [
          "Les présentes CGU peuvent être mises à jour. En cas de modification substantielle, les hôtes en seront informés par e-mail ou via l’espace admin. La poursuite de l’utilisation du service après entrée en vigueur vaut acceptation, sauf résiliation dans les conditions prévues."
        ]
      },
      {
        title: "Droit applicable et litiges",
        paragraphs: [
          "Les présentes CGU sont soumises au droit français.",
          `En cas de litige, et à défaut de résolution amiable, compétence est attribuée aux tribunaux du ressort du domicile de l’éditeur (${fullName}), sous réserve des dispositions impératives applicables aux consommateurs (notamment le tribunal du domicile du consommateur).`
        ]
      }
    ]
  }
}
