import { isBrandNameAutoDerivedFromSlug } from "../../app/utils/signup-property-name"
import { validatePropertySlugFormat } from "../../app/utils/property-slug"
import { normalizeHostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import { normalizeBookingConfig } from "../../app/utils/booking-config"
import { normalizeCalendarConfig } from "../../app/utils/calendar-config"
import { requireSupabaseAdmin } from "./supabase"

async function backfillBrandNameFromSignup(
  supabase: ReturnType<typeof requireSupabaseAdmin>,
  slug: string,
  displayName: string
) {
  if (!displayName) {
    return
  }

  const { data: row } = await supabase
    .from("properties")
    .select("brand_name, content")
    .eq("slug", slug)
    .maybeSingle()

  if (!row) {
    return
  }

  const currentName = String(row.brand_name ?? "").trim()

  if (currentName && !isBrandNameAutoDerivedFromSlug(currentName, slug)) {
    return
  }

  const content =
    row.content && typeof row.content === "object"
      ? { ...(row.content as Record<string, unknown>) }
      : buildEmptySiteContent()

  const copy =
    content.copy && typeof content.copy === "object"
      ? { ...(content.copy as Record<string, unknown>) }
      : buildEmptySiteContent().copy

  const header =
    copy.header && typeof copy.header === "object"
      ? { ...(copy.header as Record<string, unknown>) }
      : { brand_name: "", brand_meta: "", logo_alt: "" }

  header.brand_name = displayName
  header.logo_alt = displayName

  await supabase
    .from("properties")
    .update({
      brand_name: displayName,
      content: {
        ...content,
        copy: {
          ...copy,
          header
        }
      }
    })
    .eq("slug", slug)
}

function buildEmptySiteContent() {
  return {
    template: { id: null },
    copy: {
      header: {
        brand_name: "",
        brand_meta: "",
        logo_alt: ""
      },
      hero: {
        eyebrow: "",
        title: "",
        text: "",
        image_alt: ""
      },
      platform_stats: { eyebrow: "", title: "", intro: "" },
      host: {
        caption: "",
        eyebrow: "",
        title: "",
        quote: "",
        intro_1: "",
        intro_2: "",
        image_alt: "",
        cta: ""
      },
      spaces: { eyebrow: "", title: "", intro: "" },
      benefits: { eyebrow: "", title: "" },
      location: { eyebrow: "", title: "", intro: "", lead: "" },
      visual: {
        eyebrow: "",
        title: "",
        intro: "",
        gallery_cta_eyebrow: "",
        gallery_cta_title: "",
        gallery_cta_text: "",
        gallery_cta_action: ""
      },
      pricing: { eyebrow: "", title: "", intro: "" },
      amenities: { eyebrow: "", title: "", intro: "" },
      reviews: { eyebrow: "", title: "" },
      booking: { eyebrow: "", title: "", intro: "" },
      house_rules: { eyebrow: "", title: "" }
    },
    email: { access_lines: [] },
    platform_links: [],
    featured_spaces: [],
    space_gallery_categories: [],
    benefit_cards: [],
    neighborhood_highlights: [],
    visual_cards: [],
    reviews: [],
    house_rules: [],
    amenity_catalog: [],
    amenity_preview_sections: []
  }
}

export async function provisionPropertyForUser(input: {
  userId: string
  propertyName: string
  propertySlug: string
  subscriptionPlan?: string | null
  notifyEmail?: string | null
}) {
  const validity = validatePropertySlugFormat(input.propertySlug)

  if (!validity.valid) {
    throw createError({ statusCode: 400, message: "Adresse du site invalide." })
  }

  const slug = validity.slug
  const supabase = requireSupabaseAdmin()

  const { data: existing } = await supabase
    .from("properties")
    .select("id, owner_user_id")
    .eq("slug", slug)
    .maybeSingle()

  const displayName = input.propertyName.trim()

  if (existing) {
    if (existing.owner_user_id === input.userId) {
      await backfillBrandNameFromSignup(supabase, slug, displayName)

      return { slug, created: false as const }
    }

    throw createError({
      statusCode: 409,
      message: "Ce nom de site est déjà utilisé."
    })
  }

  const { data: owned } = await supabase
    .from("properties")
    .select("slug")
    .eq("owner_user_id", input.userId)
    .limit(1)
    .maybeSingle()

  if (owned?.slug) {
    const ownedSlug = String(owned.slug)

    await backfillBrandNameFromSignup(supabase, ownedSlug, displayName)

    return { slug: ownedSlug, created: false as const }
  }

  const plan = normalizeHostivSubscriptionPlan(input.subscriptionPlan)
  const content = buildEmptySiteContent()

  content.copy.header.brand_name = displayName
  content.copy.header.logo_alt = displayName

  const { error: insertError } = await supabase.from("properties").insert({
    slug,
    published: false,
    brand_name: displayName,
    brand_meta: "",
    logo_path: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    seo_og_title: "",
    seo_og_description: "",
    seo_og_image_path: "",
    seo_twitter_card: "summary_large_image",
    seo_noindex: false,
    hero_image_path: "",
    hero_image_alt: "",
    testimonials_bg_path: "",
    host_photo_path: "",
    owner_user_id: input.userId,
    subscription_plan: plan,
    booking_config: normalizeBookingConfig({
      base_night_price_eur: 0,
      included_main_guests: 0
    }),
    calendar_config: normalizeCalendarConfig(null),
    location: {
      address: "",
      latitude: 48.85,
      longitude: 2.35,
      radius_meters: 400
    },
    content
  })

  if (insertError) {
    console.error("[hostiv-provision] insert:", insertError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de créer votre site."
    })
  }

  return { slug, created: true as const }
}
