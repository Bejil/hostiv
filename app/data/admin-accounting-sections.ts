import type { HostivLocale } from "../types/hostiv-locale"
import { getAdminUi } from "./admin-ui"

export type AdminAccountingSectionId = "pricing" | "revenue" | "payments"

export type AdminAccountingSectionMeta = {
  id: AdminAccountingSectionId
  label: string
  description: string
  title: string
  lead: string
}

export function getAdminAccountingSections(
  locale: HostivLocale = "fr"
): AdminAccountingSectionMeta[] {
  return getAdminUi(locale).accountingSections as AdminAccountingSectionMeta[]
}

/** @deprecated Utiliser getAdminAccountingSections(locale) */
export const adminAccountingSections = getAdminAccountingSections("fr")

export const adminAccountingNavItems = adminAccountingSections

export function findAdminAccountingSection(
  id: AdminAccountingSectionId,
  locale: HostivLocale = "fr"
): AdminAccountingSectionMeta {
  const sections = getAdminAccountingSections(locale)

  return (
    sections.find((section) => section.id === id) ??
    sections[0] ?? {
      id: "pricing",
      label: "",
      description: "",
      title: "",
      lead: ""
    }
  )
}

export function isAdminAccountingSectionId(
  value: string | null | undefined
): value is AdminAccountingSectionId {
  return value === "pricing" || value === "revenue" || value === "payments"
}
