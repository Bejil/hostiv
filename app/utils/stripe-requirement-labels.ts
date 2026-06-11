import type { HostivLocale } from "../types/hostiv-locale"

const STRIPE_REQUIREMENT_LABELS_FR: Record<string, string> = {
  "individual.address.city": "Ville",
  "individual.address.line1": "Adresse",
  "individual.address.postal_code": "Code postal",
  "individual.dob.day": "Date de naissance (jour)",
  "individual.dob.month": "Date de naissance (mois)",
  "individual.dob.year": "Date de naissance (année)",
  "individual.email": "Adresse e-mail",
  "individual.first_name": "Prénom",
  "individual.last_name": "Nom",
  "individual.phone": "Numéro de téléphone",
  "individual.verification.additional_document": "Document complémentaire",
  "individual.verification.document": "Pièce d'identité",
  "individual.id_number": "Numéro d'identité",
  "business_profile.mcc": "Catégorie d'activité",
  "business_profile.url": "Site web",
  "business_profile.product_description": "Description de l'activité",
  "external_account": "Compte bancaire (RIB)",
  "tos_acceptance.date": "Acceptation des conditions Stripe",
  "tos_acceptance.ip": "Acceptation des conditions Stripe",
  "company.address.city": "Ville (entreprise)",
  "company.address.line1": "Adresse (entreprise)",
  "company.address.postal_code": "Code postal (entreprise)",
  "company.name": "Raison sociale",
  "company.phone": "Téléphone (entreprise)",
  "company.tax_id": "Numéro SIRET / TVA"
}

const STRIPE_REQUIREMENT_LABELS_EN: Record<string, string> = {
  "individual.address.city": "City",
  "individual.address.line1": "Address",
  "individual.address.postal_code": "Postal code",
  "individual.dob.day": "Date of birth (day)",
  "individual.dob.month": "Date of birth (month)",
  "individual.dob.year": "Date of birth (year)",
  "individual.email": "Email address",
  "individual.first_name": "First name",
  "individual.last_name": "Last name",
  "individual.phone": "Phone number",
  "individual.verification.additional_document": "Additional document",
  "individual.verification.document": "Identity document",
  "individual.id_number": "ID number",
  "business_profile.mcc": "Business category",
  "business_profile.url": "Website",
  "business_profile.product_description": "Business description",
  "external_account": "Bank account",
  "tos_acceptance.date": "Stripe terms acceptance",
  "tos_acceptance.ip": "Stripe terms acceptance",
  "company.address.city": "City (company)",
  "company.address.line1": "Address (company)",
  "company.address.postal_code": "Postal code (company)",
  "company.name": "Company name",
  "company.phone": "Phone (company)",
  "company.tax_id": "Company tax ID"
}

function labelsForLocale(locale: HostivLocale) {
  return locale === "en" ? STRIPE_REQUIREMENT_LABELS_EN : STRIPE_REQUIREMENT_LABELS_FR
}

function humanizeStripeRequirementKey(key: string) {
  return key
    .replace(/\./g, " — ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function labelStripeRequirement(key: string, locale: HostivLocale = "fr") {
  const normalized = key.trim()

  if (!normalized) {
    return ""
  }

  const labels = labelsForLocale(locale)

  return labels[normalized] ?? humanizeStripeRequirementKey(normalized)
}

export function labelStripeRequirements(keys: string[], locale: HostivLocale = "fr") {
  return keys.map((key) => labelStripeRequirement(key, locale)).filter(Boolean)
}
