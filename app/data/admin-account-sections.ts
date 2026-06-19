import type { HostivLocale } from "../types/hostiv-locale"
import { getAdminUi } from "./admin-ui"

export type AdminAccountViewId = "settings" | "plans" | "cohosts"

export type AdminAccountViewMeta = {
  id: AdminAccountViewId
  label: string
  description: string
  title: string
  lead: string
}

export function getAdminAccountViews(locale: HostivLocale = "fr"): AdminAccountViewMeta[] {
  return getAdminUi(locale).accountViews as AdminAccountViewMeta[]
}

export function findAdminAccountView(
  id: AdminAccountViewId,
  locale: HostivLocale = "fr"
): AdminAccountViewMeta {
  const views = getAdminAccountViews(locale)

  return (
    views.find((view) => view.id === id) ??
    views[0] ?? {
      id: "settings",
      label: "",
      description: "",
      title: "",
      lead: ""
    }
  )
}

export function isAdminAccountViewId(value: string | null | undefined): value is AdminAccountViewId {
  return value === "settings" || value === "plans" || value === "cohosts"
}
