import type {
  HostivResourceArticle,
  HostivResourceArticleId,
  HostivResourcesIndexContent
} from "./hostiv-resources.types"

export const hostivResourcesIndex: HostivResourcesIndexContent = {
  eyebrow: "Host guides",
  title: "Resources to go direct",
    intro:
    "11 practical guides to launch your direct booking website, set up Stripe, sync calendars and convert more visitors.",
  seoTitle: "Hostiv resources | Vacation rental website guides",
  seoDescription:
    "Guides to create and promote your holiday rental website: direct booking, iCal sync, Stripe and conversion with no platform commission.",
  readMoreLabel: "Read guide",
  backToIndexLabel: "← All guides",
  readingTimeLabel: "min read"
}

export const hostivResourceArticles: Record<HostivResourceArticleId, HostivResourceArticle> = {
  "passer-au-direct": {
    id: "passer-au-direct",
    title: "How to add direct booking without leaving OTAs",
    description:
      "A practical strategy to launch a direct channel while keeping Airbnb, Booking or Vrbo for visibility.",
    seoTitle: "Go direct booking | Hostiv guide",
    seoDescription:
      "Steps to launch a direct booking website: positioning, calendar sync, Stripe payments and promotion without dropping OTAs.",
    publishedAt: "2026-05-01",
    readingMinutes: 11,
    sections: [
      {
        title: "Why add direct to your mix",
        paragraphs: [
          "Platforms are still useful for visibility, but their commission shrinks your margin on every night. A direct booking website lets you convert guests already interested in your property — without paying ~15–20% per stay.",
          "Hostiv is not a marketplace: it is your site, your calendar and your Stripe payouts. You keep control of pricing, terms and guest relationships.",
          "Direct is not all-or-nothing. Most successful hosts combine OTA visibility with an official channel — every direct stay improves your net result, even at low volume."
        ],
      },
      {
        title: "Who is direct booking for?",
        paragraphs: [
          "Direct works especially well if you already have OTA reviews, quality photos and fast response times. Even a few direct stays per year improve your annual margin.",
          "If guests already ask “do you have a website?” or “can you send me the link?”, you have latent demand ready to capture."
        ],
        list: [
          "Hosts with a well-rated Airbnb or Booking listing",
          "Owners who get repeat enquiries",
          "Properties with a strong identity (view, decor, location)",
          "Hosts who want control over cancellation terms and guest relationships"
        ],
      },
      {
        title: "Four pillars of a successful launch",
        paragraphs: [
          "Before driving traffic to your site, make sure these four foundations are in place. They separate a “nice link” from a channel that actually converts.",
          "Do not promote until Stripe payments and calendar sync are live — a guest blocked on a date or payment is a lost booking."
        ],
        list: [
          "A clear site with photos, amenities and up-to-date availability",
          "A synced calendar (iCal) to prevent double bookings",
          "Secure online payment via Stripe Connect",
          "A “Book direct” link in your bio, messages and social profiles"
        ],
      },
      {
        title: "Combine OTAs and direct without conflict",
        paragraphs: [
          "Keep active listings on Airbnb, Booking or Vrbo to stay visible in search. Use those channels as showcase and funnel, not your only point of sale.",
          "In conversations with interested guests, naturally offer your official website: same photos, same availability, secure payment. You are not bypassing the platform at the guest’s expense — you offer a transparent direct channel."
        ],
      },
      {
        title: "A 30-day launch plan",
        paragraphs: [
          "Week 1: publish your Hostiv site, connect Stripe and import OTA calendars. Check that a test booking or iCal import correctly blocks dates on your site.",
          "Week 2: add the direct link to your listing, host profile and reply templates.",
          "Weeks 3–4: track bookings, refine photos and copy, test a small direct incentive (free cleaning fee, flexible arrival…).",
          "Realistic goal: 1–3 direct bookings in the first 60 days is a solid start. Volume grows with consistent promotion."
        ],
      },
      {
        title: "Common mistakes to avoid",
        paragraphs: [
          "Do not drop OTA listings overnight — direct grows gradually. Do not leave your direct calendar out of sync — one double booking can cost trust and compensation.",
          "Do not underestimate trust: a polished site, reviews (even referenced from OTAs) and clear terms reassure guests.",
          "Do not set incoherent direct pricing vs OTAs without reason: prefer transparency and a modest perk over a suspicious price gap."
        ],
      }
    ]
  },
  "sync-calendrier-ical": {
    id: "sync-calendrier-ical",
    title: "Sync your iCal calendar between Airbnb, Booking and Hostiv",
    description:
      "How to import and export calendars so every channel shares the same availability.",
    seoTitle: "iCal calendar sync | Hostiv guide for hosts",
    seoDescription:
      "Sync Airbnb, Booking and your Hostiv site via iCal: import, export and best practices to avoid double bookings.",
    publishedAt: "2026-05-15",
    readingMinutes: 10,
    sections: [
      {
        title: "How iCal works",
        paragraphs: [
          "iCal (.ics) is a standard format for sharing availability. Airbnb, Booking, Vrbo and Hostiv can export busy dates and import feeds from other channels.",
          "The goal: when a night is booked on one channel, it appears blocked everywhere else after the next sync. This is not instant — allow a few hours depending on the platform.",
          "iCal carries blocked dates, not guest details. That is enough to prevent overlaps if you regularly verify feeds are active."
        ],
      },
      {
        title: "Where to find your OTA iCal URLs",
        paragraphs: [
          "Each platform exposes an export link in listing calendar settings. Copy the full URL (often ending in .ics). Store these links privately — they expose your availability.",
          "If you list on multiple platforms, create one Hostiv import per feed for a consolidated view."
        ],
        list: [
          "Airbnb: Calendar → Availability → Sync calendars → Export",
          "Booking: Extranet → Calendar → iCal sync",
          "Vrbo: Calendar section → Import / Export"
        ],
      },
      {
        title: "Set up Hostiv step by step",
        paragraphs: [
          "In Hostiv admin, open Calendars and add iCal URLs from your OTA listings as imports. Hostiv blocks incoming dates automatically.",
          "Then copy your Hostiv site iCal URL (export) and paste it into each platform’s calendar settings. Direct bookings will flow back to your OTAs after the next sync.",
          "To validate setup: block a date on a connected OTA and check it appears unavailable on Hostiv within 24 hours — and vice versa after a direct booking."
        ],
      },
      {
        title: "Common scenarios",
        paragraphs: [
          "Direct booking: the date blocks on Hostiv, then flows to Airbnb/Booking via iCal export. OTA booking: Hostiv import blocks the date on your site.",
          "Closed period (maintenance, personal use): block it in Reservations admin (click the date) or on an OTA imported via iCal.",
          "Date changes: if a guest reschedules, update all channels the same day to avoid phantom availability gaps."
        ],
      },
      {
        title: "Delays and limits to know",
        paragraphs: [
          "iCal sync is not real-time. Depending on the platform, allow 15 minutes to several hours. In peak season, do not rely on sync alone — a daily visual check remains essential.",
          "iCal does not manage dynamic pricing or minimum stay rules across platforms: you remain responsible for pricing consistency on each channel."
        ],
      },
      {
        title: "Best practices",
        paragraphs: [
          "In peak season, check sync at least once a day. After a booking or block on an OTA, confirm the date is reflected on Hostiv.",
          "When in doubt, close the period on the OTA that feeds your iCal imports rather than risk an overlap.",
          "Keep a simple log (date, channel, action) while you learn your feeds — it prevents memory gaps during busy periods."
        ],
      }
    ]
  },
  "promouvoir-site-direct": {
    id: "promouvoir-site-direct",
    title: "How to promote your direct booking website",
    description:
      "Channels, messages and habits to send qualified traffic to your Hostiv site without expensive ads.",
    seoTitle: "Promote your direct site | Hostiv guide",
    seoDescription:
      "Attract your first direct bookings: OTA links, email, social media and arguments to convince guests to book commission-free.",
    publishedAt: "2026-06-01",
    readingMinutes: 9,
    sections: [
      {
        title: "Why guests book direct",
        paragraphs: [
          "Some guests prefer booking with the host: a more direct relationship, sometimes clearer pricing, fewer intermediaries. Your job is to make the switch obvious and reassuring.",
          "Direct often attracts repeat guests, longer stays or groups who ask questions before booking — exactly the profile that values a direct exchange."
        ],
        list: [
          "Secure card payment (Stripe)",
          "Same information as on OTAs: photos, amenities, terms",
          "Fast replies and readable cancellation policy",
          "Mobile-friendly site to book from a smartphone"
        ],
      },
      {
        title: "Where to place your link",
        paragraphs: [
          "Multiply touchpoints without being pushy. The goal is to be present when the guest is already interested in your property.",
          "Top performers place the link at every post-contact touchpoint — it is not cold advertising, it is a logical follow-up to an existing conversation."
        ],
        list: [
          "Bio or host profile description on OTAs",
          "Message replies: “You can also book on my official website”",
          "Email signature, business card, QR code in the property",
          "Instagram, Facebook or newsletter if you already communicate"
        ],
      },
      {
        title: "Messages that convert",
        paragraphs: [
          "Avoid a “platform bypass” tone. Prefer transparency: you offer an official channel with the same booking safeguards and secure payment.",
          "Example: “Our official website has the same photos and availability — you can book directly here: [link]. Secure card payment.”",
          "If the guest hesitates, address objections: cancellation, payment, location, reviews. Direct wins when it is as clear as an OTA."
        ],
      },
      {
        title: "Incentivise without undercutting OTA prices",
        paragraphs: [
          "You do not need to always undercut OTA rates: margin saved on commission can fund a small direct gesture.",
          "Examples: free cleaning fee, flexible arrival, welcome bottle or late check-out depending on your policy.",
          "Frame the perk as a direct-channel bonus, not an obligation — this preserves your OTA pricing position."
        ],
      },
      {
        title: "Social media and local content",
        paragraphs: [
          "Post photos of your property, neighbourhood and nearby activities. Each post can include a “Book” link to your Hostiv site.",
          "Authentic content (before/after renovation, seasonality, local events) attracts qualified traffic without ad spend.",
          "Encourage satisfied guests to mention your name or site — word of mouth remains the most profitable channel."
        ],
      },
      {
        title: "Measure and adjust",
        paragraphs: [
          "Track where direct bookings come from (OTA message, social, word of mouth). Double down on what works.",
          "Keep improving: hero photos, amenity clarity, response time and readable cancellation terms.",
          "Each month, compare link clicks vs completed bookings: if the gap is large, work on the landing page and booking flow."
        ],
      }
    ]
  }
}
