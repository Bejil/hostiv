const STORAGE_KEY = "tga-booking-contact"
const STORAGE_VERSION = 1

export type StoredBookingContact = {
  lastName: string
  firstName: string
  phone: string
  email: string
}

type StoredPayload = StoredBookingContact & {
  v: number
  savedAt: string
}

function isValidStoredContact(value: unknown): value is StoredBookingContact {
  if (!value || typeof value !== "object") {
    return false
  }

  const o = value as Record<string, unknown>

  return (
    typeof o.lastName === "string" &&
    typeof o.firstName === "string" &&
    typeof o.phone === "string" &&
    typeof o.email === "string" &&
    o.lastName.length >= 2 &&
    o.firstName.length >= 2 &&
    o.phone.replace(/\D/g, "").length >= 8 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email)
  )
}

function normalizeForStorage(contact: StoredBookingContact): StoredBookingContact {
  return {
    lastName: contact.lastName.trim().replace(/\s+/g, " ").slice(0, 80),
    firstName: contact.firstName.trim().replace(/\s+/g, " ").slice(0, 80),
    phone: contact.phone.replace(/\D/g, "").slice(0, 15),
    email: contact.email.trim().slice(0, 254)
  }
}

export function loadStoredBookingContact(): StoredBookingContact | null {
  if (typeof localStorage === "undefined") {
    return null
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StoredPayload

    if (parsed.v !== STORAGE_VERSION || !isValidStoredContact(parsed)) {
      return null
    }

    return {
      lastName: parsed.lastName,
      firstName: parsed.firstName,
      phone: parsed.phone,
      email: parsed.email
    }
  } catch {
    return null
  }
}

export function saveStoredBookingContact(contact: StoredBookingContact) {
  if (typeof localStorage === "undefined") {
    return
  }

  const normalized = normalizeForStorage(contact)

  if (!isValidStoredContact(normalized)) {
    return
  }

  const payload: StoredPayload = {
    v: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    ...normalized
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* quota ou mode privé */
  }
}

export function applyStoredBookingContact(
  contact: StoredBookingContact,
  targets: {
    lastName: { value: string }
    firstName: { value: string }
    phone: { value: string }
    email: { value: string }
  }
) {
  targets.lastName.value = contact.lastName
  targets.firstName.value = contact.firstName
  targets.phone.value = contact.phone
  targets.email.value = contact.email
}
