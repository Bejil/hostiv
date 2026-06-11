import type Stripe from "stripe"
import { isHostivPasswordValid } from "../../app/utils/hostiv-password-rules"
import { validatePropertySlugFormat } from "../../app/utils/property-slug"
import { normalizeHostivSubscriptionPlan, type HostivSubscriptionPlan } from "../../app/utils/hostiv-subscription-plan"
import {
  hostivPlanCheckoutDescription,
  hostivPlanCheckoutLabel,
  hostivPlanPriceCents
} from "../../app/utils/hostiv-subscription-pricing"
import { isPropertySlugTaken } from "./property-slug-repository"
import {
  decryptHostivPendingSignupSecret,
  encryptHostivPendingSignupSecret,
  resolveHostivSignupEncryptionSecret
} from "./hostiv-pending-signup-crypto"
import { provisionPropertyForUser } from "./hostiv-provision-property"
import {
  sendHostivWelcomeEmail,
  sendPlatformNewSignupAlert,
  sendSignupFailureEmails
} from "./transactional-email"
import { applyHostivSubscriptionPaymentToAccount } from "./hostiv-subscription-payment"
import { getStripeClient } from "./stripe-client"
import { requireSupabaseAdmin } from "./supabase"

export const HOSTIV_SIGNUP_CHECKOUT_METADATA_TYPE = "hostiv_signup"

const PENDING_SIGNUP_TTL_MS = 48 * 60 * 60 * 1000

type PendingSignupRow = {
  id: string
  email: string
  password_ciphertext: string
  full_name: string
  property_name: string
  property_slug: string
  subscription_plan: string
  stripe_session_id: string | null
  status: string
  user_id: string | null
  expires_at: string
}

export type CreateHostivSignupCheckoutInput = {
  stripeSecretKey: string
  encryptionSecret: string
  fullName: string
  email: string
  password: string
  propertyName: string
  propertySlug: string
  plan: HostivSubscriptionPlan
  siteBaseUrl: string
}

async function assertSignupEmailAvailable(email: string) {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase.rpc("hostiv_auth_email_exists", {
    check_email: email
  })

  if (error) {
    console.error("[hostiv-signup-checkout] email check:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de vérifier cet e-mail."
    })
  }

  if (data === true) {
    throw createError({
      statusCode: 409,
      message: "Un compte existe déjà avec cet e-mail. Connectez-vous."
    })
  }
}

async function insertPendingSignup(input: CreateHostivSignupCheckoutInput, slug: string, plan: HostivSubscriptionPlan) {
  const supabase = requireSupabaseAdmin()
  const email = input.email.trim().toLowerCase()
  const expiresAt = new Date(Date.now() + PENDING_SIGNUP_TTL_MS).toISOString()

  await supabase.from("hostiv_pending_signups").delete().eq("email", email).eq("status", "pending")

  const passwordCiphertext = encryptHostivPendingSignupSecret(
    input.password,
    input.encryptionSecret
  )

  const { data, error } = await supabase
    .from("hostiv_pending_signups")
    .insert({
      email,
      password_ciphertext: passwordCiphertext,
      full_name: input.fullName.trim(),
      property_name: input.propertyName.trim(),
      property_slug: slug,
      subscription_plan: plan,
      expires_at: expiresAt
    })
    .select("id")
    .single()

  if (error || !data?.id) {
    console.error("[hostiv-signup-checkout] insert pending:", error?.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de préparer votre inscription."
    })
  }

  return String(data.id)
}

export async function createHostivSignupCheckoutSession(input: CreateHostivSignupCheckoutInput) {
  const siteBase = input.siteBaseUrl.trim()

  if (!siteBase) {
    throw createError({
      statusCode: 503,
      message: "URL du site non configurée (NUXT_PUBLIC_SITE_URL)."
    })
  }

  const email = input.email.trim().toLowerCase()

  if (!email.includes("@")) {
    throw createError({ statusCode: 400, message: "Indiquez un e-mail valide." })
  }

  if (!isHostivPasswordValid(input.password)) {
    throw createError({
      statusCode: 400,
      message: "Choisissez un mot de passe qui respecte tous les critères de sécurité."
    })
  }

  const validity = validatePropertySlugFormat(input.propertySlug)

  if (!validity.valid) {
    throw createError({ statusCode: 400, message: "Adresse du site invalide." })
  }

  const slug = validity.slug

  if (await isPropertySlugTaken(slug)) {
    throw createError({
      statusCode: 409,
      message: "Ce nom de bien est déjà utilisé. Choisissez un autre nom."
    })
  }

  await assertSignupEmailAvailable(email)

  const plan = normalizeHostivSubscriptionPlan(input.plan)
  const pendingId = await insertPendingSignup(input, slug, plan)
  const stripe = getStripeClient(input.stripeSecretKey)

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: hostivPlanPriceCents(plan),
          product_data: {
            name: hostivPlanCheckoutLabel(plan),
            description: hostivPlanCheckoutDescription(plan)
          }
        }
      }
    ],
    metadata: {
      hostiv_checkout: HOSTIV_SIGNUP_CHECKOUT_METADATA_TYPE,
      pending_signup_id: pendingId,
      subscription_plan: plan,
      property_slug: slug
    },
    success_url: `${siteBase}/inscription/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteBase}/?signup=cancelled`
  })

  if (!session.id) {
    throw createError({
      statusCode: 502,
      message: "Impossible d’ouvrir la page de paiement Stripe."
    })
  }

  const supabase = requireSupabaseAdmin()

  await supabase
    .from("hostiv_pending_signups")
    .update({ stripe_session_id: session.id })
    .eq("id", pendingId)

  if (!session.url) {
    throw createError({
      statusCode: 502,
      message: "Impossible d’ouvrir la page de paiement Stripe."
    })
  }

  return { url: session.url, sessionId: session.id, pendingId }
}

async function loadPendingSignup(pendingId: string) {
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("hostiv_pending_signups")
    .select(
      "id, email, password_ciphertext, full_name, property_name, property_slug, subscription_plan, stripe_session_id, status, user_id, expires_at"
    )
    .eq("id", pendingId)
    .maybeSingle()

  if (error) {
    console.error("[hostiv-signup-checkout] load pending:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de lire votre inscription."
    })
  }

  return data as PendingSignupRow | null
}

function isHostivSignupCheckoutSession(session: Stripe.Checkout.Session) {
  return session.metadata?.hostiv_checkout === HOSTIV_SIGNUP_CHECKOUT_METADATA_TYPE
}

async function markPendingSignupFailed(pendingId: string) {
  const supabase = requireSupabaseAdmin()

  await supabase
    .from("hostiv_pending_signups")
    .update({
      status: "failed",
      password_ciphertext: "",
      completed_at: new Date().toISOString()
    })
    .eq("id", pendingId)
}

async function markPendingSignupCompleted(pendingId: string, userId: string) {
  const supabase = requireSupabaseAdmin()

  await supabase
    .from("hostiv_pending_signups")
    .update({
      status: "completed",
      user_id: userId,
      password_ciphertext: "",
      completed_at: new Date().toISOString()
    })
    .eq("id", pendingId)
}

export async function fulfillHostivSignupCheckoutSession(
  stripe: Stripe,
  sessionId: string,
  encryptionSecret: string
) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (!isHostivSignupCheckoutSession(session)) {
    throw createError({
      statusCode: 400,
      message: "Session de paiement invalide."
    })
  }

  const pendingId = String(session.metadata?.pending_signup_id || "").trim()

  if (!pendingId) {
    throw createError({
      statusCode: 400,
      message: "Inscription en attente introuvable."
    })
  }

  const pending = await loadPendingSignup(pendingId)

  if (!pending) {
    throw createError({
      statusCode: 404,
      message: "Inscription en attente introuvable ou expirée."
    })
  }

  if (pending.status === "completed" && pending.user_id) {
    return {
      fulfilled: true as const,
      session,
      user_id: pending.user_id,
      slug: pending.property_slug,
      email: pending.email,
      already_completed: true as const
    }
  }

  if (session.payment_status !== "paid") {
    return { fulfilled: false as const, session }
  }

  if (pending.status !== "pending") {
    throw createError({
      statusCode: 409,
      message: "Cette inscription ne peut plus être finalisée."
    })
  }

  if (new Date(pending.expires_at).getTime() < Date.now()) {
    await markPendingSignupFailed(pendingId)

    throw createError({
      statusCode: 410,
      message: "Cette inscription a expiré. Recommencez depuis le formulaire."
    })
  }

  const slug = pending.property_slug.trim().toLowerCase()

  if (await isPropertySlugTaken(slug)) {
    await markPendingSignupFailed(pendingId)

    void sendSignupFailureEmails({
      email: pending.email,
      fullName: pending.full_name,
      propertyName: pending.property_name,
      slug,
      reason: "Le nom de site demandé n’est plus disponible.",
      stripeSessionId: sessionId
    })

    throw createError({
      statusCode: 409,
      message:
        "Ce nom de site n’est plus disponible. Contactez-nous à contact@hostiv.fr pour un remboursement."
    })
  }

  await assertSignupEmailAvailable(pending.email)

  const plan = normalizeHostivSubscriptionPlan(pending.subscription_plan)
  const password = decryptHostivPendingSignupSecret(pending.password_ciphertext, encryptionSecret)
  const supabase = requireSupabaseAdmin()

  const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
    email: pending.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: pending.full_name,
      property_name: pending.property_name,
      property_slug: slug,
      subscription_plan: plan
    }
  })

  if (createUserError || !createdUser.user?.id) {
    console.error("[hostiv-signup-checkout] create user:", createUserError?.message)
    await markPendingSignupFailed(pendingId)

    void sendSignupFailureEmails({
      email: pending.email,
      fullName: pending.full_name,
      propertyName: pending.property_name,
      slug,
      reason: createUserError?.message || "Impossible de créer le compte utilisateur.",
      stripeSessionId: sessionId
    })

    throw createError({
      statusCode: 502,
      message: createUserError?.message || "Impossible de créer votre compte."
    })
  }

  const userId = createdUser.user.id

  try {
    await applyHostivSubscriptionPaymentToAccount(userId, plan)
    await provisionPropertyForUser({
      userId,
      propertyName: pending.property_name,
      propertySlug: slug,
      subscriptionPlan: plan,
      notifyEmail: pending.email
    })
    await markPendingSignupCompleted(pendingId, userId)

    void sendHostivWelcomeEmail({
      to: pending.email,
      fullName: pending.full_name,
      propertyName: pending.property_name,
      slug,
      plan
    })

    void sendPlatformNewSignupAlert({
      email: pending.email,
      fullName: pending.full_name,
      propertyName: pending.property_name,
      slug,
      plan
    })
  } catch (error) {
    console.error("[hostiv-signup-checkout] provision:", error)
    await markPendingSignupFailed(pendingId)

    const provisionDetail = error instanceof Error ? error.message : "Création du site impossible."

    void sendSignupFailureEmails({
      email: pending.email,
      fullName: pending.full_name,
      propertyName: pending.property_name,
      slug,
      reason: provisionDetail,
      stripeSessionId: sessionId
    })

    throw createError({
      statusCode: 502,
      message: "Paiement reçu mais création du site impossible. Contactez-nous à contact@hostiv.fr."
    })
  }

  return {
    fulfilled: true as const,
    session,
    user_id: userId,
    slug,
    email: pending.email,
    subscription_plan: plan,
    already_completed: false as const
  }
}
