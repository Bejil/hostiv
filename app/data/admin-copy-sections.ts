import type { HostivLocale } from "../types/hostiv-locale"
import { getAdminUi } from "./admin-ui"

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

export function getAdminCopySections(locale: HostivLocale = "fr"): AdminCopySection[] {
  return getAdminUi(locale).copy as AdminCopySection[]
}

/** @deprecated Utiliser getAdminCopySections(locale) */
export const adminCopySections = getAdminCopySections("fr")

export function adminCopyFieldExamples(
  sectionId: string,
  fieldKey: string,
  locale: HostivLocale = "fr"
): string[] {
  const section = getAdminCopySections(locale).find((item) => item.id === sectionId)
  const field = section?.fields.find((item) => item.key === fieldKey)

  return field?.examples ?? []
}
