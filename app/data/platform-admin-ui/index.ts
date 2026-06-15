import { platformAdminUiEn } from "./labels.en"
import { platformAdminUiFr } from "./labels.fr"

export function getPlatformAdminUi(locale: "fr" | "en") {
  return locale === "en" ? platformAdminUiEn : platformAdminUiFr
}

export function platformAdminUiFormat(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "")
}
