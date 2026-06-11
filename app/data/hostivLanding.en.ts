export const hostivAdminHeaderUi = {
  account: "My account",
  settings: "Settings",
  logout: "Log out",
  unsaved: "Unsaved"
} as const

export const hostivNavUi = {
  mySite: "My site",
  myAdmin: "My dashboard",
  logout: "Log out",
  login: "Log in",
  signup: "Get started",
  menu: "Menu",
  languageLabel: "Language"
} as const

export const hostivHeroContent = {
  pill: "Direct booking for hosts",
  title: "Your rental website,",
  titleAccent: "no commission",
  lead:
    "Go direct like on Airbnb or Booking — but without their cut on every night. Hostiv brings your site, calendar, Stripe payments and admin together in one tool.",
  proofAriaLabel: "Hostiv benefits",
  ctaPrimary: "Get started now",
  ctaSecondary: "See an example",
  illustrationAlt: "Illustration: travellers in front of a rental building",
  illustrationCaption: "Their stay starts on your website",
  dreamCardEyebrow: "Direct booking",
  dreamCardQuote: "“We found the perfect home —",
  dreamCardQuoteEm: "without going through a platform.”",
  stayCardTitle: "Olive Tree Villa",
  stayCardMeta: "5 nights · arriving tomorrow",
  stayCardBadge: "Confirmed"
} as const

export const hostivLandingSections = {
  features: {
    eyebrow: "The essentials",
    title: "Go direct,",
    titleLine2: "without OTA commission",
    intro:
      "Keep the margin on your direct nights — and keep promoting your listing on platforms to reach more guests."
  },
  commission: {
    recommendedLabel: "Recommended",
    feePrefix: "Up to ~"
  },
  showcase: {
    imageAltPrefix: "Preview of the",
    placeholder: "Screenshot coming soon"
  },
  steps: {
    eyebrow: "How it works",
    title: "In three steps",
    intro:
      "From going live to your first direct booking — with no commission paid back to Hostiv."
  }
} as const

export const hostivStaticUi = {
  lastUpdated: "Last updated:",
  backHome: "← Back to home",
  contactFormCta: "Open contact form"
} as const

export const hostivSeo = {
  homeTitle: "Hostiv | Direct booking website for hosts",
  homeDescription:
    "Hostiv: direct booking website with no platform commission. Sync calendars and get paid via Stripe — unlike OTAs.",
  homeOgTitle: "Hostiv — Direct booking, 0% commission",
  homeOgDescription:
    "Go direct without the Airbnb or Booking cut. Site, calendar, Stripe payments and admin."
} as const

export const hostivNavLinks = [
  { label: "Features", href: "#fonctionnalites" },
  { label: "How it works", href: "#comment" }
] as const

export const hostivHeroProofPoints = [
  "0% Hostiv commission on your direct bookings",
  "Unlike platforms that take up to ~20% per stay",
  "Stripe Connect payouts to your account"
] as const

export const hostivCommissionCompare = {
  eyebrow: "Your revenue",
  title: "Zero Hostiv commission",
  intro:
    "Marketplaces charge a share on every night. With Hostiv, you keep the margin on direct bookings — while still promoting your listing on Airbnb, Booking or Vrbo for visibility.",
  platform: {
    label: "Traditional platforms",
    examples: "Airbnb, Booking, Vrbo…",
    fee: "Up to ~20%",
    meterLabel: "Commission taken",
    meterPercent: 20,
    detail: "Host commission (often topped up by guest fees) taken on every booking."
  },
  hostiv: {
    label: "Hostiv direct booking",
    fee: "0%",
    feeSuffix: "Hostiv commission",
    meterLabel: "Hostiv commission",
    meterPercent: 0,
    detail:
      "Hostiv does not stop you staying visible on OTAs: combine platform promotion with direct bookings at zero Hostiv commission."
  },
  footnote:
    "Only Stripe card processing fees apply. Hostiv complements your existing channels — it does not replace them."
} as const

export const hostivShowcaseExamples = {
  eyebrow: "Design",
  title: "Several design options",
  intro:
    "Pick a ready-made template for your site: same direct booking, same sections — a different visual identity per theme.",
  items: [
    {
      id: "design-riviera",
      title: "Riviera",
      caption: "Rose accents and gradients — a premium showcase for upscale rentals.",
      imageSrc: "/hostiv/examples/site-demo_0.png",
      imageWidth: 3900,
      imageHeight: 2258
    },
    {
      id: "design-classique",
      title: "Classic",
      caption: "Clean layout, light background and red accents — readable and conversion-focused.",
      imageSrc: "/hostiv/examples/site-demo_1.png",
      imageWidth: 1024,
      imageHeight: 591
    },
    {
      id: "design-terre-lin",
      title: "Earth & linen",
      caption: "Warm beige and terracotta — ideal for character homes.",
      imageSrc: "/hostiv/examples/site-demo_2.png",
      imageWidth: 1024,
      imageHeight: 592
    }
  ]
} as const

export const hostivFeatures = [
  {
    icon: "Globe",
    tag: "Direct",
    title: "No middleman website",
    description:
      "Your guests book with you — not a marketplace taking commission on every stay."
  },
  {
    icon: "CalendarSync",
    tag: "Sync",
    title: "Synced calendars",
    description:
      "Hostiv does not mean leaving OTAs: keep listings active for visibility while pushing direct bookings."
  },
  {
    icon: "BadgePercent",
    tag: "0%",
    title: "No Hostiv commission",
    description:
      "Unlike OTAs, Hostiv does not take a percentage of your nights. Only Stripe payment fees apply."
  }
] as const

export const hostivSteps = [
  {
    step: "01",
    icon: "LayoutTemplate",
    title: "Publish your site",
    hint: "~15 min",
    description:
      "A branded showcase for direct bookings — without giving 15–20% to a platform on every stay.",
    details: [
      "Pick a template and customise colours & copy",
      "Add photos, spaces, amenities and house rules",
      "Set your rates: what the guest pays is what you receive (minus Stripe fees)"
    ],
    outcome: "Your site is live on a dedicated URL — ready to convert with zero Hostiv commission."
  },
  {
    step: "02",
    icon: "Link2",
    title: "Connect your calendars",
    hint: "ICS & iCal",
    description:
      "Stay visible on platforms, sync calendars and gradually steer guests to your direct site.",
    details: [
      "Import ICS feeds from Airbnb, Booking, Vrbo…",
      "Keep promoting on OTAs to maximise visibility",
      "See blocked dates in one calendar — no double bookings"
    ],
    outcome:
      "OTA visibility and direct bookings without Hostiv commission — both strategies work together."
  },
  {
    step: "03",
    icon: "Sparkles",
    title: "Receive bookings",
    hint: "Direct · 0%",
    description:
      "Guests book on your site; you keep the margin, without the usual OTA share.",
    details: [
      "Card payment via Stripe Connect — to your account",
      "No Hostiv commission on the stay amount",
      "Confirmation emails and tracking in admin"
    ],
    outcome: "Every stay is tracked: you get paid without handing a % to a marketplace."
  }
] as const

export type HostivPricingPlanId = "starter" | "pro"

export const hostivPricing = {
  eyebrow: "Pricing",
  title: "Clear plans, an obvious choice",
  intro:
    "One property per account — launch your direct booking site with no Hostiv commission on your nights.",
  plans: [
    {
      id: "starter",
      name: "Starter",
      price: 49,
      period: "year",
      accent: "green" as const,
      tagline: "For hosts who want to launch their direct booking site quickly.",
      positioning: "Everything you need to start receiving direct bookings.",
      features: [
        "1 rental website",
        "Direct booking system",
        "Integrated Stripe payments",
        "Calendar sync (iCal)",
        "Photo gallery",
        "Reservation management dashboard"
      ],
      cta: "Start with Starter",
      buttonVariant: "secondary" as const
    },
    {
      id: "pro",
      name: "Pro",
      price: 69,
      period: "year",
      accent: "pro" as const,
      recommended: true,
      badge: "Popular",
      ribbon: "Most popular",
      tagline: "For hosts who want a more professional, higher-converting site.",
      positioning: "A more beautiful, credible site that converts more visitors into guests.",
      includesLabel: "Includes Starter +",
      extraFeatures: ["Printable welcome guide PDF", "Invoice editing"],
      cta: "Go Pro",
      buttonVariant: "primary" as const
    }
  ],
  premiumAddon: {
    name: "Starter +",
    price: 30,
    period: "year",
    pricePrefix: "+",
    label: "Starter plan add-on",
    tagline:
      "Printable welcome guide PDF and PDF invoices for direct bookings — nothing else.",
    note: "Guide PDF and invoices are already included in Pro — no add-on needed.",
    proNudge:
      "Pro also includes Starter +, plus premium templates and visit analytics.",
    chooseProCta: "Choose Pro",
    ariaLabel: "Starter +: welcome guide PDF and invoices for Starter plan",
    features: [
      "Personalised welcome guide PDF, ready to print",
      "PDF invoices for each direct booking"
    ]
  },
  trust: ["No commitment", "Set up in minutes", "Secure payments via Stripe"]
} as const

export const hostivCta = {
  title: "Keep 100% of your direct revenue",
  lead:
    "Choose your plan, pay online: your account and site are created after payment is confirmed.",
  highlights: [
    "Sign up and pay securely by card — account created only after payment",
    "0% Hostiv commission: you get paid via Stripe to your account",
    "Keep Airbnb and Booking for visibility, push direct without calendar conflicts"
  ],
  button: "Choose my plan"
} as const

export const hostivNotFoundUi = {
  eyebrow: "Error 404",
  titles: {
    page: "Page not found",
    site: "Site not found",
    backoffice: "Dashboard not found"
  },
  messages: {
    page: "This address does not exist or the link is incorrect.",
    site: "This site does not exist or is not published yet.",
    backoffice: "This dashboard does not exist."
  },
  requestedAddress: "Requested address:",
  backHome: "Back to Hostiv home",
  createSite: "Create my site",
  seoTitleSuffix: " | Hostiv",
  error: {
    eyebrow: "Error {code}",
    title: "Something went wrong",
    message: "Try again in a moment or return to the home page.",
    backHome: "Back to home",
    seoTitle: "Error | Hostiv"
  }
} as const

export const hostivFooter = {
  baseline: "Direct booking for short-term rental hosts.",
  columns: [
    {
      id: "about",
      title: "About",
      links: [
        { label: "About us", href: "/en/about" },
        { label: "Contact us", href: "/en/contact" }
      ]
    },
    {
      id: "legal",
      title: "Legal",
      links: [
        { label: "Legal notice", href: "/en/legal-notice" },
        { label: "Privacy policy", href: "/en/privacy-policy" },
        { label: "Terms of use", href: "/en/terms-of-use" }
      ]
    }
  ]
} as const
