import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto"

const ALGORITHM = "aes-256-gcm"
const KEY_SALT = "hostiv-pending-signup-v1"

function deriveKey(secret: string) {
  return scryptSync(secret.trim(), KEY_SALT, 32)
}

export function encryptHostivPendingSignupSecret(plaintext: string, secret: string) {
  const key = deriveKey(secret)
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

export function decryptHostivPendingSignupSecret(ciphertext: string, secret: string) {
  const key = deriveKey(secret)
  const payload = Buffer.from(ciphertext, "base64")

  if (payload.length < 29) {
    throw new Error("Données chiffrées invalides.")
  }

  const iv = payload.subarray(0, 12)
  const tag = payload.subarray(12, 28)
  const encrypted = payload.subarray(28)
  const decipher = createDecipheriv(ALGORITHM, key, iv)

  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")
}

export function resolveHostivSignupEncryptionSecret(config: {
  hostivSignupEncryptionKey?: string
  supabaseServiceRoleKey?: string
}) {
  const dedicated = String(config.hostivSignupEncryptionKey || "").trim()

  if (dedicated) {
    return dedicated
  }

  const fallback = String(config.supabaseServiceRoleKey || "").trim()

  if (!fallback) {
    throw createError({
      statusCode: 503,
      message: "Chiffrement inscription non configuré."
    })
  }

  return fallback
}
