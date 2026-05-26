export const HOSTIV_PASSWORD_MIN_LENGTH = 8

export type HostivPasswordRuleKey = "length" | "lowercase" | "uppercase" | "digit" | "special"

export const hostivPasswordRuleLabels: Record<HostivPasswordRuleKey, string> = {
  length: `Au moins ${HOSTIV_PASSWORD_MIN_LENGTH} caractères`,
  lowercase: "Une lettre minuscule",
  uppercase: "Une lettre majuscule",
  digit: "Un chiffre",
  special: "Un caractère spécial ou de ponctuation"
}

export function evaluateHostivPassword(value: string) {
  return {
    length: value.length >= HOSTIV_PASSWORD_MIN_LENGTH,
    lowercase: /[a-z]/.test(value),
    uppercase: /[A-Z]/.test(value),
    digit: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value)
  }
}

export function isHostivPasswordValid(value: string) {
  const rules = evaluateHostivPassword(value)

  return (Object.keys(rules) as HostivPasswordRuleKey[]).every((key) => rules[key])
}
