import type { PlatformAdminUi } from "./labels.fr"

export const platformAdminUiEn: PlatformAdminUi = {
  shell: {
    title: "Hostiv Admin",
    subtitle: "Platform administration",
    logout: "Sign out",
    refresh: "Refresh",
    loading: "Loading…",
    errorGeneric: "Something went wrong.",
    accessDenied: "Access restricted to Hostiv administrators.",
    notConfigured: "Platform admin not configured (HOSTIV_PLATFORM_ADMIN_EMAILS)."
  },
  header: {
    account: "My account",
    logout: "Sign out",
    refresh: "Refresh",
    platformLabel: "Platform administration",
    logoHome: "Back to Hostiv website"
  },
  common: {
    cancel: "Cancel",
    close: "Close",
    save: "Save",
    saving: "Saving…",
    delete: "Delete",
    edit: "Edit"
  },
  login: {
    title: "Admin sign-in",
    subtitle: "Hostiv team area only",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    checking: "Checking session…"
  },
  dashboard: {
    title: "Overview",
    intro: "Run the Hostiv platform at a glance.",
    hero: {
      members: "Members",
      sites: "Sites",
      activePlans: "Active plans",
      revenue: "Collected revenue",
      revenue30d: "Last 30 days"
    },
    sections: {
      plans: "Plan breakdown",
      activity: "Recent activity",
      bookings: "Direct bookings",
      health: "Attention points"
    },
    recentPayments: "Latest payments",
    noRecentPayments: "No payments recorded yet.",
    estimatedAnnual: "Annual estimate (active plans)",
    vsLastMonth: "vs last month",
    kpi: {
      sites: "Sites",
      published: "Published",
      draft: "Drafts",
      members: "Members",
      activeSubs: "Active plans",
      expiredSubs: "Expired plans",
      unpaidSubs: "Unpaid",
      pendingSignups: "Pending sign-ups",
      reservations: "Bookings",
      gmv: "Booking volume",
      guestReviews: "Guest reviews",
      avgRating: "Average rating",
      estimatedRevenue: "Revenue (est.)",
      stripeConnect: "Stripe Connect",
      newMembers30d: "New members (30 d)",
      newSites30d: "New sites (30 d)",
      starterActive: "Active Starter",
      proActive: "Active Pro",
      starterPlusActive: "Active Starter+",
      publishedRate: "Publication rate",
      connectRate: "Stripe Connect set up"
    },
    health: {
      expired: "Expired plans",
      unpaid: "Unpaid accounts",
      pendingSignups: "Pending sign-ups",
      stripeMissing: "Sites without Stripe",
      drafts: "Draft sites"
    },
    checkoutTypes: {
      hostiv_signup: "Sign-up",
      hostiv_subscription: "Renewal",
      hostiv_premium_tools: "Starter+"
    }
  },
  sites: {
    title: "Sites",
    intro: "All rental sites hosted on Hostiv.",
    searchPlaceholder: "Search by name, slug or email…",
    columns: {
      site: "Site",
      member: "Member",
      plan: "Plan",
      status: "Status",
      subscription: "Subscription",
      reservations: "Bookings",
      reviews: "Reviews",
      stripe: "Stripe",
      created: "Created",
      actions: "Actions"
    },
    published: "Published",
    draft: "Draft",
    active: "Active",
    expired: "Expired",
    unpaid: "Unpaid",
    stripeOk: "Connected",
    stripeMissing: "Not set up",
    openAdmin: "Site admin",
    openSite: "View site",
    deleteSite: "Delete site",
    empty: "No sites found.",
    deleteModal: {
      title: "Delete this site?",
      subtitle: "This action cannot be undone. The following will be removed:",
      items: [
        "Site /{slug} ({brand}) and all its content",
        "Associated files and images",
        "The site’s Stripe Connect account",
        "Booking history stored for this site"
      ],
      confirmLabel: "To confirm, type the site address:",
      confirmation: "Confirmation",
      deleting: "Deleting…",
      confirmCta: "Delete site"
    }
  },
  members: {
    title: "Members",
    intro: "Hostiv accounts and associated plans.",
    searchPlaceholder: "Search by email or name…",
    columns: {
      member: "Member",
      plan: "Plan",
      subscription: "Plan until",
      starterPlus: "Starter+",
      site: "Site",
      registeredAt: "Registration date",
      stripe: "Stripe",
      joined: "Joined",
      actions: "Actions"
    },
    yes: "Yes",
    no: "No",
    noSite: "—",
    empty: "No members found.",
    editMember: "Edit member",
    deleteMember: "Delete member",
    viewMember: "View member profile",
    detailModal: {
      title: "Member profile",
      subtitle: "Account and subscription summary.",
      loadFailed: "Could not load member.",
      sections: {
        identity: "Identity",
        subscription: "Subscription",
        site: "Site",
        timeline: "Key dates"
      },
      fields: {
        name: "Name",
        email: "Email",
        plan: "Plan",
        subscription: "Status",
        paidUntil: "Plan until",
        premiumUntil: "Starter+ until",
        site: "Address",
        siteStatus: "Publication",
        stripe: "Stripe Connect",
        joined: "Registered",
        subscriptionStarted: "Subscribed since"
      }
    },
    deleteModal: {
      title: "Delete this member?",
      subtitle: "This action cannot be undone. The following will be removed:",
      items: [
        "The Hostiv account and backoffice access",
        "The associated site if any",
        "Linked files, images and Stripe Connect data"
      ],
      confirmLabel: "To confirm, type the member’s email:",
      confirmation: "Confirmation",
      deleting: "Deleting…",
      confirmCta: "Delete member"
    },
    editModal: {
      title: "Edit member",
      subtitle: "Update profile and sign-in credentials.",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      newPassword: "New password (optional)",
      confirmPassword: "Confirm password",
      loadFailed: "Could not load member.",
      saveFailed: "Could not save changes.",
      saved: "Member updated.",
      passwordMismatch: "Passwords do not match.",
      passwordInvalid: "Password does not meet all security requirements."
    }
  },
  revenue: {
    title: "Revenue",
    intro: "Hostiv Stripe payment history (sign-ups, renewals and Starter+).",
    summary: {
      total: "Total collected",
      payments: "Payments",
      last30d: "Last 30 days",
      signup: "Sign-ups",
      renewal: "Renewals",
      premiumTools: "Starter+",
      discounts: "Discounts granted",
      promoPayments: "Payments with code"
    },
    columns: {
      date: "Date",
      type: "Type",
      product: "Product",
      member: "Member",
      site: "Site",
      promo: "Promo code",
      amount: "Amount"
    },
    checkoutTypes: {
      hostiv_signup: "Sign-up",
      hostiv_subscription: "Renewal",
      hostiv_premium_tools: "Starter+"
    },
    empty: "No payments recorded yet.",
    historyNote:
      "Amounts shown are net collected. The promo code column shows discounts applied at checkout."
  },
  promoCodes: {
    title: "Promo codes",
    intro: "Create and manage discount codes for Hostiv plan payments.",
    createCta: "New code",
    empty: "No promo codes",
    emptyHint: "Create a code to offer a discount on sign-up or renewal.",
    allEmails: "All emails",
    columns: {
      title: "Title",
      code: "Code",
      discount: "Discount",
      validity: "Validity",
      emails: "Emails",
      status: "Status"
    },
    status: {
      active: "Active",
      upcoming: "Upcoming",
      expired: "Expired",
      unknown: "—"
    },
    fields: {
      title: "Title",
      description: "Description",
      code: "Code",
      generateCodeCta: "Generate",
      validFrom: "Valid from",
      validUntil: "Valid until",
      discountPercent: "Discount (%)",
      allowedEmails: "Allowed emails",
      allowedEmailsHint: "Add * for all emails, or addresses separated by Enter or a comma.",
      allowedEmailsPlaceholder: "e.g. guest@example.com",
      allowedEmailsPlaceholderWildcard: "All emails (*)",
      allowedEmailsInvalid: "Invalid email address.",
      removeEmailTag: "Remove"
    },
    editModal: {
      titleCreate: "New promo code",
      titleEdit: "Edit promo code",
      subtitleCreate: "Set the discount, validity window and allowed emails.",
      subtitleEdit: "Update this promo code’s settings.",
      generatingCode: "Generating…",
      generateFailed: "Unable to generate a promo code.",
      codeRequired: "Enter a promo code.",
      checkingCode: "Checking…",
      codeAvailable: "Code available.",
      codeTaken: "This code is already in use.",
      saveFailed: "Unable to save promo code."
    },
    deleteModal: {
      title: "Delete this promo code?",
      body: "Code",
      confirm: "Delete",
      deleting: "Deleting…"
    },
    pagination: {
      aria: "Promo codes pagination",
      range: "{start}–{end} of {total}",
      page: "Page {page} / {total}",
      prev: "Previous",
      next: "Next"
    }
  },
  reservations: {
    title: "Bookings",
    intro: "Direct bookings across all sites.",
    summary: {
      total: "Total",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      gmv: "Total volume",
      avg: "Average booking",
      last30d: "Last 30 days"
    },
    columns: {
      site: "Site",
      guest: "Guest",
      dates: "Stay",
      amount: "Amount",
      status: "Status",
      created: "Created"
    },
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    empty: "No bookings."
  },
  signups: {
    title: "Sign-ups",
    intro: "Pending or recent sign-ups before/after Stripe payment.",
    columns: {
      contact: "Contact",
      property: "Project",
      plan: "Plan",
      status: "Status",
      created: "Created",
      expires: "Expires"
    },
    status: {
      pending: "Pending",
      completed: "Completed",
      failed: "Failed"
    },
    empty: "No sign-ups."
  },
  guestReviews: {
    title: "Guest reviews",
    intro: "Reviews left by guests after their stay.",
    columns: {
      site: "Site",
      guest: "Guest",
      rating: "Rating",
      stay: "Stay",
      comment: "Comment",
      date: "Date"
    },
    empty: "No reviews."
  },
  alerts: {
    title: "Alerts",
    intro: "Attention points: expirations, Stripe, drafts, sign-ups.",
    empty: "No alerts at the moment.",
    severity: {
      critical: "Critical",
      warning: "Warning",
      info: "Info"
    }
  },
  filters: {
    all: "All",
    active: "Active",
    expired: "Expired",
    published: "Published",
    draft: "Drafts"
  }
}
