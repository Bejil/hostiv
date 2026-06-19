import { randomBytes } from "node:crypto"
import type { User } from "@supabase/supabase-js"
import { buildUserMetadataProfile } from "../../app/utils/hostiv-user-profile"
import { isHostivPasswordValid } from "../../app/utils/hostiv-password-rules"
import { normalizeHostivAccountEmail } from "./hostiv-password-reset"
import { requireSupabaseAdmin } from "./supabase"
import { getUserEmailById } from "./transactional-email"
import type {
  PropertyCohostInvitation,
  PropertyCohostMember,
  PropertyCohostsPayload
} from "../../app/types/property-cohost"

export const PROPERTY_COHOST_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

type PropertyRow = {
  id: string
  slug: string
  brand_name: string
  owner_user_id: string | null
}

type InvitationRow = {
  id: string
  property_id: string
  email: string
  token: string
  invited_by: string
  expires_at: string
  accepted_at: string | null
  revoked_at: string | null
  created_at: string
}

function createInviteToken() {
  return randomBytes(32).toString("base64url")
}

async function getPropertyBySlug(slug: string): Promise<PropertyRow | null> {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from("properties")
    .select("id, slug, brand_name, owner_user_id")
    .eq("slug", slug.trim().toLowerCase())
    .maybeSingle()

  if (error) {
    console.error("[property-cohost] get property:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger la propriété."
    })
  }

  return data as PropertyRow | null
}

export async function getPropertyIdBySlug(slug: string) {
  const property = await getPropertyBySlug(slug)

  return property?.id ?? null
}

export async function isPropertyCohostUser(propertyId: string, userId: string) {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from("property_cohosts")
    .select("id")
    .eq("property_id", propertyId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("[property-cohost] is cohost:", error.message)

    return false
  }

  return Boolean(data)
}

async function findAuthUserByEmail(email: string): Promise<User | null> {
  const supabase = requireSupabaseAdmin()
  const normalizedEmail = normalizeHostivAccountEmail(email)
  let page = 1

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })

    if (error) {
      console.error("[property-cohost] list users:", error.message)

      throw createError({
        statusCode: 502,
        message: "Impossible de vérifier ce compte pour le moment."
      })
    }

    const match = data.users.find(
      (user) => normalizeHostivAccountEmail(user.email || "") === normalizedEmail
    )

    if (match) {
      return match
    }

    if (data.users.length < 200) {
      return null
    }

    page += 1
  }

  return null
}

export async function listPropertyCohosts(slug: string): Promise<PropertyCohostsPayload> {
  const property = await getPropertyBySlug(slug)

  if (!property) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const supabase = requireSupabaseAdmin()

  const [{ data: members, error: membersError }, { data: invitations, error: invitationsError }] =
    await Promise.all([
      supabase
        .from("property_cohosts")
        .select("id, user_id, created_at")
        .eq("property_id", property.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("property_cohost_invitations")
        .select("id, email, created_at, expires_at")
        .eq("property_id", property.id)
        .is("accepted_at", null)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
    ])

  if (membersError) {
    console.error("[property-cohost] list members:", membersError.message)

    throw createError({ statusCode: 502, message: "Impossible de charger les co-hôtes." })
  }

  if (invitationsError) {
    console.error("[property-cohost] list invitations:", invitationsError.message)

    throw createError({ statusCode: 502, message: "Impossible de charger les invitations." })
  }

  const memberRows = (members ?? []) as Array<{
    id: string
    user_id: string
    created_at: string
  }>

  const resolvedMembers: PropertyCohostMember[] = []

  for (const member of memberRows) {
    const email = (await getUserEmailById(member.user_id)) ?? ""

    resolvedMembers.push({
      id: member.id,
      user_id: member.user_id,
      email,
      created_at: member.created_at
    })
  }

  return {
    members: resolvedMembers,
    invitations: (invitations ?? []) as PropertyCohostInvitation[]
  }
}

export async function createPropertyCohostInvitation(input: {
  slug: string
  email: string
  invitedByUserId: string
}) {
  const property = await getPropertyBySlug(input.slug)

  if (!property) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const email = normalizeHostivAccountEmail(input.email)

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: "Adresse e-mail invalide." })
  }

  if (property.owner_user_id) {
    const ownerEmail = await getUserEmailById(property.owner_user_id)

    if (ownerEmail && normalizeHostivAccountEmail(ownerEmail) === email) {
      throw createError({
        statusCode: 400,
        message: "Vous êtes déjà l’hôte principal de ce site."
      })
    }
  }

  const existingUser = await findAuthUserByEmail(email)

  if (existingUser) {
    if (existingUser.id === property.owner_user_id) {
      throw createError({
        statusCode: 400,
        message: "Cette personne est déjà l’hôte principal."
      })
    }

    const alreadyCohost = await isPropertyCohostUser(property.id, existingUser.id)

    if (alreadyCohost) {
      throw createError({
        statusCode: 400,
        message: "Cette personne a déjà accès au backoffice."
      })
    }
  }

  const supabase = requireSupabaseAdmin()

  await supabase
    .from("property_cohost_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("property_id", property.id)
    .eq("email", email)
    .is("accepted_at", null)
    .is("revoked_at", null)

  const token = createInviteToken()
  const expiresAt = new Date(Date.now() + PROPERTY_COHOST_INVITE_TTL_MS).toISOString()

  const { data, error } = await supabase
    .from("property_cohost_invitations")
    .insert({
      property_id: property.id,
      email,
      token,
      invited_by: input.invitedByUserId,
      expires_at: expiresAt
    })
    .select("id, email, created_at, expires_at, token")
    .single()

  if (error || !data) {
    console.error("[property-cohost] create invitation:", error?.message)

    throw createError({ statusCode: 502, message: "Impossible d’envoyer l’invitation." })
  }

  return {
    invitation: {
      id: data.id as string,
      email: data.email as string,
      created_at: data.created_at as string,
      expires_at: data.expires_at as string
    },
    token: data.token as string,
    property
  }
}

export async function revokePropertyCohostInvitation(slug: string, invitationId: string) {
  const propertyId = await getPropertyIdBySlug(slug)

  if (!propertyId) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const supabase = requireSupabaseAdmin()
  const { error } = await supabase
    .from("property_cohost_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", invitationId)
    .eq("property_id", propertyId)
    .is("accepted_at", null)
    .is("revoked_at", null)

  if (error) {
    console.error("[property-cohost] revoke invitation:", error.message)

    throw createError({ statusCode: 502, message: "Impossible d’annuler l’invitation." })
  }

  return { ok: true }
}

export async function removePropertyCohost(slug: string, memberId: string) {
  const propertyId = await getPropertyIdBySlug(slug)

  if (!propertyId) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const supabase = requireSupabaseAdmin()
  const { error } = await supabase
    .from("property_cohosts")
    .delete()
    .eq("id", memberId)
    .eq("property_id", propertyId)

  if (error) {
    console.error("[property-cohost] remove member:", error.message)

    throw createError({ statusCode: 502, message: "Impossible de retirer ce co-hôte." })
  }

  return { ok: true }
}

async function getInvitationByToken(token: string) {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase
    .from("property_cohost_invitations")
    .select(
      "id, property_id, email, token, invited_by, expires_at, accepted_at, revoked_at, created_at"
    )
    .eq("token", token.trim())
    .maybeSingle()

  if (error) {
    console.error("[property-cohost] get invitation:", error.message)

    throw createError({ statusCode: 502, message: "Impossible de vérifier l’invitation." })
  }

  return data as InvitationRow | null
}

export async function validatePropertyCohostInviteToken(token: string) {
  const invitation = await getInvitationByToken(token)

  if (!invitation) {
    return { valid: false as const }
  }

  const supabase = requireSupabaseAdmin()
  const { data: property, error } = await supabase
    .from("properties")
    .select("slug, brand_name")
    .eq("id", invitation.property_id)
    .maybeSingle()

  if (error || !property) {
    return { valid: false as const }
  }

  if (invitation.accepted_at) {
    return {
      valid: false as const,
      already_accepted: true,
      slug: property.slug as string,
      brand_name: property.brand_name as string,
      email: invitation.email
    }
  }

  if (invitation.revoked_at) {
    return { valid: false as const }
  }

  const expired = new Date(invitation.expires_at).getTime() <= Date.now()

  if (expired) {
    return {
      valid: false as const,
      expired: true,
      slug: property.slug as string,
      brand_name: property.brand_name as string,
      email: invitation.email
    }
  }

  return {
    valid: true as const,
    slug: property.slug as string,
    brand_name: property.brand_name as string,
    email: invitation.email,
    account_exists: Boolean(await findAuthUserByEmail(invitation.email))
  }
}

export async function registerAndAcceptPropertyCohostInvite(input: {
  token: string
  firstName: string
  lastName: string
  password: string
}) {
  const invitation = await getInvitationByToken(input.token)

  if (!invitation) {
    throw createError({ statusCode: 404, message: "Invitation introuvable ou expirée." })
  }

  if (invitation.accepted_at || invitation.revoked_at) {
    throw createError({ statusCode: 400, message: "Cette invitation n’est plus valide." })
  }

  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    throw createError({ statusCode: 400, message: "Cette invitation a expiré." })
  }

  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()

  if (!firstName) {
    throw createError({ statusCode: 400, message: "Indiquez votre prénom." })
  }

  if (!isHostivPasswordValid(input.password)) {
    throw createError({
      statusCode: 400,
      message: "Choisissez un mot de passe qui respecte tous les critères de sécurité."
    })
  }

  const email = normalizeHostivAccountEmail(invitation.email)
  const existingUser = await findAuthUserByEmail(email)

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: "Un compte Hostiv existe déjà pour cette adresse. Connectez-vous pour accepter l’invitation."
    })
  }

  const supabase = requireSupabaseAdmin()

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, slug, owner_user_id")
    .eq("id", invitation.property_id)
    .maybeSingle()

  if (propertyError || !property) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: buildUserMetadataProfile(firstName, lastName)
  })

  if (createUserError || !createdUser.user) {
    console.error("[property-cohost] register user:", createUserError?.message)

    throw createError({
      statusCode: 502,
      message: createUserError?.message || "Impossible de créer votre compte."
    })
  }

  if (property.owner_user_id === createdUser.user.id) {
    await supabase.auth.admin.deleteUser(createdUser.user.id)

    throw createError({
      statusCode: 400,
      message: "Vous êtes déjà l’hôte principal de ce site."
    })
  }

  return acceptPropertyCohostInvite({
    token: input.token,
    user: createdUser.user
  })
}

export async function acceptPropertyCohostInvite(input: { token: string; user: User }) {
  const invitation = await getInvitationByToken(input.token)

  if (!invitation) {
    throw createError({ statusCode: 404, message: "Invitation introuvable ou expirée." })
  }

  if (invitation.accepted_at || invitation.revoked_at) {
    throw createError({ statusCode: 400, message: "Cette invitation n’est plus valide." })
  }

  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    throw createError({ statusCode: 400, message: "Cette invitation a expiré." })
  }

  const userEmail = normalizeHostivAccountEmail(input.user.email || "")

  if (userEmail !== normalizeHostivAccountEmail(invitation.email)) {
    throw createError({
      statusCode: 403,
      message: "Connectez-vous avec l’adresse e-mail invitée pour accepter."
    })
  }

  const supabase = requireSupabaseAdmin()

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, slug, owner_user_id")
    .eq("id", invitation.property_id)
    .maybeSingle()

  if (propertyError || !property) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  if (property.owner_user_id === input.user.id) {
    throw createError({
      statusCode: 400,
      message: "Vous êtes déjà l’hôte principal de ce site."
    })
  }

  const alreadyCohost = await isPropertyCohostUser(property.id, input.user.id)

  if (!alreadyCohost) {
    const { error: insertError } = await supabase.from("property_cohosts").insert({
      property_id: property.id,
      user_id: input.user.id,
      invited_by: invitation.invited_by
    })

    if (insertError) {
      console.error("[property-cohost] accept insert:", insertError.message)

      throw createError({ statusCode: 502, message: "Impossible d’accepter l’invitation." })
    }
  }

  const { error: updateError } = await supabase
    .from("property_cohost_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id)

  if (updateError) {
    console.error("[property-cohost] accept update:", updateError.message)
  }

  return {
    ok: true,
    slug: property.slug as string
  }
}

export function buildPropertyCohostInviteUrl(slug: string, token: string) {
  const base = (process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://hostiv.fr").replace(
    /\/$/,
    ""
  )

  return `${base}/${slug}/admin/invitation?token=${encodeURIComponent(token)}`
}
