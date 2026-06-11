import type { HostivLocale } from "../types/hostiv-locale"

export function adminDateLocaleTag(locale: HostivLocale) {
  return locale === "en" ? "en-GB" : "fr-FR"
}

export function formatAdminDate(
  iso: string | null | undefined,
  locale: HostivLocale,
  options?: Intl.DateTimeFormatOptions
) {
  if (!iso?.trim()) {
    return "—"
  }

  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat(adminDateLocaleTag(locale), options).format(date)
}
