export type HostivUserProfile = {
  firstName: string
  lastName: string
  fullName: string
}

export function profileFromUserMetadata(
  metadata: Record<string, unknown> | undefined
): HostivUserProfile {
  const first = String(metadata?.first_name ?? "").trim()
  const last = String(metadata?.last_name ?? "").trim()
  const fullName = String(metadata?.full_name ?? "").trim()

  if (first || last) {
    return {
      firstName: first,
      lastName: last,
      fullName: [first, last].filter(Boolean).join(" ")
    }
  }

  if (!fullName) {
    return { firstName: "", lastName: "", fullName: "" }
  }

  const parts = fullName.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return { firstName: parts[0] ?? "", lastName: "", fullName }
  }

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    fullName
  }
}

export function buildUserMetadataProfile(
  firstName: string,
  lastName: string,
  existing?: Record<string, unknown>
): Record<string, unknown> {
  const first = firstName.trim()
  const last = lastName.trim()
  const fullName = [first, last].filter(Boolean).join(" ")

  return {
    ...(existing ?? {}),
    first_name: first,
    last_name: last,
    full_name: fullName
  }
}
