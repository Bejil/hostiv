import type { User } from "@supabase/supabase-js"
import type Stripe from "stripe"
import {
  buildUserMetadataProfile,
  profileFromUserMetadata
} from "../../app/utils/hostiv-user-profile"
import type { HostivAccountProfile, HostivAccountUpdateBody } from "../../app/types/hostiv-account"
import { isHostivPasswordValid } from "../../app/utils/hostiv-password-rules"
import { deletePropertyStorageAssets } from "./property-storage-cleanup"
import { requireSupabaseAdmin } from "./supabase"
import { getStripeClient } from "./stripe-client"
import { formatStripeErrorMessage } from "./stripe-error"
import {
  sendHostivAccountDeletedEmail,
  sendHostivEmailChangedEmails,
  sendHostivPasswordChangedEmail
} from "./transactional-email"

export function hostivAccountProfileFromUser(user: User): HostivAccountProfile {
  const profile = profileFromUserMetadata(user.user_metadata as Record<string, unknown> | undefined)

  return {
    email: user.email ?? "",
    first_name: profile.firstName,
    last_name: profile.lastName,
    full_name: profile.fullName
  }
}

export async function updateHostivAccount(
  user: User,
  body: HostivAccountUpdateBody
): Promise<{
  profile: HostivAccountProfile
  emailChanged: boolean
  passwordChanged: boolean
}> {
  const supabase = requireSupabaseAdmin()
  const firstName = typeof body.first_name === "string" ? body.first_name.trim() : ""
  const lastName = typeof body.last_name === "string" ? body.last_name.trim() : ""
  const nextEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const nextPassword = typeof body.password === "string" ? body.password : ""

  if (!firstName) {
    throw createError({ statusCode: 400, message: "Indiquez votre prénom." })
  }

  if (!nextEmail || !nextEmail.includes("@")) {
    throw createError({ statusCode: 400, message: "Indiquez une adresse e-mail valide." })
  }

  if (nextPassword && !isHostivPasswordValid(nextPassword)) {
    throw createError({
      statusCode: 400,
      message: "Choisissez un mot de passe qui respecte tous les critères de sécurité."
    })
  }

  const metadata = buildUserMetadataProfile(
    firstName,
    lastName,
    user.user_metadata as Record<string, unknown> | undefined
  )

  const update: {
    email?: string
    password?: string
    user_metadata: Record<string, unknown>
  } = {
    user_metadata: metadata
  }

  const previousEmail = (user.email ?? "").trim().toLowerCase()
  const emailChanged = nextEmail !== previousEmail
  const passwordChanged = Boolean(nextPassword)

  if (emailChanged) {
    update.email = nextEmail
  }

  if (nextPassword) {
    update.password = nextPassword
  }

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, update)

  if (error) {
    console.error("[hostiv-account] update:", error.message)

    const message =
      error.message.includes("already been registered") ||
      error.message.includes("already registered")
        ? "Cette adresse e-mail est déjà utilisée."
        : error.message || "Impossible de mettre à jour le compte."

    throw createError({ statusCode: 400, message })
  }

  if (!data.user) {
    throw createError({ statusCode: 502, message: "Mise à jour du compte impossible." })
  }

  const profile = hostivAccountProfileFromUser(data.user)
  const notifyEmail = profile.email.trim().toLowerCase() || nextEmail

  if (emailChanged && previousEmail) {
    void sendHostivEmailChangedEmails({
      previousEmail,
      nextEmail
    })
  }

  if (passwordChanged && notifyEmail) {
    void sendHostivPasswordChangedEmail({ to: notifyEmail })
  }

  return {
    profile,
    emailChanged,
    passwordChanged
  }
}

export async function deleteStripeConnectAccount(
  stripe: Stripe,
  accountId: string
): Promise<void> {
  try {
    const deleted = await stripe.accounts.del(accountId)

    if (!deleted.deleted) {
      throw new Error("Stripe n’a pas confirmé la suppression du compte Connect.")
    }
  } catch (error) {
    console.error("[hostiv-account] stripe delete:", error)

    const stripeMessage = formatStripeErrorMessage(error)

    throw createError({
      statusCode: 502,
      message:
        stripeMessage && !stripeMessage.startsWith("Erreur Stripe.")
          ? stripeMessage
          : "Impossible de supprimer le compte Stripe Connect. Terminez les virements en cours ou contactez le support Stripe, puis réessayez."
    })
  }
}

export async function deletePropertyAndConnectedResources(property: {
  id: string
  slug: string
  stripe_account_id?: string | null
}): Promise<void> {
  const normalizedSlug = property.slug.trim().toLowerCase()
  const stripeAccountId =
    typeof property.stripe_account_id === "string" ? property.stripe_account_id.trim() : ""
  const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || "").trim()

  if (stripeAccountId && stripeSecretKey) {
    const stripe = getStripeClient(stripeSecretKey)
    await deleteStripeConnectAccount(stripe, stripeAccountId)
  } else if (stripeAccountId && !stripeSecretKey) {
    console.warn(
      "[hostiv-account] STRIPE_SECRET_KEY missing — Connect account not deleted at Stripe:",
      stripeAccountId
    )
  }

  await deletePropertyStorageAssets(normalizedSlug)

  const supabase = requireSupabaseAdmin()

  const { error: deletePropertyError } = await supabase
    .from("properties")
    .delete()
    .eq("id", property.id)

  if (deletePropertyError) {
    console.error("[hostiv-account] property delete:", deletePropertyError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de supprimer le site."
    })
  }
}

export async function deleteHostivAccountForProperty(slug: string, userId: string): Promise<void> {
  const normalizedSlug = slug.trim().toLowerCase()
  const supabase = requireSupabaseAdmin()

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, slug, owner_user_id, stripe_account_id")
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (propertyError) {
    console.error("[hostiv-account] property read:", propertyError.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger votre site."
    })
  }

  if (!property) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  if (property.owner_user_id !== userId) {
    throw createError({
      statusCode: 403,
      message: "Vous n’êtes pas autorisé à supprimer ce compte."
    })
  }

  const { data: ownerAuth, error: ownerAuthError } = await supabase.auth.admin.getUserById(userId)
  const ownerEmail = ownerAuthError ? "" : ownerAuth.user?.email?.trim() ?? ""

  await deletePropertyAndConnectedResources(property)

  const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId)

  if (deleteUserError) {
    console.error("[hostiv-account] user delete:", deleteUserError.message)

    throw createError({
      statusCode: 502,
      message: "Le site a été supprimé mais le compte utilisateur n’a pas pu être effacé. Contactez le support."
    })
  }

  if (ownerEmail) {
    void sendHostivAccountDeletedEmail({ to: ownerEmail, slug: normalizedSlug })
  }
}
