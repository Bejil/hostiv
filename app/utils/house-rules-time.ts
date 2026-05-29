/** Normalise une heure saisie (libre ou `type="time"`) vers `HH:mm` (24 h). */
export function toTimeInputValue(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    return ""
  }

  const colonMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/)

  if (colonMatch) {
    const hours = Number(colonMatch[1])
    const minutes = Number(colonMatch[2])

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    }
  }

  const compactMatch = trimmed.match(/^(\d{1,2})\s*h\s*(\d{2})?/i)

  if (compactMatch) {
    const hours = Number(compactMatch[1])
    const minutes = compactMatch[2] ? Number(compactMatch[2]) : 0

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    }
  }

  return ""
}

export function hasValidHouseRuleTime(value: string): boolean {
  return Boolean(toTimeInputValue(value))
}

/** Valeur persistée après saisie dans un champ `type="time"`. */
export function fromTimeInputValue(value: string): string {
  return toTimeInputValue(value)
}

/** Affichage public avec unités (ex. « 15 h 00 »). */
export function formatHouseRuleTimeDisplay(value: string): string {
  const normalized = toTimeInputValue(value)

  if (!normalized) {
    return ""
  }

  const [hours, minutes] = normalized.split(":")

  return `${Number(hours)} h ${minutes}`
}
