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
    title: "Set up Stripe Connect to get paid for direct bookings",
    description:
      "Steps to connect your Stripe account, enable payments and receive payouts to your host account.",
    seoTitle: "Set up Stripe Connect | Hostiv guide",
    seoDescription:
      "Connect Stripe Connect to Hostiv: onboarding, identity verification, guest payments and payouts.",
    publishedAt: "2026-06-05",
    readingMinutes: 7,
    sections: [
      {
        title: "Why Stripe Connect?",
        paragraphs: [
          "Hostiv does not touch the stay amount: guest payments are processed by Stripe and paid to your Connect account. You remain the merchant of record.",
          "Stripe handles PCI compliance and bank payouts — you do not need to build payment infrastructure yourself."
        ],
      },
      {
        title: "Create or connect an account",
        paragraphs: [
          "From Hostiv admin, start Stripe Connect onboarding. You can create a new account or link an existing Stripe account.",
          "Have ID, bank details and — depending on status — business registration ready. Onboarding usually takes 10–20 minutes."
        ],
        list: [
          "Individual account: renting in your own name",
          "Business account: if already registered",
          "Same Stripe account can be used for other activities if needed"
        ]
      },
      {
        title: "Enable payments on your site",
        paragraphs: [
          "Once Stripe is verified, guests can pay by card when booking. Hostiv shows a stay recap before payment.",
          "Stripe card fees apply per transaction, as with any online payment. Hostiv charges no commission on the stay amount."
        ],
      },
      {
        title: "Track your payouts",
        paragraphs: [
          "Payments appear in your Stripe dashboard. Bank payouts follow Stripe’s schedule (often a few business days depending on country).",
          "For disputes or refunds, handle them in Stripe or Hostiv admin according to your cancellation policy."
        ],
      }
    ]
  },
  "choisir-template-site": {
    id: "choisir-template-site",
    title: "Choose the right template for your rental website",
    description:
      "Riviera, Classic or Earth & linen: how to pick a design that fits your property and guests.",
    seoTitle: "Choose a Hostiv template | Design guide",
    seoDescription:
      "Compare Hostiv templates for your direct booking site: style, conversion and customization.",
    publishedAt: "2026-06-04",
    readingMinutes: 6,
    sections: [
      {
        title: "The template sets the tone",
        paragraphs: [
          "Your template defines first impression: colours, typography, hero and gallery layout. Hostiv offers several ready-made styles — same booking engine, different visual identity.",
          "Choose based on property and audience: clean and reassuring for business travellers, warm for holiday homes, premium for high-end stays."
        ],
      },
      {
        title: "Compare the three styles",
        paragraphs: [
          "Spend 10 minutes previewing each template with your own photos. The right choice highlights your main asset in the first second."
        ],
        list: [
          "Riviera: gradients, upscale feel, ideal for villas or sea views",
          "Classic: light background, red accents, readable and conversion-focused",
          "Earth & linen: beige and terracotta, perfect for character homes"
        ],
      },
      {
        title: "Customize without starting over",
        paragraphs: [
          "After picking a template, adjust colours, copy, logo and photos. Hostiv’s editor previews live so you see the guest view before publishing.",
          "The Pro plan unlocks multi-property support, PDF guide, invoices and co-hosts — ideal if you manage several properties or a team."
        ],
      },
      {
        title: "Test on mobile",
        paragraphs: [
          "A large share of bookings happen on smartphones. Check mobile preview before sharing your link.",
          "If a hero photo lacks impact on small screens, crop or pick a more readable image — often the #1 conversion lever."
        ],
      }
    ]
  },
  "optimiser-fiche-logement": {
    id: "optimiser-fiche-logement",
    title: "Optimize your property listing on your direct site",
    description:
      "Photos, copy, amenities and house rules: best practices to build trust and fill the calendar.",
    seoTitle: "Optimize your listing | Hostiv guide",
    seoDescription:
      "Improve photos, description, amenities and rules on your Hostiv site to convert more visitors into bookings.",
    publishedAt: "2026-06-03",
    readingMinutes: 8,
    sections: [
      {
        title: "The hero photo does 80% of the work",
        paragraphs: [
          "Pick a bright landscape image showing the main asset: view, living room, pool or facade. Avoid blurry or dark shots.",
          "Complete with an ordered gallery: living areas, bedrooms, bathroom, outdoor space. Reuse your best OTA photos if quality is good."
        ],
      },
      {
        title: "Write copy that converts",
        paragraphs: [
          "Structure in three parts: hook (why your place), details (spaces, capacity, key amenities), neighbourhood (shops, beach, transport).",
          "Be specific: “140 cm sofa bed” beats “comfortable sofa”. Adapt your OTA tone for direct booking."
        ],
        list: [
          "Exact capacity and bedroom layout",
          "Differentiating amenities (parking, A/C, fibre wifi…)",
          "Walking or driving distance to highlights"
        ]
      },
      {
        title: "Amenities and house rules",
        paragraphs: [
          "Tick every amenity actually available — guests mentally filter by needs (cot, washing machine, BBQ…).",
          "Clear rules reduce friction: check-in/out times, parties, pets, smoking. Better to lose an incompatible booking than manage conflict on site."
        ],
      },
      {
        title: "SEO and keywords",
        paragraphs: [
          "In Hostiv admin, set title and meta description for Google: property type + city + “direct booking” works well.",
          "Example: “Pool villa in Nice — direct booking”. Avoid keyword stuffing — one natural sentence is enough."
        ],
      }
    ]
  },
  "convertir-visiteurs": {
    id: "convertir-visiteurs",
    title: "Convert your site visitors into bookings",
    description:
      "Journey, social proof, clear pricing and CTAs: levers to go from click to confirmed stay.",
    seoTitle: "Convert site visitors | Hostiv guide",
    seoDescription:
      "Increase conversion on your Hostiv site: clear journey, reviews, pricing and booking buttons.",
    publishedAt: "2026-06-02",
    readingMinutes: 7,
    sections: [
      {
        title: "Reduce friction",
        paragraphs: [
          "Every extra step drops conversion. Your Hostiv site already combines showcase, calendar and payment — make sure the “Book” button is visible in the hero.",
          "Ensure unavailable dates are greyed out and total price shows before payment: no checkout surprises."
        ],
      },
      {
        title: "Social proof",
        paragraphs: [
          "Display guest reviews (including post-stay collected ones). Even a few authentic testimonials reassure like a long OTA history.",
          "If you are starting out, be transparent with a small direct-booking perk to trigger the first stay."
        ],
        list: [
          "Reviews with first name and context (“family of 4, August 2025”)",
          "Average rating when you have several",
          "Host replies to reviews — shows responsiveness"
        ]
      },
      {
        title: "Readable pricing",
        paragraphs: [
          "Show nightly rate, cleaning fee and tourist tax if applicable. Direct guests often compare with OTAs — transparency removes doubt.",
          "You can match OTA pricing and highlight no platform service fees rather than aggressive discounts."
        ],
      },
      {
        title: "Follow up without spamming",
        paragraphs: [
          "If a guest contacts you on an OTA then hesitates, offer the direct link once with up-to-date availability. No spam — one useful message at the right time.",
          "Analyse drop-offs: full dates, high price or missing info? Adjust accordingly."
        ],
      }
    ]
  },
  "comparer-starter-pro": {
    id: "comparer-starter-pro",
    title: "Starter or Pro: which Hostiv plan to choose?",
    description:
      "Compare features, price and use cases between €49 and €99 per year.",
    seoTitle: "Starter vs Pro | Hostiv plan comparison",
    seoDescription:
      "Hostiv Starter or Pro? Compare price, features, welcome guide PDF, invoices, co-hosts and multi-property support.",
    publishedAt: "2026-05-28",
    readingMinutes: 6,
    sections: [
      {
        title: "What’s the same",
        paragraphs: [
          "Starter and Pro both include essentials: direct booking site, Stripe payments, iCal sync, gallery, reservation admin and 0% Hostiv commission on your nights.",
          "Pro adds multi-property support and advanced tools (PDF guide, invoices, co-hosts). On Starter, the Starter + add-on (+€30/year) unlocks those tools for one property."
        ],
      },
      {
        title: "Starter plan — €49/year",
        paragraphs: [
          "Ideal to launch a first direct site quickly without a large budget. Everything you need to publish, sync and get paid."
        ],
        list: [
          "1 property",
          "Booking and Stripe payment",
          "iCal import / export",
          "Gallery and reservation management"
        ]
      },
      {
        title: "Pro plan — €99/year",
        paragraphs: [
          "Recommended if you manage multiple properties or want PDF guide, invoices and co-hosts included. Each additional property requires a Pro subscription."
        ],
        list: [
          "Everything in Starter",
          "Multiple properties",
          "Customizable welcome guide PDF",
          "PDF invoices",
          "Unlimited co-hosts"
        ],
      },
      {
        title: "How to decide?",
        paragraphs: [
          "Choose Starter if you are testing direct for the first time on one property. Enable Starter + if you want PDF guide, invoices and co-hosts without going Pro. Choose Pro for multi-property or all-inclusive from day one.",
          "You can start on Starter and upgrade — publishing early and connecting calendars matters most."
        ],
      }
    ]
  },
  "premiere-reservation-directe": {
    id: "premiere-reservation-directe",
    title: "Get your first direct booking on Hostiv",
    description:
      "From publishing to confirmation email: the full flow to validate everything works.",
    seoTitle: "First direct booking | Hostiv guide",
    seoDescription:
      "Publish, test and receive your first Hostiv booking: Stripe, calendar, guest confirmation.",
    publishedAt: "2026-05-25",
    readingMinutes: 7,
    sections: [
      {
        title: "Pre-launch checklist",
        paragraphs: [
          "Before sharing your link, verify: site published, Stripe Connect active, at least one iCal import, photos and rates up to date.",
          "Walk through the flow yourself: pick dates, guest form, test payment if Stripe allows test mode."
        ],
        list: [
          "Site live with memorable slug",
          "Stripe Connect verified (charges enabled)",
          "iCal import from your OTAs",
          "Hostiv iCal export pasted on each platform"
        ],
      },
      {
        title: "Share the link at the right time",
        paragraphs: [
          "Your first direct booking often comes from an existing contact: returning guest, referral or OTA message reply.",
          "Send the link with available dates and a reassuring message about secure payment."
        ],
      },
      {
        title: "On booking day",
        paragraphs: [
          "When a guest books, you get a notification. The date blocks on Hostiv and should flow to OTAs via iCal export within a few hours.",
          "The guest receives email confirmation. Prepare your welcome message with arrival instructions."
        ],
      },
      {
        title: "After the stay",
        paragraphs: [
          "Ask for a review to enrich your site. Note where the booking came from to repeat that channel.",
          "If all went well, suggest direct for future stays — loyalty is the most profitable channel."
        ],
      }
    ]
  },
  "factures-pdf": {
    id: "factures-pdf",
    title: "Create PDF invoices for your direct bookings",
    description:
      "Pro feature (and Starter+ add-on): generate clear invoices for guests and your accounting.",
    seoTitle: "Booking invoice PDF | Hostiv Pro guide",
    seoDescription:
      "Generate PDF invoices for each Hostiv direct booking — Pro plan or Starter+ module.",
    publishedAt: "2026-05-22",
    readingMinutes: 5,
    sections: [
      {
        title: "Why a PDF invoice?",
        paragraphs: [
          "Business travellers or long stays sometimes need an invoice in their company name. Individuals also appreciate a clear recap.",
          "With Hostiv Pro you generate a PDF invoice linked to the booking — no re-entering amounts in a spreadsheet."
        ],
      },
      {
        title: "What the invoice includes",
        paragraphs: [
          "The invoice reflects booking data: dates, stay amount, extra fees if configured, host and guest details.",
          "Verify your legal details in admin before the first issue (name, address, ID if applicable)."
        ],
        list: [
          "Stay dates and number of nights",
          "Total paid via Stripe",
          "Your host contact details",
          "Booking reference"
        ]
      },
      {
        title: "When to send it",
        paragraphs: [
          "Send after payment confirmation or after the stay, depending on your process. Businesses may request an invoice before payment — handle that upfront.",
          "Keep a copy for accounting; the Hostiv PDF complements Stripe exports."
        ],
      },
      {
        title: "Starter+ or Pro?",
        paragraphs: [
          "PDF invoices are included in Pro. The Starter+ module adds them to Starter if you do not need the full Pro pack yet.",
          "If you often invoice business stays, Pro is usually the best value."
        ],
      }
    ]
  },
  "guide-accueil-voyageurs": {
    id: "guide-accueil-voyageurs",
    title: "Create a welcome guide PDF for your guests",
    description:
      "Wi-Fi, access codes, local tips: centralize essentials in a printable PDF (Pro).",
    seoTitle: "Welcome guide PDF | Hostiv Pro guide",
    seoDescription:
      "Create a customized welcome guide PDF for your Hostiv guests — codes, wifi, rules and local picks.",
    publishedAt: "2026-05-20",
    readingMinutes: 6,
    sections: [
      {
        title: "The guide that replaces 10 messages",
        paragraphs: [
          "After booking, guests often ask the same questions: key box code, wifi, bins, nearest bakery… A welcome PDF gathers everything.",
          "Hostiv Pro lets you generate a customized PDF from your content — ready to print or email."
        ],
      },
      {
        title: "What to include",
        paragraphs: [
          "Structure by theme for quick reading on phone or paper."
        ],
        list: [
          "Access: exact address, parking, entry code, key box",
          "Wifi: network name and password",
          "Rules: smoking, pets, quiet hours",
          "Appliances: boiler, washing machine, recycling",
          "Local: shops, restaurants, emergencies"
        ]
      },
      {
        title: "When to send it",
        paragraphs: [
          "Send 2–3 days before arrival with a personalized welcome. Split “practical info” and “access codes” if you prefer not to share codes too early.",
          "Leave a printed copy on site for guests who do not open email on holiday."
        ],
      },
      {
        title: "Keep it updated",
        paragraphs: [
          "Wifi password change, new favourite restaurant, building works: update the guide whenever something changes.",
          "An outdated guide frustrates more than no guide — review it each season."
        ],
      }
    ]
  }
}
