type AdminCopyField = {
  key: string
  label: string
  type?: "text" | "textarea" | "time"
  fullWidth?: boolean
  hint?: string
  examples?: string[]
}

type AdminCopySection = {
  id: string
  title: string
  fields: AdminCopyField[]
}

/** Copy sections (content.copy) for the admin form. */
export const adminCopySectionsEn: AdminCopySection[] = [
  {
    id: "hero",
    title: "Hero",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: [
          "Entire apartment · Le Chesnay",
          "Holiday home · 10 min from the beach"
        ]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "Stay somewhere peaceful without sacrificing comfort",
          "A family pied-à-terre just steps from downtown"
        ]
      },
      {
        key: "text",
        label: "Text",
        type: "textarea" as const,
        examples: [
          "A charming apartment with self check-in, close to shops and public transport.",
          "580 sq ft, sleeps 4, workspace and amenities designed for families."
        ]
      }
    ]
  },
  {
    id: "platform_stats",
    title: "Platforms (intro)",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: ["Guest trust", "Ratings and reviews"]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "Highly rated on booking platforms",
          "Stays guests love"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        type: "textarea",
        fullWidth: true,
        examples: [
          "Successful stays, a well-kept home, and a welcome guests appreciate.",
          "Hundreds of positive reviews on Airbnb, Booking, and Vrbo."
        ]
      }
    ]
  },
  {
    id: "host",
    title: "Host",
    fields: [
      {
        key: "caption",
        label: "Photo caption",
        fullWidth: true,
        examples: ["Sophie · your host", "Marc & Julie · your hosts"]
      },
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: ["Your host", "Meet your host"]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "A family home we care deeply about",
          "A place we open with care, season after season"
        ]
      },
      {
        key: "quote",
        label: "Quote",
        type: "textarea" as const,
        fullWidth: true,
        examples: [
          "A former home of ours that we open with care — so you feel expected.",
          "We love welcoming curious travelers, not just passing visitors."
        ]
      },
      {
        key: "intro_1",
        label: "Intro 1",
        type: "textarea" as const,
        examples: [
          "I personally handle check-in and stay available throughout your stay.",
          "We live nearby and can recommend the best spots in the neighborhood."
        ]
      },
      {
        key: "intro_2",
        label: "Intro 2",
        type: "textarea" as const,
        examples: [
          "Self check-in in the evening, remote assistance in French and English.",
          "We return here regularly as a family — the home is built to last."
        ]
      }
    ]
  },
  {
    id: "spaces",
    title: "Spaces",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: ["Our favorite spaces", "Explore"]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "From the living room to the bedroom: a home you can settle into",
          "Spaces designed to relax, cook, and work"
        ]
      },
      {
        key: "intro",
        label: "Description",
        type: "textarea" as const,
        fullWidth: true,
        examples: [
          "Live day to day, sleep well, cook in, and enjoy the neighborhood from a quiet setting.",
          "Every room has a purpose: rest, gathering, remote work, or family meals."
        ]
      }
    ]
  },
  {
    id: "benefits",
    title: "Highlights",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: ["What makes this stay special", "Why book here"]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "An easy stay to plan and a pleasure to live in",
          "Comfort, independence, and location — all covered"
        ]
      }
    ]
  },
  {
    id: "location",
    title: "Neighborhood",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: ["Neighborhood & surroundings", "Around the property"]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "A strategic location between shops and transit",
          "Quiet, yet steps from shops and sightseeing"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        type: "textarea" as const,
        fullWidth: true,
        examples: [
          "A quiet residential area, ideal for sightseeing, daily life, and getting around.",
          "Shops, markets, and train stations nearby for a car-free stay."
        ]
      },
      {
        key: "lead",
        label: "Lead",
        type: "textarea" as const,
        fullWidth: true,
        examples: [
          "Quiet neighborhood, shops within walking distance, and RER to Paris in 8 min.",
          "Between Versailles and the forests — green surroundings, easy access."
        ]
      }
    ]
  },
  {
    id: "visual",
    title: "Visual / gallery",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: ["Explore the property", "In photos"]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "A few images to help you picture your arrival",
          "Browse the property in photos"
        ]
      },
      {
        key: "intro",
        label: "Description",
        type: "textarea" as const,
        fullWidth: true,
        examples: [
          "The apartment works as well for a weekend as for a longer stay, with family or for work.",
          "Day and night photos so you can picture every space."
        ]
      }
    ]
  },
  {
    id: "pricing",
    title: "Pricing (copy)",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: ["Rates", "Pricing and terms"]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "Simple reference points before you book",
          "Clear rates, no surprises"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        type: "textarea" as const,
        examples: [
          "When you book direct, you avoid platform commissions.",
          "Discounts from 7 or 28 nights — we finalize the details with you easily."
        ]
      }
    ]
  },
  {
    id: "amenities",
    title: "Amenities (copy)",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: ["Amenities", "What's included"]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "A welcoming setup with everything you need for a stress-free stay",
          "Wi-Fi, fully equipped kitchen, and linens provided"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        type: "textarea" as const,
        examples: [
          "Fiber Wi-Fi, full kitchen, linens provided, and family-friendly amenities.",
          "Everything is set up so there are no unwelcome surprises on arrival."
        ]
      }
    ]
  },
  {
    id: "reviews",
    title: "Reviews (copy)",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: ["Guest feedback", "What they say"]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "Very positive experiences around peace and welcome",
          "What guests say after their stay"
        ]
      }
    ]
  },
  {
    id: "rules",
    title: "House rules",
    fields: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        examples: ["House rules", "Stay conditions"]
      },
      {
        key: "title",
        label: "Title",
        examples: [
          "Simple rules for a peaceful stay",
          "A few essential guidelines to follow"
        ]
      },
      {
        key: "intro",
        label: "Introduction",
        type: "textarea" as const,
        examples: [
          "A few guidelines to preserve neighborhood quiet and keep the property in good shape.",
          "Clear rules for you and for the guests who follow."
        ]
      },
      {
        key: "check_in_label",
        label: "Check-in label",
        examples: ["Check-in", "Arrival"]
      },
      {
        key: "check_in_time",
        label: "Check-in time",
        type: "time" as const,
        hint: "Hours and minutes (24-hour format)",
        examples: ["17:00", "16:00"]
      },
      {
        key: "check_out_label",
        label: "Check-out label",
        examples: ["Check-out", "Departure"]
      },
      {
        key: "check_out_time",
        label: "Check-out time",
        type: "time" as const,
        hint: "Hours and minutes (24-hour format)",
        examples: ["11:00", "10:00"]
      }
    ]
  },
  {
    id: "booking",
    title: "Booking (copy)",
    fields: [
      {
        key: "price_recap_note",
        label: "Price recap note",
        type: "textarea" as const,
        examples: [
          "Amount calculated from displayed rates (nights, discounts, guests). Tourist tax not included.",
          "Card payment will be requested in the next step."
        ]
      },
      {
        key: "price_recap_note_payment",
        label: "Payment recap note",
        type: "textarea" as const,
        examples: [
          "Secure card payment below.",
          "Final amount confirmed before payment is processed."
        ]
      }
    ]
  }
] as const
