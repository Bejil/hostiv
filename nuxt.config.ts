// https://nuxt.com/docs/api/configuration/nuxt-config

/** Racine `/` = Hostiv (marketing) ; site location : `/:slug` (ex. `/thegrandappartement`) */
const appBaseURL = process.env.NUXT_APP_BASE_URL || "/"

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/nuxt-ui-admin.css"],
  ui: {
    colorMode: false,
    fonts: false
  },
  vite: {
    ssr: {
      external: ["leaflet"]
    }
  },
  app: {
    baseURL: appBaseURL,
    head: {}
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    /** Clé API Resend (https://resend.com) */
    resendApiKey: process.env.RESEND_API_KEY || "",
    /** Expéditeur — domaine doit être vérifié chez Resend sauf onboarding@resend.dev */
    bookingEmailFrom:
      process.env.BOOKING_EMAIL_FROM ||
      "The Grand Appartement <onboarding@resend.dev>",
    /** Destinataire du formulaire de contact Hostiv */
    hostivContactEmail: process.env.HOSTIV_CONTACT_EMAIL || "contact@hostiv.fr",
    /** Clé secrète Stripe (https://dashboard.stripe.com/apikeys) */
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    /**
     * Optionnel — ID pmc_… créé dans
     * https://dashboard.stripe.com/settings/payment_methods (configurations de moyens de paiement)
     */
    stripePaymentMethodConfiguration:
      process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION || "",
    /** Secret endpoint webhook Stripe (account.updated, etc.) */
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    /** Commission plateforme sur chaque réservation (0–100 %, défaut 0) */
    hestiaPlatformFeePercent: process.env.HESTIA_PLATFORM_FEE_PERCENT || "0",
    public: {
      /** Clé publique Stripe pour le formulaire de paiement */
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      /** URL publique du site (liens dans les e-mails de confirmation) */
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "",
      /** Slug du site démo lié depuis la landing Hostiv */
      demoPropertySlug: process.env.NUXT_PUBLIC_DEMO_PROPERTY_SLUG || "thegrandappartement",
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
      /** Bucket Storage des assets sites (défaut : property-assets) */
      propertyAssetsBucket:
        process.env.NUXT_PUBLIC_PROPERTY_ASSETS_BUCKET || "property-assets"
    }
  }
})
