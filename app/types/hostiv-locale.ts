export type HostivLocale = "fr" | "en"

export const HOSTIV_LOCALES: HostivLocale[] = ["fr", "en"]

export const HOSTIV_LOCALE_LABELS: Record<HostivLocale, string> = {
  fr: "FR",
  en: "EN"
}

export const HOSTIV_LOCALE_FLAGS: Record<HostivLocale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧"
}
