export function parseRatingValue(rating: string): number | null {
  const normalized = rating.trim().replace(/,/g, ".")

  if (!normalized) {
    return null
  }

  const fractionMatch = normalized.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)

  if (fractionMatch) {
    const score = Number.parseFloat(fractionMatch[1])
    const max = Number.parseFloat(fractionMatch[2])

    if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) {
      return null
    }

    return (score / max) * 5
  }

  const singleMatch = normalized.match(/^(\d+(?:\.\d+)?)$/)

  if (!singleMatch) {
    return null
  }

  const value = Number.parseFloat(singleMatch[1])

  if (!Number.isFinite(value) || value < 0) {
    return null
  }

  // Note seule, sans dénominateur : interprétée comme une note sur 5.
  if (value <= 5) {
    return value
  }

  return null
}

/** Normalise une note stockée (legacy nombre ou texte) pour l’édition admin. */
export function normalizeReviewRatingValue(rating: unknown): string {
  if (typeof rating === "string") {
    return rating.trim()
  }

  if (typeof rating === "number" && Number.isFinite(rating) && rating > 0) {
    return formatRatingOnFive(rating)
  }

  return ""
}

/** Affiche une note sur 5 au format « x/5 » (virgule décimale à l’affichage). */
export function formatRatingOnFive(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return ""
  }

  const clamped = Math.min(5, Math.max(0, value))
  const score =
    Math.abs(clamped - Math.round(clamped)) < 0.05
      ? String(Math.round(clamped))
      : clamped.toFixed(1).replace(".", ",")

  return `${score}/5`
}

/** Convertit une note textuelle (score / max quelconque, ou note seule ≤ 5) en 5 étoiles. */
export function ratingToStars(rating: string): string {
  const valueOnFive = parseRatingValue(rating)

  if (valueOnFive === null) {
    return ""
  }

  const filled = Math.min(5, Math.max(0, Math.round(valueOnFive)))

  return `${"★".repeat(filled)}${"☆".repeat(5 - filled)}`
}
