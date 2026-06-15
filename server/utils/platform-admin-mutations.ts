import type { HostivAccountProfile, HostivAccountUpdateBody } from "../../app/types/hostiv-account"
import type { PlatformAdminMemberDetail } from "../../app/types/platform-admin"
import {
  deleteHostivAccountForProperty,
  deletePropertyAndConnectedResources,
  hostivAccountProfileFromUser,
  updateHostivAccount
} from "./hostiv-account"
import { isPlatformAdminEmail } from "./platform-admin-auth"
import { getPlatformAdminMemberDetail } from "./platform-admin-repository"
import { requireSupabaseAdmin } from "./supabase"

async function readAuthUser(userId: string) {
  const supabase = requireSupabaseAdmin()
  const { data, error } = await supabase.auth.admin.getUserById(userId)

  if (error || !data.user) {
    throw createError({ statusCode: 404, message: "Membre introuvable." })
  }

  return data.user
}

function assertNotPlatformAdminMember(email: string | null | undefined) {
  if (isPlatformAdminEmail(email)) {
    throw createError({
      statusCode: 403,
      message: "Impossible de modifier ou supprimer un administrateur plateforme Hostiv."
    })
  }
}

export async function deletePlatformAdminSite(slug: string, confirmSlug: string) {
  const normalizedSlug = slug.trim().toLowerCase()
  const normalizedConfirm = confirmSlug.trim().toLowerCase()

  if (!normalizedConfirm || normalizedConfirm !== normalizedSlug) {
    throw createError({
      statusCode: 400,
      message: "Saisissez l’adresse exacte du site pour confirmer la suppression."
    })
  }

  const supabase = requireSupabaseAdmin()

  const { data: property, error } = await supabase
    .from("properties")
    .select("id, slug, stripe_account_id")
    .eq("slug", normalizedSlug)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 502, message: error.message })
  }

  if (!property) {
    throw createError({ statusCode: 404, message: "Site introuvable." })
  }

  await deletePropertyAndConnectedResources(property)

  return { ok: true as const }
}

export async function deletePlatformAdminMember(userId: string, confirmEmail: string) {
  const user = await readAuthUser(userId)

  assertNotPlatformAdminMember(user.email)

  const normalizedConfirm = confirmEmail.trim().toLowerCase()
  const normalizedEmail = user.email?.trim().toLowerCase() ?? ""

  if (!normalizedConfirm || normalizedConfirm !== normalizedEmail) {
    throw createError({
      statusCode: 400,
      message: "Saisissez l’e-mail exact du membre pour confirmer la suppression."
    })
  }

  const supabase = requireSupabaseAdmin()

  const { data: property } = await supabase
    .from("properties")
    .select("slug")
    .eq("owner_user_id", userId)
    .maybeSingle()

  if (property?.slug) {
    await deleteHostivAccountForProperty(property.slug, userId)
  } else {
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      throw createError({
        statusCode: 502,
        message: "Impossible de supprimer le compte membre."
      })
    }
  }

  return { ok: true as const }
}

export async function getPlatformAdminMemberDetailForAdmin(
  userId: string
): Promise<PlatformAdminMemberDetail> {
  const detail = await getPlatformAdminMemberDetail(userId)

  assertNotPlatformAdminMember(detail.email)

  return detail
}

export async function getPlatformAdminMemberProfile(userId: string): Promise<HostivAccountProfile> {
  const user = await readAuthUser(userId)

  assertNotPlatformAdminMember(user.email)

  return hostivAccountProfileFromUser(user)
}

export async function updatePlatformAdminMember(
  userId: string,
  body: HostivAccountUpdateBody
): Promise<HostivAccountProfile> {
  const user = await readAuthUser(userId)

  assertNotPlatformAdminMember(user.email)

  const { profile } = await updateHostivAccount(user, body)

  return profile
}
