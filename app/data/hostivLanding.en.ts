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
  pricing: "Pricing",
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
  breadcrumbHomeLabel: "Home",
  homeTitle: "Hostiv | Vacation rental website generator",
  homeDescription:
    "Create your holiday rental website with direct bookings, iCal sync and Stripe payments. Site builder for hosts — 0% commission on your stays.",
  homeOgTitle: "Hostiv — Holiday rental site builder, no commission",
  homeOgDescription:
    "Launch your vacation rental website in minutes. Direct booking, calendar sync and Stripe Connect — no platform commission.",
  signupConfirmationTitle: "Sign-up confirmed | Hostiv",
  signupConfirmationDescription: "Your Hostiv account is being activated after sign-up.",
  pricingPageTitle: "Hostiv pricing | Vacation rental website plans",
  pricingPageDescription:
    "Starter (€49/yr) and Pro (€99/yr) plans to create your holiday rental site: direct booking, Stripe and iCal. Zero commission on your stays.",
  pricingPageOgTitle: "Hostiv pricing — Seasonal rental website from €49/yr",
  pricingPageOgDescription:
    "Compare Hostiv plans to publish a short-term rental website and receive direct bookings."
} as const

export const hostivNavLinks = [
  { label: "Features", href: "#fonctionnalites" },
  { label: "How it works", href: "#comment" },
  { label: "Pricing", href: "/en/pricing" },
  { label: "FAQ", href: "#faq" }
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
    "Starter for one property, Pro for several — each site has its own annual plan.",
  plans: [
    {
      id: "starter",
      name: "Starter",
      price: 49,
      period: "year",
      accent: "green" as const,
      tagline: "Launch a first direct booking site without advanced add-ons.",
      positioning: "Everything you need to receive direct bookings on one property.",
      features: [
        "1 property",
        "Direct booking",
        "Integrated Stripe payments",
        "Calendar sync (iCal)",
        "Photo gallery",
        "Reservation management"
      ],
      cta: "Start with Starter",
      buttonVariant: "secondary" as const
    },
    {
      id: "pro",
      name: "Pro",
      price: 99,
      period: "year",
      accent: "pro" as const,
      recommended: true,
      badge: "Popular",
      ribbon: "Most popular",
      tagline: "For multi-property hosts and a more complete backoffice.",
      positioning: "Multiple sites, PDF guide, invoices and co-hosts — all included.",
      includesLabel: "Everything in Starter +",
      extraFeatures: [
        "Multiple properties",
        "Printable welcome guide PDF",
        "PDF invoices",
        "Co-hosts"
      ],
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
      "Welcome guide PDF, PDF invoices and co-hosts for your Starter property.",
    note: "PDF guide, invoices and co-hosts are already included in Pro.",
    proNudge: "Pro includes these options on every property, plus multi-property support.",
    chooseProCta: "Choose Pro",
    ariaLabel: "Starter +: PDF guide, invoices and co-hosts for Starter plan",
    features: [
      "Personalised welcome guide PDF, ready to print",
      "PDF invoices for each direct booking",
      "Unlimited co-hosts on the property"
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

export const hostivFaqSection = {
  eyebrow: "FAQ",
  title: "Frequently asked questions",
  intro:
    "Everything you need to know about Hostiv, commission-free direct booking and launching your rental website.",
  pricingCta: "View pricing",
  resourcesCta: "Read our guides",
  guideCta: "Read the full guide →"
} as const

const hostivFaqsDirect = [
  {
    group: "direct",
    question: "What is a direct booking website?",
    answer:
      "It is a website in your name where guests view your property and book without going through Airbnb or Booking. You keep the guest relationship and margin on every night — Hostiv provides the site, calendar and Stripe payments."
  },
  {
    group: "direct",
    question: "Is Hostiv an alternative to Airbnb or Booking?",
    answer:
      "Hostiv complements OTAs rather than replacing them: keep your listings for visibility and steer part of your traffic to your direct site. You avoid marketplace commission on those bookings."
  },
  {
    group: "direct",
    question: "Does Hostiv charge commission on my direct bookings?",
    answer:
      "No. Hostiv charges no commission on your stay amount. You only pay an annual subscription (Starter or Pro). Standard Stripe card processing fees still apply."
  },
  {
    group: "direct",
    question: "Can I keep my Airbnb or Booking listing?",
    answer:
      "Yes. Import their iCal feeds into Hostiv, export your site iCal URL to each platform, and add a “Book on my website” link in your bio or messages."
  }
] as const

const hostivFaqsSetup = [
  {
    group: "setup",
    question: "How long does it take to publish my site?",
    answer:
      "Allow about 15 minutes to pick a template, add photos and copy, then publish. Stripe Connect and iCal sync are set up afterwards from your dashboard."
  },
  {
    group: "setup",
    question: "Do I need technical skills?",
    answer:
      "No. Hostiv is built for hosts: visual editor, guided fields and live preview. No code or hosting to manage on your side."
  },
  {
    group: "setup",
    question: "What is my website address?",
    answer:
      "Each property gets a dedicated URL on Hostiv, in the form /your-slug (e.g. hostiv.fr/olive-tree-villa). You choose the slug at sign-up."
  },
  {
    group: "setup",
    question: "Can I customize my site design?",
    answer:
      "Yes: multiple templates, colours, copy, photo gallery, amenities and modular sections. The Pro plan adds premium options for a more professional look."
  }
] as const

const hostivFaqsPricing = [
  {
    group: "pricing",
    question: "How much does Hostiv cost?",
    answer:
      "Starter is €49/year (1 property). Starter + is +€30/year (PDF guide, invoices, co-hosts). Pro is €99/year (multi-property and all-inclusive)."
  },
  {
    group: "pricing",
    question: "What is the difference between Starter and Pro?",
    answer:
      "Starter covers 1 property with direct booking, Stripe, iCal and reservation management — no PDF guide, invoices or co-hosts. Pro supports multiple properties and includes PDF guide, invoices and co-hosts. On Starter, the Starter + add-on (+€30/year) unlocks those three features for one property."
  },
  {
    group: "pricing",
    question: "Is there a commitment or free trial?",
    answer:
      "No commitment: the subscription is annual and renewable. There is no free trial, but setup is quick and you can reuse OTA content to populate your site."
  },
  {
    group: "pricing",
    question: "How does online payment work?",
    answer:
      "Guests pay by card via Stripe Connect. Funds go to your host Stripe account, minus standard Stripe fees. Hostiv does not take a cut of the stay."
  }
] as const

const hostivFaqsAccount = [
  {
    group: "account",
    question: "Do I need a Stripe account?",
    answer:
      "Yes. During onboarding you connect a Stripe Connect account (individual or business depending on your situation). That account receives your direct booking payouts."
  },
  {
    group: "account",
    question: "Can I manage multiple properties?",
    answer:
      "Yes, with the Pro plan (€99/year per property). Starter is limited to 1 property; add more from the property switcher in your dashboard."
  },
  {
    group: "account",
    question: "How do I sync my calendar?",
    answer:
      "In Hostiv admin, import iCal feeds from your OTAs. Then paste your Hostiv site iCal URL into Airbnb, Booking or Vrbo calendar settings."
  },
  {
    group: "account",
    question: "How do I avoid double bookings?",
    answer:
      "iCal sync blocks booked dates on both sides. On Hostiv, you can also block or unblock a date manually in Reservations (if it is not already booked). Direct bookings and iCal imports complete the calendar."
  }
] as const

export const hostivFaqGroupLabels = {
  direct: "Direct booking",
  setup: "Getting started",
  pricing: "Pricing & payments",
  account: "Calendar & account"
} as const

export const hostivFaqGroups = [
  { id: "direct" as const, label: hostivFaqGroupLabels.direct, items: hostivFaqsDirect },
  { id: "setup" as const, label: hostivFaqGroupLabels.setup, items: hostivFaqsSetup },
  { id: "pricing" as const, label: hostivFaqGroupLabels.pricing, items: hostivFaqsPricing },
  { id: "account" as const, label: hostivFaqGroupLabels.account, items: hostivFaqsAccount }
] as const

export const hostivFaqs = [
  ...hostivFaqsDirect,
  ...hostivFaqsSetup,
  ...hostivFaqsPricing,
  ...hostivFaqsAccount
] as const

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

export const hostivAccountModalUi = {
  close: "Close",
  tabsAria: "Account type",
  signupTab: "Sign up",
  loginTab: "Log in",
  titles: {
    signup: "Create your account",
    login: "Welcome back"
  },
  subtitles: {
    signup:
      "Choose your plan, enter your details and pay online. Your account and site are created after payment.",
    login: "Log in to manage your site and bookings."
  },
  plans: {
    legend: "Plan",
    chooseAria: "Choose a plan",
    note:
      "One-time card payment via Stripe. No account or site is created until payment is confirmed."
  },
  fields: {
    fullName: "Full name",
    fullNamePlaceholder: "Jane Smith",
    propertyName: "Property name",
    propertyPlaceholder: "Olive Tree Villa",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholderSignup: "Create a secure password",
    passwordPlaceholderLogin: "Your password"
  },
  slugStatus: {
    checking: "Checking availability…",
    available: "Name available — your site will be at /{slug}",
    taken: "This name is already taken. Choose another property name.",
    tooShort: "Name too short (at least 3 characters once converted to a web address).",
    reserved: "This name is reserved and cannot be used.",
    invalidFormat: "The name can only contain letters and numbers.",
    invalid: "Invalid name for your site address.",
    error: "Unable to check this name right now.",
    preview: "Planned address: /{slug}",
    hint: "Enter a name to generate your site address."
  },
  passwordRules: {
    intro:
      "Your password must be long and complex enough, with letters (upper and lower case), numbers, punctuation and special characters:",
    length: "At least 8 characters",
    lowercase: "One lowercase letter",
    uppercase: "One uppercase letter",
    digit: "One digit",
    special: "One special or punctuation character"
  },
  errors: {
    paymentCancelled: "Payment cancelled. No account was created — you can try again.",
    nameAndEmail: "Enter your name and a valid email.",
    passwordInvalid: "Choose a password that meets all security requirements.",
    propertyRequired: "Enter your property name to create your site.",
    propertyTaken: "This property name is already taken. Change it to continue.",
    propertyInvalid: "Choose a valid, available property name.",
    checkoutFailed: "Unable to open checkout. Please try again later.",
    loginCredentials: "Enter your email and password.",
    supabaseUnavailable: "Sign-in unavailable: Supabase is not configured in this environment.",
    noSite:
      "Signed in successfully, but no site is linked to this account. Contact us if the issue persists.",
    loginFailed: "Unable to sign in. Check your credentials."
  },
  buttons: {
    payLoading: "Redirecting to Stripe…",
    pay: "Pay €{price} / {period} — {name}",
    loginLoading: "Signing in…",
    login: "Sign in"
  },
  forgotPasswordLink: "Forgot password?",
  forgotPassword: {
    title: "Forgot password",
    subtitle:
      "Enter your Hostiv account email. If an account exists, you will receive a link valid for 24 hours.",
    submit: "Send reset link",
    submitting: "Sending…",
    backToLogin: "Back to sign in",
    success:
      "If an account is linked to this address, an email with a reset link has just been sent.",
    errors: {
      invalidEmail: "Invalid email address.",
      sendFailed: "Unable to send the email right now."
    }
  }
} as const

export const hostivContactModalUi = {
  close: "Close",
  title: "Contact us",
  subtitle: "Describe your request — we will reply by email.",
  fields: {
    name: "Full name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    messagePlaceholder: "Describe your question or situation…"
  },
  defaultSubject: "General question",
  subjectOptions: [
    "General question",
    "Account and subscription",
    "Site and bookings",
    "Stripe and payments",
    "Other"
  ] as const,
  submit: "Send message",
  submitting: "Sending…",
  errors: {
    required: "Please fill in all required fields.",
    sendFailed: "Unable to send your message. Please try again later."
  },
  success:
    "Message sent. A confirmation email has been sent to you — we usually reply within 2 business days."
} as const

export const hostivPasswordResetPageUi = {
  loading: "Checking link…",
  title: "New password",
  subtitle: "Choose a secure password. This link is valid for 24 hours.",
  confirmPassword: "Confirm password",
  confirmPasswordPlaceholder: "Re-enter your password",
  submit: "Save password",
  submitting: "Saving…",
  successTitle: "Password updated",
  successLead: "You can sign in with your new password.",
  openLogin: "Sign in",
  backHome: "Back to home",
  errors: {
    incompleteLink: "Incomplete link. Use the link from your email.",
    invalidLink: "Invalid or already used link.",
    expiredLink: "This link has expired. Request a new one from the sign-in page.",
    loadFailed: "Unable to verify this link.",
    passwordMismatch: "Passwords do not match.",
    passwordInvalid: "Choose a password that meets all security requirements.",
    saveFailed: "Unable to update your password."
  },
  seoTitle: "Reset your password | Hostiv",
  seoDescription: "Set a new password for your Hostiv account using the link from your email."
} as const

export const hostivFooter = {
  baseline: "Direct booking for short-term rental hosts.",
  columns: [
    {
      id: "about",
      title: "About",
      links: [
        { label: "About us", href: "/en/about" },
        { label: "Host guides", href: "/en/resources" },
        { label: "Pricing", href: "/en/pricing" },
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
