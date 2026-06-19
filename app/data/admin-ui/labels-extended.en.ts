export const adminUiLabelsExtendedEn = {
  general: {
    statusKicker: "Status",
    publicationTitle: "Publishing",
    publishedOn: "Published",
    publishedOff: "Draft",
    publishedToggleLabel: "Site published",
    publishedToggleHint:
      "Visible to visitors on the public URL. Stripe Connect must be configured to publish.",
    seoKicker: "Search",
    seoTitle: "SEO",
    seoHint: "Title, description and share image are managed in Customization."
  },
  cohosts: {
    kicker: "Team",
    title: "Co-hosts",
    description:
      "Invite someone you trust to manage the site with you. Co-hosts can use the dashboard except publishing, Stripe and account deletion.",
    emailLabel: "Co-host email",
    emailPlaceholder: "name@example.com",
    inviteCta: "Send invitation",
    inviting: "Sending…",
    membersTitle: "Active co-hosts",
    pendingTitle: "Pending invitations",
    emptyMembers: "No co-hosts yet.",
    emptyPending: "No pending invitations.",
    removeMember: "Remove",
    removeConfirmTitle: "Remove this co-host?",
    removeConfirmMessage: "{email} will no longer have access to this site’s dashboard.",
    removeConfirmCta: "Remove co-host",
    removingMember: "Removing…",
    revokeInvite: "Cancel",
    inviteSent: "Invitation sent.",
    memberRemoved: "Co-host removed.",
    inviteRevoked: "Invitation cancelled.",
    lockedCta: "Unlock co-hosts",
    inviteRequiresPremium: "Co-host invitations require Pro or Starter +.",
    expiresOn: "Expires {date}",
    invitePageChecking: "Checking invitation…",
    invitePageLead: "You’re invited to co-manage {brand} (/{slug}).",
    invitePageEmailHint: "Sign in with {email}.",
    invitePageCreateHint: "No Hostiv account for this address yet. Create one to join the team.",
    invitePageConfirmPassword: "Confirm password",
    invitePageCreateCta: "Create account and accept",
    invitePageCreating: "Creating account…",
    invitePageFirstNameRequired: "Enter your first name.",
    invitePageAcceptCta: "Accept invitation",
    invitePageAccepting: "Accepting…",
    invitePageSignInCta: "Sign in and accept",
    invitePageSigningIn: "Signing in…",
    invitePageInvalidToken: "Invalid invitation link.",
    invitePageVerifyFailed: "Unable to verify this invitation.",
    invitePageAcceptFailed: "Unable to accept the invitation.",
    invitePageSignInFailed: "Unable to sign in.",
    invitePageAlreadyAccepted: "This invitation has already been accepted.",
    invitePageExpired: "This invitation has expired.",
    invitePageInvalid: "Invitation not found or invalid."
  },
  layout: {
    listAria: "Site layouts",
    statusActive: "Selected",
    choose: "Choose"
  },
  appearance: {
    layoutLegend: "Layout",
    layoutHint: "Hero, booking strip and section structure across the whole site.",
    themeLegend: "Ambiance",
    themeHint: "Colors, typography and card styling across the whole site."
  },
  welcomeGuide: {
    lockedTitle: "Welcome guide",
    lockedLead:
      "Create a printable PDF welcome guide for your guests — enable Starter + (€{price}/year) or upgrade to Pro.",
    unlockCta: "Unlock welcome guide"
  },
  publishPaywall: {
    planChangeFailed: "Unable to change plan.",
    loginRequired: "Sign in to pay for your plan.",
    paymentOpenFailed: "Unable to open the payment page.",
    kickerAccess: "Hostiv plan",
    kickerPublish: "Publishing",
    titleAccess: "Renew your plan to access the dashboard",
    titlePublish: "Activate your plan to publish",
    leadAccess:
      "Your annual plan is no longer active. Pay for renewal (12 months, no auto-renewal) to restore the editor.",
    leadPublish:
      "Pay for the annual Hostiv plan to publish (12 months, no auto-renewal).",
    plansLegend: "Choose a plan",
    plansAriaLabel: "Hostiv plan",
    expiredNotice:
      "Your previous period expired on {date} — the site was set back to draft.",
    continueDraft: "Continue as draft",
    paying: "Redirecting…",
    planUpdating: "Updating…",
    payCta: "Pay €{price} / year"
  },
  promoCode: {
    label: "Promo code",
    placeholder: "Enter your code",
    apply: "Apply",
    applying: "Checking…",
    remove: "Remove",
    applied: "Code applied:"
  },
  publishStripe: {
    title: "Unable to publish",
    subtitle:
      "Stripe Connect is not configured or validated yet. Finish setup in Accounting to receive payments and publish your site.",
    openAccounting: "Open Accounting"
  },
  starterPlusSuccess: {
    title: "Starter + enabled",
    subtitle:
      "Your payment is confirmed. You can create your welcome guide PDF and generate invoices for direct bookings.",
    periodLabel: "Starter + period",
    periodRange: "From {start} to {end}",
    openWelcomeGuide: "Open welcome guide"
  },
  subscription: {
    statusExpired: "Expired",
    statusInactive: "Inactive",
    statusStarterPlusActive: "Starter + active",
    statusActive: "Active",
    statusPlatformAdmin: "Active — Hostiv team",
    periodUntil: "Until {date}",
    periodSince: "Since {date}",
    periodRange: "From {start} to {end}",
    periodUnlimited: "Unlimited",
    kicker: "Hostiv subscription",
    platformAdminPriceLabel: "Included",
    platformAdminNote:
      "Hostiv platform admin account: Pro plan active with no time limit and no annual payment.",
    platformAdminRenewalNote: "No renewal required for this account.",
    starterPlusPeriodLabel: "Starter +",
    renewalNote: "Manual renewal · 12 months, no auto-renewal",
    footerExpired: "Plan expired — renew to restore full dashboard access.",
    footerNoPlan: "No active plan — pay the annual Hostiv fee to activate access.",
    footerStarterPlusUpsell:
      "Starter +: welcome guide PDF and booking invoices (+€{price} / {period}).",
    footerStarterPlusActive:
      "Welcome guide PDF and booking invoices active until Starter + ends.",
    starterPlusInsightTitle: "Upgrade your Starter plan",
    starterPlusInsightKicker: "Starter + add-on",
    starterPlusInsightCta: "Enable Starter + — €{price} / {period}"
  },
  guestReviews: {
    loading: "Loading reviews...",
    errors: {
      load: "Unable to load reviews.",
      delete: "Unable to delete this review."
    },
    summary: {
      ariaLabel: "Guest reviews overview",
      averageRating: "Average rating",
      outOfFive: "out of 5",
      totalReviews: "Reviews received",
      withComment: "With a comment",
      withCommentRate: "{percent}% of total",
      latestReview: "Latest review",
      distribution: "Rating breakdown",
      starCount: "{count} reviews",
      starCountOne: "1 review",
      noDate: "—"
    },
    empty: {
      title: "No reviews yet",
      description:
        "Guests receive an email after checkout to leave a review within 7 days."
    },
    sort: {
      label: "Sort by",
      dateDesc: "Newest first",
      dateAsc: "Oldest first",
      ratingDesc: "Highest rating",
      ratingAsc: "Lowest rating"
    },
    count: "{count} review",
    countPlural: "{count} reviews",
    paginationRange: "{start}–{end} of {total}",
    paginationPage: "Page {page} / {total}",
    paginationAria: "Reviews pagination",
    paginationPrev: "Previous",
    paginationNext: "Next",
    stayDates: "Stay: {dates}",
    deleteConfirmTitle: "Delete this review?",
    deleteConfirmBody: "This action cannot be undone.",
    addVerbatim: "Add to reviews",
    addVerbatimAlready: "Already added",
    addVerbatimDisabled: "Empty comment — this review cannot be added as a verbatim."
  },
  reservations: {
    status: {
      all: "All statuses",
      upcoming: "Upcoming",
      past: "Past",
      cancelled: "Cancelled"
    },
    calendar: {
      loading: "Loading...",
      refresh: "Refresh",
      otherCalendars: "Other calendars",
      icsExportLink: "ICS export link",
      externalCalendar: "External calendar",
      loadingList: "Loading reservations...",
      manualBlockHint:
        "Click an available date to block it manually, or click a manual block to reopen it.",
      clickToBlock: "Click to block this date",
      clickToUnblock: "Click to unblock this date",
      manualBlockSource: "Manual block",
      hostivReservationSource: "Hostiv booking"
    },
    errors: {
      invoicePdf: "Unable to generate PDF invoice.",
      delete: "Unable to delete.",
      icsLoad: "Unable to load ICS calendars.",
      listLoad: "Unable to load reservations.",
      icsUrl: "Unable to generate ICS link.",
      manualBlock: "Unable to save the manual block."
    },
    empty: {
      title: "No reservations yet",
      description:
        "Confirmed bookings on your site will appear here once a guest completes their stay."
    },
    noMatch: {
      title: "No matching reservations",
      description: "Change dates or statuses, or reset filters to show all."
    },
    filters: {
      stayPeriod: "Stay period",
      allDates: "All dates",
      reset: "Reset"
    },
    plurals: {
      night: "night",
      nights: "nights",
      adult: "adult",
      adults: "adults",
      child: "child",
      children: "children",
      baby: "baby",
      babies: "babies",
      reservation: "reservation",
      reservations: "reservations"
    },
    countAll: "{count} reservation",
    countAllPlural: "{count} reservations",
    countFiltered: "{visible} of {total} reservation",
    countFilteredPlural: "{visible} of {total} reservations",
    paginationRange: "{start}–{end} of {total}",
    paginationPage: "Page {page} / {total}",
    paginationAria: "Reservations pagination",
    paginationPrev: "Previous",
    paginationNext: "Next",
    actions: {
      invoiceGenerating: "Generating invoice…",
      invoiceDownload: "Download PDF invoice",
      edit: "Edit reservation",
      delete: "Delete reservation"
    },
    deleteConfirm: {
      title: "Delete reservation",
      message: "Permanently delete {guest}'s reservation?\n\nThis action cannot be undone.",
      confirm: "Delete"
    },
    guestFallback: "this guest"
  },
  reservationModal: {
    kicker: "Reservation details",
    refunded: "Refunded",
    confirmedOn: "Confirmed on {date}",
    fields: {
      arrival: "Check-in",
      departure: "Check-out",
      adults: "Adults",
      children: "Children",
      babies: "Babies",
      amount: "Amount (€)",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      status: "Status",
      message: "Guest message"
    },
    hints: {
      invalidDates: "Invalid dates",
      night: "night",
      nights: "nights",
      person: "guest",
      persons: "guests",
      refundRecorded: "Stripe refund recorded"
    },
    statusOptions: {
      confirmed: "Confirmed",
      cancelled: "Cancelled"
    },
    actions: {
      markCancelled: "Mark as cancelled",
      refund: "Refund guest (Stripe)",
      refunding: "Refunding…",
      delete: "Delete",
      deleting: "Deleting…"
    },
    messages: {
      saved: "Reservation saved.",
      saveFailed: "Unable to save.",
      deleteFailed: "Unable to delete.",
      refundSuccess: "Refund processed. The guest will be credited within a few business days.",
      refundFailed: "Unable to refund."
    },
    confirm: {
      cancelTitle: "Mark as cancelled",
      cancelMessage:
        "Mark {guest}'s reservation as cancelled?\n\nNo refund will be processed automatically.",
      cancelConfirm: "Mark cancelled",
      deleteTitle: "Delete reservation",
      deleteMessage:
        "Permanently delete {guest}'s reservation?\n\nThis action cannot be undone.",
      deleteConfirm: "Delete",
      refundTitle: "Refund guest",
      refundMessage:
        "Refund {amount} to {guest} via Stripe?\n\nThe reservation will be marked as cancelled.",
      refundConfirm: "Refund"
    }
  },
  reservationsIcs: {
    title: "Reservations ICS link",
    subtitle: "Sync direct bookings from your site to Airbnb, Booking or Vrbo.",
    generating: "Generating link…",
    urlLabel: "ICS URL",
    hint:
      "Paste this link in the « import calendar » section of your external platform. Confirmed bookings and manual admin blocks are included.",
    rotateHint:
      "If this link was shared by mistake, regenerate it — the old link will stop working immediately.",
    rotateCta: "Regenerate link",
    rotating: "Regenerating…",
    copied: "Copied",
    copyCta: "Copy link"
  },
  dateRange: {
    defaultLabel: "Period",
    emptySummary: "All dates",
    dayOne: "1 day",
    days: "{count} days",
    headTitle: "Select a period",
    headHint: "Choose a start date, then an end date.",
    clear: "Clear",
    start: "Start",
    end: "End"
  },
  stripeConnect: {
    loading: "Loading Stripe status…",
    alerts: {
      connectModeMismatch:
        "Your Stripe Connect account was created in test mode. Live keys cannot use it: click « Connect my Stripe account » to complete onboarding in live mode.",
      testKeysWarning:
        "Server Stripe keys are still in test mode (sk_test_). On Vercel, use STRIPE_SECRET_KEY and NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY with sk_live_ / pk_live_, then redeploy.",
      paymentsBlocked:
        "Guests cannot pay by card until Stripe has validated your account."
    },
    status: {
      notConfigured: "Not configured",
      paymentsActive: "Payments active",
      verificationPending: "Verification in progress",
      setupIncomplete: "Setup incomplete"
    },
    progressLabel: "Setup progress",
    readyNote:
      "Your account is operational. Direct booking payments are paid out to your bank account via Stripe.",
    steps: {
      account: "Stripe account created",
      identity: "Identity submitted to Stripe",
      charges: "Card payments enabled",
      payouts: "Bank payouts enabled"
    },
    meta: {
      platformFee: "Platform fee",
      platformFeeValue: "{percent}% per booking",
      activatedOn: "Activated on"
    },
    cta: {
      connect: "Connect my Stripe account",
      resume: "Resume Stripe setup",
      dashboard: "Stripe dashboard"
    },
    requirements: {
      title: "Information requested by Stripe",
      accountRestricted: "Restricted account"
    }
  },
  accounting: {
    refresh: "Refresh",
    paymentsNav: {
      verifying: "Checking…",
      paymentsActive: "Card payments active",
      setupIncomplete: "Setup incomplete",
      stripeConnect: "Stripe Connect"
    },
    stripeErrors: {
      load: "Unable to load Stripe status.",
      onboard: "Unable to open Stripe onboarding.",
      dashboard: "Unable to open Stripe dashboard."
    },
    stripeReturn: {
      returnPending: "Returned from Stripe. Refreshing status…",
      refreshPending: "Resuming Stripe setup…",
      ready: "Your account is ready to receive payments.",
      incomplete: "Setup saved. Complete any remaining steps in Stripe if needed."
    },
    pricingTabsAria: "Pricing"
  },
  revenue: {
    periodLabel: "Analysis period",
    presets: {
      lastMonth: "Last month",
      lastSixMonths: "Last 6 months"
    },
    errors: {
      load: "Unable to load revenue."
    },
    loading: "Loading revenue…",
    stats: {
      totalGross: "Total collected",
      monthlyAverage: "Monthly average",
      netEstimated: "Estimated net",
      onPeriod: "in period",
      monthsShown: "Over {count} month(s) shown",
      afterCommission: "After {percent}% commission",
      commissionNotConfigured: "Platform commission not configured"
    },
    reservationCount: "{count} reservation",
    reservationCountPlural: "{count} reservations",
    monthNet: "Estimated net {amount}",
    summaryAria: "Revenue summary",
    empty: {
      title: "No revenue in this period",
      description:
        "Widen the date range or wait for a new confirmed and paid direct booking."
    }
  },
  bookingTabs: {
    night: "Nightly",
    week: "Weekly",
    month: "Monthly"
  },
  bookingConfig: {
    pricingAria: "Pricing",
    baseKicker: "Base rate",
    longStayKicker: "Long-stay discount",
    nightPrice: "Nightly rate (€)",
    includedGuests: "Guests included",
    extraGuest: "Extra guest / night (€)",
    enableDiscount: "Enable discount",
    minNights: "Minimum nights",
    discountPercent: "Discount (%)"
  },
  cancellation: {
    kicker: "Terms",
    title: "Cancellation policy",
    lead:
      "Shown below rates on your site and in the booking modal. Set refund to 0% to hide it.",
    fields: {
      refundPercent: "Refund (%)",
      refundHint: "Share of the amount refunded if cancelled early enough.",
      daysBefore: "Minimum notice (days)",
      daysHint: "Number of days before check-in (inclusive)."
    },
    previewLabel: "Site preview",
    previewHidden: "Hidden on site while refund is 0%.",
    policyFull: "Full refund if cancelled at least {days} before check-in.",
    policyPartial: "{percent}% refund if cancelled at least {days} before check-in.",
    dayOne: "1 day",
    dayMany: "{count} days"
  },
  pricingPreview: {
    label: "Preview",
    ariaLabel: "Rates section preview",
    fallback: {
      eyebrow: "Eyebrow",
      title: "Section title",
      intro: "Rates section introduction."
    }
  },
  seoKeywords: {
    pillAria: "SEO keywords language",
    frLabel: "Keywords (French)",
    enLabel: "Keywords (English)",
    label: "Keywords",
    chipsAria: "Added keywords",
    removeChip: "Remove {keyword}",
    placeholder: {
      add: "Add a keyword…",
      limit: "Limit reached",
      empty: "Enter a keyword, then comma or Enter"
    },
    hint: "Add up to {max} keywords. Comma or Enter to confirm. {remaining} remaining.",
    suggestionsLabel: "Suggestions",
    limitModal: {
      title: "Keyword limit reached",
      subtitle: "You can save at most {max} keywords. Remove one to add another.",
      understood: "Got it"
    }
  },
  customization: {
    blockStatus: {
      complete: "Section complete",
      incomplete: "Section to complete"
    },
    fields: {
      logo: "Logo",
      title: "Title",
      subtitle: "Subtitle",
      heroImage: "Background image",
      eyebrow: "Eyebrow",
      text: "Text",
      hostPhoto: "Host photo",
      reviewsBg: "Background image",
      checkInOut: "Check-in & check-out"
    },
    bookingNotice:
      "Rate settings (nightly price, discounts, guests included) are in the",
    bookingNoticeAccounting: "Accounting",
    openAccounting: "Open Accounting"
  },
  location: {
    geocodeAddressTooShort: "Enter a full address (at least 5 characters).",
    geocodeAuthRequired: "Sign in required to look up the address.",
    geocodeLoading: "Looking up location…",
    geocodeSuccess: "Location and area updated automatically.",
    geocodeFailed: "Unable to locate this address.",
    addressLabel: "Address",
    addressHint:
      "The public site map position and area are calculated automatically from this address.",
    leadLabel: "Lead paragraph"
  },
  imageUpload: {
    ariaUploading: "Uploading {label}",
    ariaReplace: "Replace {label}",
    uploading: "Uploading…",
    choose: "Choose",
    chooseImage: "Choose an image",
    uploadFailed: "Upload failed."
  },
  fieldTranslate: {
    aria: "Translate this field",
    empty: "Nothing to translate.",
    error: "Translation failed."
  },
  liveEditor: {
    modeLabel: "Visual editor",
    toolbarNoteWelcomeGuide: "Live guide preview · changes visible within seconds",
    toolbarNoteCustomization: "Instant preview · save to publish",
    siteLocalePillAria: "Site language to customize",
    welcomeGuideLocalePillAria: "Welcome guide language to customize",
    galleryLocalePillAria: "Gallery language to customize",
    toggleHide: "Hide preview",
    toggleShow: "Show preview"
  },
  livePreview: {
    badge: "Live preview",
    hint: "Changes visible without saving · scroll the preview to browse the page",
    dimensionsFull: "{width}px · 100%",
    dimensionsScaled: "{width}px · {percent}% (fitted to panel)",
    viewportTabsAria: "Screen size",
    iframeTitle: "Site preview"
  },
  account: {
    settingsTitle: "Account settings",
    settingsSubtitle:
      "Manage your Hostiv details, password and account deletion. Booking requests are sent to this account email.",
    pageTitle: "Account — {name}",
    pageBack: "Back to dashboard",
    deleteSlugMismatch: "Type exactly « {slug} » to confirm.",
    deleteFailed: "Unable to delete account.",
    loading: "Loading…",
    loadFailed: "Unable to load your account.",
    identityTitle: "Identity",
    identityLead: "These details are linked to your Hostiv account (dashboard login).",
    passwordTitle: "Password",
    passwordLead: "Leave blank to keep your current password.",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    saveAccount: "Save account",
    dangerTitle: "Danger zone",
    dangerLead:
      "Deleting your account permanently removes your site, data and Hostiv access.",
    deleteAccount: "Delete my account…",
    errors: {
      passwordInvalid: "Choose a password that meets all security requirements.",
      passwordMismatch: "The two passwords do not match.",
      passwordConfirmEmpty: "Enter the new password or clear the confirmation field.",
      saveFailed: "Unable to save changes."
    },
    success: {
      updated: "Account updated.",
      emailChanged:
        "Account updated. If you changed email, use the new address to sign in."
    },
    passwordRules: {
      intro:
        "Your password must be long and complex enough, including letters (upper and lower case), numbers, punctuation and special characters:",
      length: "At least {min} characters",
      lowercase: "One lowercase letter",
      uppercase: "One uppercase letter",
      digit: "One digit",
      special: "One special or punctuation character"
    },
    fields: {
      firstName: "First name",
      lastName: "Last name",
      email: "Email"
    },
    plans: {
      loading: "Loading plans…",
      loadFailed: "Unable to load your plans.",
      propertiesTitle: "Plans per property",
      propertiesLead:
        "Each property has its own annual Hostiv plan. Active dates and options are shown below.",
      currentPropertyBadge: "Current site",
      unpublishedBadge: "Unpublished",
      paymentsTitle: "Payment history",
      paymentsLead: "Stripe payments recorded on your Hostiv account (last 50).",
      paymentsEmpty: "No payments recorded yet.",
      paymentsDate: "Date",
      paymentsProduct: "Product",
      paymentsProperty: "Property",
      paymentsAmount: "Amount",
      checkoutTypes: {
        hostiv_signup: "Signup",
        hostiv_subscription: "Annual plan",
        hostiv_premium_tools: "Starter+"
      }
    },
    deleteModal: {
      title: "Permanently delete your account?",
      subtitle: "This action cannot be undone. The following will be deleted:",
      items: [
        "Your Hostiv account and dashboard access",
        "Your /{slug} site and all its content",
        "Associated files and images",
        "Your Stripe Connect account",
        "Booking history recorded on this site",
        "Co-host access to this site (and their Hostiv accounts if they have no other site)"
      ],
      confirmLabel: "To confirm, enter your site address:",
      confirmation: "Confirmation",
      deleting: "Deleting…",
      confirmCta: "Delete my account"
    }
  },
  onboardingFields: {
    examplesLabel: "Examples:",
    layoutLegend: "Layout",
    themeLegend: "Ambiance",
    labels: {
      logo: "Logo",
      brandName: "Display name",
      brandMeta: "Subtitle",
      heroPhoto: "Main photo",
      heroEyebrow: "Eyebrow",
      heroTitle: "Homepage title",
      heroText: "Introduction text",
      hostPhoto: "Host photo",
      hostCaption: "Photo caption",
      hostTitle: "Title",
      hostQuote: "Quote",
      hostIntro: "Intro 1",
      nightPrice: "Nightly rate (€)",
      includedGuests: "Guests included"
    },
    includedGuestsHint: "Number of guests covered by the base rate.",
    examples: {
      brandName: ["The Grand Apartment", "Lilac House"],
      logo: ["Horizontal logo on light background", "PNG or SVG with transparent background preferred"],
      brandMeta: ["Le Chesnay · Versailles", "Family apartment · 10 min from centre"],
      heroPhoto: [
        "Bright living room from the entrance",
        "Facade or most representative room of the property"
      ],
      heroEyebrow: ["Entire apartment · Le Chesnay", "Holiday home · 10 min from the sea"],
      heroTitle: [
        "Stay peacefully without compromising on comfort",
        "A family base, steps from the city centre"
      ],
      heroText: [
        "A charming apartment with self check-in, close to shops and transport.",
        "54 m², 4 guests, workspace and family-friendly amenities."
      ],
      hostPhoto: [
        "Portrait in context, looking at camera",
        "Natural photo, smiling, in the property or at the entrance"
      ],
      hostCaption: ["Sophie · your host", "Marc & Julie · your hosts"],
      hostTitle: [
        "A family home we care deeply about",
        "A property we open with care, season after season"
      ],
      hostQuote: [
        "A former home we open with care — so you feel expected.",
        "We love welcoming curious travellers, not just passing visitors."
      ],
      hostIntro: [
        "I personally handle check-in and stay available during your stay to answer questions.",
        "We live nearby: self check-in in the evening, neighbourhood tips the next day if needed."
      ],
      nightPrice: ["€95 / night", "€120 in high season"],
      includedGuests: ["2 guests", "4 guests (family)"]
    }
  },
  template: {
    ariaSelected: "Site theme: {name}",
    listAria: "Choose a theme",
    statusActive: "Active",
    choose: "Choose"
  },
  fieldHelp: {
    ariaOne: "Example: {example}",
    ariaMany: "Examples: {examples}",
    tooltipLabel: "Examples"
  }
} as const
