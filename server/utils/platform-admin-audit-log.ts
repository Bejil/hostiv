import type { User } from "@supabase/supabase-js"
import { requireSupabaseAdmin } from "./supabase"

export type PlatformAdminAuditAction =
  | "site.delete"
  | "member.delete"
  | "member.update"
  | "promo_code.create"
  | "promo_code.update"
  | "promo_code.delete"

export type PlatformAdminAuditLogRow = {
  id: string
  actor_user_id: string | null
  actor_email: string
  action: PlatformAdminAuditAction
  target_type: string
  target_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export async function logPlatformAdminAction(input: {
  actor: User
  action: PlatformAdminAuditAction
  targetType: string
  targetId?: string | null
  metadata?: Record<string, unknown>
}) {
  const actorEmail = input.actor.email?.trim().toLowerCase()

  if (!actorEmail) {
    return
  }

  const supabase = requireSupabaseAdmin()

  const { error } = await supabase.from("platform_admin_audit_logs").insert({
    actor_user_id: input.actor.id,
    actor_email: actorEmail,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId?.trim() || null,
    metadata: input.metadata ?? {}
  })

  if (error) {
    console.error("[platform-admin-audit]", input.action, error.message)
  }
}

export async function listPlatformAdminAuditLogs(limit = 100): Promise<PlatformAdminAuditLogRow[]> {
  const safeLimit = Math.min(Math.max(Math.round(limit), 1), 200)
  const supabase = requireSupabaseAdmin()

  const { data, error } = await supabase
    .from("platform_admin_audit_logs")
    .select("id, actor_user_id, actor_email, action, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(safeLimit)

  if (error) {
    console.error("[platform-admin-audit] list:", error.message)

    throw createError({
      statusCode: 502,
      message: "Impossible de charger le journal d’audit."
    })
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    actor_user_id: typeof row.actor_user_id === "string" ? row.actor_user_id : null,
    actor_email: String(row.actor_email || ""),
    action: row.action as PlatformAdminAuditAction,
    target_type: String(row.target_type || ""),
    target_id: typeof row.target_id === "string" ? row.target_id : null,
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    created_at: String(row.created_at || "")
  }))
}
