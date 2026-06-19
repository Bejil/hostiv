export const EMAIL_TAGS_WILDCARD = "*"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmailTag(value: string) {
  return value.trim().toLowerCase()
}

export function isWildcardEmailTag(value: string) {
  return normalizeEmailTag(value) === EMAIL_TAGS_WILDCARD
}

export function isValidEmailTag(value: string) {
  const normalized = normalizeEmailTag(value)

  if (!normalized) {
    return false
  }

  if (isWildcardEmailTag(normalized)) {
    return true
  }

  return EMAIL_PATTERN.test(normalized)
}

export function parseEmailTags(raw: string | null | undefined): string[] {
  if (!raw?.trim()) {
    return [EMAIL_TAGS_WILDCARD]
  }

  const parts = raw
    .split(",")
    .map((part) => normalizeEmailTag(part))
    .filter(Boolean)

  if (!parts.length) {
    return [EMAIL_TAGS_WILDCARD]
  }

  if (parts.some(isWildcardEmailTag)) {
    return [EMAIL_TAGS_WILDCARD]
  }

  return [...new Set(parts)]
}

export function joinEmailTags(tags: string[]) {
  const parsed = parseEmailTags(tags.join(", "))

  if (parsed.length === 1 && isWildcardEmailTag(parsed[0])) {
    return EMAIL_TAGS_WILDCARD
  }

  return parsed.join(", ")
}

export function emailTagExists(tags: string[], candidate: string) {
  const normalized = normalizeEmailTag(candidate)

  return tags.some((tag) => normalizeEmailTag(tag) === normalized)
}

export function addEmailTag(tags: string[], candidate: string) {
  const normalized = normalizeEmailTag(candidate)

  if (!normalized) {
    return { ok: false as const, reason: "empty" as const, tags }
  }

  if (!isValidEmailTag(normalized)) {
    return { ok: false as const, reason: "invalid" as const, tags }
  }

  if (isWildcardEmailTag(normalized)) {
    return { ok: true as const, tags: [EMAIL_TAGS_WILDCARD] }
  }

  const withoutWildcard = tags.filter((tag) => !isWildcardEmailTag(tag))

  if (emailTagExists(withoutWildcard, normalized)) {
    return { ok: false as const, reason: "duplicate" as const, tags: withoutWildcard }
  }

  return { ok: true as const, tags: [...withoutWildcard, normalized] }
}

export function removeEmailTagAt(tags: string[], index: number) {
  const next = tags.filter((_, itemIndex) => itemIndex !== index)

  return next.length ? next : [EMAIL_TAGS_WILDCARD]
}

export function isEmailAllowedByTags(allowedEmailsRaw: string, email: string) {
  const allowed = parseEmailTags(allowedEmailsRaw)
  const normalizedEmail = normalizeEmailTag(email)

  if (!normalizedEmail) {
    return false
  }

  if (allowed.length === 1 && isWildcardEmailTag(allowed[0])) {
    return true
  }

  return allowed.includes(normalizedEmail)
}
