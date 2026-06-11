import type { HostivLocale } from "../types/hostiv-locale"

export type SiteBookingModalLabels = {
  title: string
  paymentTitle: string
  detailsLead: string
  paymentLead: string
  backToForm: string
  close: string
  firstName: string
  lastName: string
  phone: string
  email: string
  message: string
  firstNamePlaceholder: string
  lastNamePlaceholder: string
  phonePlaceholder: string
  emailPlaceholder: string
  messagePlaceholder: string
  continueToPayment: string
  preparingPayment: string
  recapTitle: string
  total: string
  nightsLine: string
  guestSupplement: string
  weekDiscount: string
  monthDiscount: string
  choosePaymentMethod: string
  payButton: string
  paymentProcessing: string
  paymentNote: string
  stripeNotConfigured: string
  stripeLoadFailed: string
  paymentFailed: string
  paymentPending: string
  errors: {
    datesMissing: string
    datesInvalid: string
    guestsMissing: string
    lastName: string
    firstName: string
    phone: string
    email: string
    message: string
  }
  submitErrors: {
    stripeNotConfigured: string
    paymentsNotReady: string
    sessionExpired: string
    prepareFailed: string
    emailConfirmFailed: string
  }
  success: {
    title: string
    line1: string
    line2: string
    button: string
  }
}

const BOOKING_MODAL_FR: SiteBookingModalLabels = {
  title: "Réserver",
  paymentTitle: "Paiement sécurisé",
  detailsLead: "Tous les champs marqués d'une {mark} sont obligatoires",
  paymentLead: "Réglez votre séjour par carte bancaire. Vous recevrez une confirmation par e-mail.",
  backToForm: "Retour au formulaire",
  close: "Fermer",
  firstName: "Prénom",
  lastName: "Nom",
  phone: "Téléphone",
  email: "Votre e-mail",
  message: "Message pour l'hôte",
  firstNamePlaceholder: "Camille",
  lastNamePlaceholder: "Dupont",
  phonePlaceholder: "0612345678",
  emailPlaceholder: "vous@exemple.com",
  messagePlaceholder: "Précisez l'heure d'arrivée, un lit bébé, ou toute autre demande…",
  continueToPayment: "Continuer vers le paiement",
  preparingPayment: "Préparation du paiement…",
  recapTitle: "Récapitulatif",
  total: "Total",
  nightsLine: "{nights} × {price} €",
  guestSupplement:
    "Supplément voyageurs (+{extra} € / nuit / voyageur au-delà de {included})",
  weekDiscount: "Remise semaine (−{percent} %, à partir de {min} nuits)",
  monthDiscount: "Remise long séjour (−{percent} %, {min} nuits et +)",
  choosePaymentMethod: "Choisissez votre moyen de paiement",
  payButton: "Payer {total}",
  paymentProcessing: "Paiement en cours…",
  paymentNote:
    "Paiement traité par Stripe. Vos coordonnées bancaires ne transitent pas par notre serveur.",
  stripeNotConfigured: "Paiement non configuré (clé publique Stripe manquante).",
  stripeLoadFailed: "Impossible de charger Stripe.",
  paymentFailed:
    "Le paiement n'a pas pu être finalisé. Réessayez ou utilisez une autre carte.",
  paymentPending: "Paiement en attente de confirmation. Réessayez dans un instant.",
  errors: {
    datesMissing: "Veuillez sélectionner vos dates de séjour.",
    datesInvalid: "Les dates sélectionnées ne sont pas valides.",
    guestsMissing: "Indiquez au moins un voyageur.",
    lastName: "Indiquez votre nom (au moins 2 caractères).",
    firstName: "Indiquez votre prénom (au moins 2 caractères).",
    phone: "Indiquez un numéro valide (8 à 15 chiffres).",
    email: "Indiquez une adresse e-mail valide pour vous répondre.",
    message: "Veuillez ajouter un message pour l'hôte."
  },
  submitErrors: {
    stripeNotConfigured:
      "Paiement par carte non configuré. Ajoutez vos clés Stripe (NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY et STRIPE_SECRET_KEY).",
    paymentsNotReady: "Le paiement en ligne n'est pas encore disponible pour ce logement.",
    sessionExpired:
      "Session expirée. Reconnectez-vous au backoffice pour tester la réservation en aperçu.",
    prepareFailed: "Impossible de préparer le paiement pour le moment. Réessayez plus tard.",
    emailConfirmFailed:
      "Paiement reçu, mais la confirmation par e-mail a échoué. Contactez l'hôte avec votre reçu Stripe."
  },
  success: {
    title: "Réservation confirmée",
    line1: "Merci ! Votre paiement a bien été enregistré.",
    line2:
      "Vous recevrez un e-mail de confirmation avec le récapitulatif de votre séjour. L'hôte pourra vous recontacter si besoin.",
    button: "Compris"
  }
}

const BOOKING_MODAL_EN: SiteBookingModalLabels = {
  title: "Book",
  paymentTitle: "Secure payment",
  detailsLead: "All fields marked {mark} are required",
  paymentLead: "Pay for your stay by card. You will receive a confirmation email.",
  backToForm: "Back to form",
  close: "Close",
  firstName: "First name",
  lastName: "Last name",
  phone: "Phone",
  email: "Your email",
  message: "Message for the host",
  firstNamePlaceholder: "Camille",
  lastNamePlaceholder: "Smith",
  phonePlaceholder: "0612345678",
  emailPlaceholder: "you@example.com",
  messagePlaceholder: "Arrival time, cot request, or any other details…",
  continueToPayment: "Continue to payment",
  preparingPayment: "Preparing payment…",
  recapTitle: "Summary",
  total: "Total",
  nightsLine: "{nights} × €{price}",
  guestSupplement: "Extra guests (+€{extra} / night / guest beyond {included})",
  weekDiscount: "Weekly discount (−{percent}%, from {min} nights)",
  monthDiscount: "Long-stay discount (−{percent}%, {min}+ nights)",
  choosePaymentMethod: "Choose your payment method",
  payButton: "Pay {total}",
  paymentProcessing: "Processing payment…",
  paymentNote:
    "Payment processed by Stripe. Your card details are not stored on our servers.",
  stripeNotConfigured: "Payment not configured (Stripe publishable key missing).",
  stripeLoadFailed: "Unable to load Stripe.",
  paymentFailed: "Payment could not be completed. Try again or use another card.",
  paymentPending: "Payment pending confirmation. Please try again shortly.",
  errors: {
    datesMissing: "Please select your stay dates.",
    datesInvalid: "The selected dates are not valid.",
    guestsMissing: "Please add at least one guest.",
    lastName: "Enter your last name (at least 2 characters).",
    firstName: "Enter your first name (at least 2 characters).",
    phone: "Enter a valid number (8 to 15 digits).",
    email: "Enter a valid email address so we can reply.",
    message: "Please add a message for the host."
  },
  submitErrors: {
    stripeNotConfigured:
      "Card payment is not configured. Add your Stripe keys (NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY).",
    paymentsNotReady: "Online payment is not yet available for this property.",
    sessionExpired: "Session expired. Sign in to the admin again to test booking in preview.",
    prepareFailed: "Unable to prepare payment right now. Please try again later.",
    emailConfirmFailed:
      "Payment received, but the confirmation email failed. Contact the host with your Stripe receipt."
  },
  success: {
    title: "Booking confirmed",
    line1: "Thank you! Your payment has been recorded.",
    line2:
      "You will receive a confirmation email with your stay summary. The host may contact you if needed.",
    button: "Got it"
  }
}

export function getSiteBookingModalLabels(locale: HostivLocale): SiteBookingModalLabels {
  return locale === "en" ? BOOKING_MODAL_EN : BOOKING_MODAL_FR
}
