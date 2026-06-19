import type { AdminOnboardingStep } from "../admin-onboarding-steps"
import type { AdminSetupGuideItem } from "../../utils/admin-setup-guide"
import { adminUiLabelsDomainsEn } from "./labels-domains.en"

export const adminUiLabelsEn = {
  ...adminUiLabelsDomainsEn,
  header: {
    account: "My account",
    settings: "Settings",
    cohosts: "Co-hosts",
    logout: "Log out",
    unsaved: "Unsaved",
    switchProperty: "Switch property",
    addProperty: "Add a property",
    roleOwner: "Owner",
    roleCohost: "Co-host",
    logoHome: "View site"
  },
  properties: {
    switcherAria: "Your properties",
    addTitle: "Add a property",
    addLead: "A new site with its own annual plan — just like when you signed up.",
    addProOnlyTitle: "Upgrade to Pro to add a property",
    addProOnlyLead:
      "Starter is limited to 1 property. To create a second one, you need the Pro plan.",
    addProOnlyNoticeKicker: "Pro plan required",
    addProOnlyNoticeLead:
      "Your current Starter property stays unchanged. The new site is billed separately.",
    addProOnlyPlanLegend: "Required plan",
    addProOnlySubmit: "Pay for Pro — €{price}/year and create site",
    submit: "Pay and create site",
    submitting: "Redirecting to Stripe…",
    checkoutFailed: "Unable to start checkout.",
    created: "Your new property is ready.",
    cancelled: "Creation cancelled.",
    verifyFailed: "Unable to confirm property creation."
  },
  common: {
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    delete: "Delete",
    retry: "Retry",
    skip: "Skip",
    undoSkip: "Undo",
    loading: "Loading…",
    inProgress: "In progress…",
    information: "Information"
  },
  shell: {
    checkingBackoffice: "Checking dashboard…",
    loadingProperty: "Loading {name}…",
    editorUnavailableTitle: "Unable to display the editor",
    editorUnavailableAuthenticated:
      "Site data could not be loaded. Check your connection or permissions.",
    editorUnavailableSession: "Session expired or access denied for this site.",
    savebarUnsaved: "Unsaved changes on",
    propertyNotFound: "This dashboard does not exist.",
    accessDenied: "Access denied.",
    loadSiteFailed: "Unable to load the site.",
    subscriptionExpired: "Your plan expired on {date}. Renew it to access the editor.",
    subscriptionRequired: "Hostiv plan required. Pay the annual fee to access the dashboard.",
    paymentCancelled: "Payment cancelled. Renew your plan to access the dashboard.",
    paymentIncomplete: "Incomplete payment return. Try renewing again.",
    paymentRenewed: "Plan renewed for 12 months. The editor is available again.",
    paymentPending: "Payment received — activation in progress. Refresh in a moment if needed.",
    paymentVerifyFailed: "Unable to confirm payment.",
    saved: "Changes saved.",
    verifyBackofficeFailed: "Unable to verify this backoffice.",
    prepareEditorFailed: "Unable to prepare the editor.",
    renderEditorFailed: "Editor display error.",
    supabaseConfigInvalid: "Invalid Supabase configuration."
  },
  mainTabs: {
    ariaLabel: "Site settings",
    incompleteSectionOne: "1 unfilled section",
    incompleteSections: "{count} unfilled sections",
    upcomingReservations: "Upcoming reservations",
    stripeIncomplete: "Stripe setup incomplete",
    preview: "Preview",
    previewTitle: "Open site preview in a new tab"
  },
  login: {
    title: "Log in",
    checkingTitle: "Checking session",
    checkingSubtitle: "We’re checking that you’re still signed in…",
    checkingSession: "Checking session…",
    subtitle: "Access the {name} dashboard (/{slug}) with your Hostiv account.",
    email: "Email",
    password: "Password",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Your password",
    submit: "Log in",
    submitting: "Signing in…"
  },
  nav: {
    top: [
      { id: "general", label: "General", title: "General", description: "Publishing and SEO." },
      {
        id: "customization",
        label: "Content",
        title: "Customization",
        description: "Public site content and layout — live preview on the right."
      },
      {
        id: "welcome-guide",
        label: "Guide",
        title: "Welcome guide PDF",
        description: "Printable welcome booklet (Starter + or Pro plan)."
      },
      {
        id: "images",
        label: "Gallery",
        title: "Gallery",
        description: "Photos organised in sections with title and subtitle."
      },
      {
        id: "reservations",
        label: "Reservations",
        title: "Reservations",
        description: "ICS feeds and calendar of booked dates."
      },
      {
        id: "guest-reviews",
        label: "Reviews",
        title: "Guest reviews",
        description: "Feedback left by guests after their stay."
      },
      {
        id: "payouts",
        label: "Finances",
        title: "Accounting",
        description: "Rates, Stripe payouts and payment settings."
      }
    ],
    customization: [
      {
        id: "template",
        label: "Appearance",
        title: "Layout & ambiance",
        description: "Section structure and visual palette (colors, typography, cards) across the whole site."
      },
      {
        id: "header",
        label: "Header",
        title: "Header",
        description: "Logo, brand name and subtitle shown in the navigation bar."
      },
      {
        id: "seo",
        label: "Search / hero",
        title: "Search / hero",
        description: "Background image, copy and booking strip at the top of the page."
      },
      {
        id: "platforms",
        label: "Platforms",
        title: "Platforms",
        description: "Intro copy and links to Airbnb, Booking, etc."
      },
      {
        id: "host",
        label: "Host",
        title: "Host",
        description: "Host presentation and photo."
      },
      {
        id: "featured",
        label: "Featured spaces",
        title: "Featured spaces",
        description: "Highlighted spaces on the homepage."
      },
      {
        id: "benefits",
        label: "Benefits",
        title: "Benefits",
        description: "Cards highlighting the property’s strengths."
      },
      {
        id: "location",
        label: "Location",
        title: "Location",
        description: "Map, address and neighbourhood highlights."
      },
      {
        id: "media",
        label: "Explore",
        title: "Explore",
        description: "Gallery, visual cards and section copy."
      },
      {
        id: "booking",
        label: "Rates",
        title: "Rates",
        description: "Copy for the rates section on the public site."
      },
      {
        id: "amenities",
        label: "Amenities",
        title: "Amenities",
        description: "Amenity cards and section copy."
      },
      {
        id: "reviews",
        label: "Reviews",
        title: "Reviews",
        description: "Guest reviews and testimonials background."
      },
      {
        id: "rules",
        label: "House rules",
        title: "House rules",
        description: "Check-in/out times, house rules and section copy."
      }
    ],
    fallback: {
      label: "General",
      title: "General",
      description: "Site settings."
    }
  },
  setupGuide: {
    kicker: "Getting started",
    ariaLabel: "Getting started guide",
    progressAllComplete: "All set!",
    progressRequiredDone: "Minimum setup complete",
    progressDefault: "Setup guide",
    progressMeta: "{completed}/{total} done",
    progressMetaPlural: "{completed}/{total} done",
    progressRequired: "· {completed}/{total} required",
    collapse: "Collapse guide",
    expand: "Expand guide",
    dismiss: "Close guide permanently",
    open: "Open guide",
    doneComplete:
      "Your site and dashboard are fully set up. You can publish when you’re ready.",
    doneRequired:
      "Required steps are done. Finish or skip the remaining steps below.",
    sublistKicker: "All sections",
    showSections: "Show sections",
    items: [
      { id: "theme", label: "Layout and ambiance", section: "customization", blockId: "template" },
      { id: "customization", label: "Customize your page", section: "customization" },
      { id: "gallery", label: "Add images to the gallery", section: "images" },
      { id: "stripe", label: "Set up Stripe payments", section: "payouts" },
      {
        id: "calendars",
        label: "Add third-party calendars",
        optional: true,
        section: "reservations"
      },
      {
        id: "seo-keywords",
        label: "Add SEO keywords",
        optional: true,
        section: "general"
      }
    ] satisfies AdminSetupGuideItem[]
  },
  onboarding: {
    steps: [
      {
        id: "welcome",
        section: null,
        title: "Welcome to your dashboard",
        subtitle: "Complete the 7 steps to set up your direct booking site.",
        tips: [
          "All indicated fields are required",
          "You can refine content later in Customization"
        ],
        cta: "Get started"
      },
      {
        id: "header",
        section: "header",
        title: "Step 1 — Site identity",
        subtitle: "Logo, display name and subtitle visible in your site header.",
        tips: ["Logo", "Display name", "Subtitle"],
        cta: "Next step"
      },
      {
        id: "template",
        section: "template",
        title: "Step 2 — Site appearance",
        subtitle: "Choose the layout and visual ambiance applied across your whole site.",
        tips: ["Layout", "Ambiance"],
        cta: "Next step"
      },
      {
        id: "seo",
        section: "seo",
        title: "Step 3 — Homepage",
        subtitle: "Hero photo and headline copy at the top of your site.",
        tips: ["Main photo", "Eyebrow", "Title", "Intro text"],
        cta: "Next step"
      },
      {
        id: "images",
        section: "images",
        title: "Step 4 — Photo gallery",
        subtitle: "At least one section with title, subtitle and one photo.",
        tips: ["Section title", "Section subtitle", "At least 1 photo"],
        cta: "Next step"
      },
      {
        id: "host",
        section: "host",
        title: "Step 5 — Host presentation",
        subtitle: "Put a face and a human voice behind your listing.",
        tips: ["Host photo", "Caption", "Title", "Quote", "Introduction"],
        cta: "Next step"
      },
      {
        id: "location",
        section: "location",
        title: "Step 6 — Location",
        subtitle: "Where the property is and how to present the area.",
        tips: ["Address", "Neighbourhood lead paragraph"],
        cta: "Next step"
      },
      {
        id: "booking",
        section: "booking",
        title: "Step 7 — Rates",
        subtitle: "Default displayed price and included guest count.",
        tips: ["Nightly price", "Guests included"],
        cta: "Finish setup"
      }
    ] satisfies AdminOnboardingStep[]
  },
  onboardingUi: {
    progressWelcome: "Required site setup",
    progressDone: "Setup complete",
    progressStep: "Step {current} of {total}",
    badge: "Welcome to Hostiv",
    welcomeTitle: "Your new site",
    welcomeLead:
      "Complete the {total} steps below to activate your backoffice. Setup is required before you can continue.",
    highlightForms: "Built-in forms at each step",
    highlightValidation: "Validation before moving on",
    highlightRequired: "Required fields marked with an asterisk",
    celebrationTitle: "Setup complete",
    celebrationLead:
      "All {total} required steps are done. Your changes have been saved — refine your site from the sidebar menu.",
    previous: "Previous",
    start: "Get started",
    openBackoffice: "Open backoffice",
    finishTour: "Finish setup",
    nextStep: "Next step"
  },
  accountingSections: [
    {
      id: "pricing",
      label: "Rates",
      description: "Night, week and month",
      title: "Rates",
      lead: "Base price, guests included and long-stay discounts."
    },
    {
      id: "revenue",
      label: "Revenue",
      description: "Monthly payouts",
      title: "Revenue",
      lead: "Gross amounts from confirmed direct bookings, filtered by payment date."
    },
    {
      id: "payments",
      label: "Stripe settings",
      description: "Connect account",
      title: "Stripe settings",
      lead: "Connect your Stripe account to receive card payments on your site."
    }
  ],
  accountViews: [
    {
      id: "settings",
      label: "Settings",
      description: "Identity, password and deletion",
      title: "Account settings",
      lead: "Manage your Hostiv details, password and account deletion."
    },
    {
      id: "plans",
      label: "Plans",
      description: "Subscriptions and payments",
      title: "Plans",
      lead: "View your active plans per property and your Hostiv payment history."
    },
    {
      id: "cohosts",
      label: "Co-hosts",
      description: "Invitations and team access",
      title: "Co-hosts",
      lead: "Invite someone you trust to help manage your site."
    }
  ],
  bookingPricing: [
    {
      id: "night",
      title: "Nightly rate",
      lead: "Base price, guests included and per-night supplement shown on your site."
    },
    {
      id: "week",
      title: "Weekly discount",
      lead: "Discount applied to stays of one week or more."
    },
    {
      id: "month",
      title: "Monthly discount",
      lead: "Discount applied to stays of one month or more."
    }
  ],
  preview: {
    viewports: [
      { id: "desktop", label: "Desktop" },
      { id: "tablet", label: "Tablet" },
      { id: "mobile", label: "Mobile" }
    ]
  },
  validation: {
    selectedTheme: "Selected theme",
    selectedLayout: "Selected layout",
    logo: "Logo",
    brandName: "Display name",
    brandMeta: "Subtitle",
    heroImage: "Background image",
    eyebrow: "Eyebrow",
    title: "Title",
    text: "Text",
    intro: "Introduction",
    visiblePlatform: "At least one visible platform",
    hostPhoto: "Host photo",
    caption: "Caption",
    quote: "Quote",
    introduction: "Introduction",
    featuredSpace: "At least one featured space",
    benefitCard: "At least one benefit card",
    address: "Address",
    neighborhoodLead: "Neighbourhood lead",
    visualCard: "At least one visual card",
    pricingEyebrow: "Eyebrow",
    pricingTitle: "Title",
    pricingIntro: "Introduction",
    amenityCard: "At least one amenity card",
    reviewsBg: "Background image",
    review: "At least one review",
    rulesEyebrow: "Eyebrow",
    rulesTitle: "Title",
    rulesIntro: "Introduction",
    houseRule: "At least one house rule",
    heroImageMain: "Main photo",
    heroHomeTitle: "Homepage title",
    heroIntroText: "Introduction text",
    gallerySectionMin: "At least one section with title, subtitle and 1 photo",
    neighborhoodChapo: "Lead paragraph",
    nightPrice: "Nightly rate",
    includedGuests: "Guests included",
    scheduleOrRule: "Check-in/out times or at least one house rule"
  },
  proUpgrade: {
    close: "Close",
    later: "Later",
    redirecting: "Redirecting…",
    loginRequired: "Sign in to continue.",
    paymentOpenFailed: "Unable to open the payment page."
  },
  proFeatures: {
    "welcome-guide": {
      title: "Welcome guide PDF",
      lead: "To create and download your personalised welcome booklet (print-ready), enable Starter +.",
      starterPlusCta: "Enable Starter + — €{price} / year"
    },
    invoice: {
      title: "PDF invoices",
      lead: "To generate a PDF invoice per direct booking, enable Starter +.",
      starterPlusCta: "Enable Starter + — €{price} / year"
    },
    cohosts: {
      title: "Co-hosts",
      lead: "Invite someone you trust to help manage your site. This feature is not included in Starter alone.",
      optionsIntro: "Two ways to unlock co-hosts:",
      starterPlusOption:
        "Starter + — +€{price} / year on top of Starter: PDF welcome guide, invoices and unlimited co-hosts.",
      proOption:
        "Pro — €{proPrice} / year, all-inclusive: multiple properties, PDF guide, invoices and unlimited co-hosts.",
      starterPlusCta: "Enable Starter + — €{price} / year",
      proCta: "Upgrade to Pro — €{proPrice} / year"
    }
  }
} as const
