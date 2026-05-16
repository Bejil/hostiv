// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/branding/header-logo.png"
        }
      ]
    }
  },
  runtimeConfig: {
    /** Destinataire des demandes de réservation (vous / l’hôte) */
    bookingNotifyEmail: process.env.BOOKING_NOTIFY_EMAIL || "",
    /** Clé API Resend (https://resend.com) */
    resendApiKey: process.env.RESEND_API_KEY || "",
    /** Expéditeur — domaine doit être vérifié chez Resend sauf onboarding@resend.dev */
    bookingEmailFrom:
      process.env.BOOKING_EMAIL_FROM ||
      "The Grand Appartement <onboarding@resend.dev>",
    /** Clé secrète Stripe (https://dashboard.stripe.com/apikeys) */
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    /**
     * Optionnel — ID pmc_… créé dans
     * https://dashboard.stripe.com/settings/payment_methods (configurations de moyens de paiement)
     */
    stripePaymentMethodConfiguration:
      process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION || "",
    public: {
      /** Clé publique Stripe pour le formulaire de paiement */
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      /** URL publique du site (liens dans les e-mails de confirmation) */
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || ""
    }
  }
})
