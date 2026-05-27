/** E-mail de notification réservations (onboarding + admin). */
export function isValidBookingNotifyEmail(value: unknown): boolean {
  const mail = typeof value === "string" ? value.trim() : ""

  if (!mail || mail.length > 254 || mail.endsWith(".")) {
    return false
  }

  if (mail.includes("..") || /\s/.test(mail)) {
    return false
  }

  const at = mail.lastIndexOf("@")

  if (at <= 0 || at === mail.length - 1) {
    return false
  }

  const local = mail.slice(0, at)
  const domain = mail.slice(at + 1)

  if (!local.length || !domain.length || !domain.includes(".")) {
    return false
  }

  if (domain.startsWith(".") || domain.endsWith(".") || domain.endsWith("-")) {
    return false
  }

  const labels = domain.split(".")

  if (labels.some((label) => !label.length || label.startsWith("-") || label.endsWith("-"))) {
    return false
  }

  const tld = labels[labels.length - 1]

  if (!tld || !/^[a-zA-Z]{2,63}$/.test(tld)) {
    return false
  }

  return /^[^\s@]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,63}$/.test(
    mail
  )
}
