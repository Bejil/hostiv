const ADMIN_SESSION_READ_TIMEOUT_MS = 8000
const ADMIN_AUTH_RETRY_ATTEMPTS = 6
const ADMIN_AUTH_RETRY_DELAY_MS = 350

/** Évite les appels API admin sans token juste après un rechargement (session Supabase pas encore prête). */
export async function readAdminAccessToken() {
  const supabase = useSupabaseClient()

  try {
    const { data } = await Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("SESSION_TIMEOUT")), ADMIN_SESSION_READ_TIMEOUT_MS)
      })
    ])

    return data.session?.access_token?.trim() || null
  } catch {
    return null
  }
}

export async function adminAuthHeaders(accessToken?: string | null) {
  const token = accessToken?.trim() || (await readAdminAccessToken())

  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Attend que la session Supabase soit prête (rechargement de page, onglet en arrière-plan). */
export async function waitForAdminAuthHeaders(
  options?: { attempts?: number; delayMs?: number }
): Promise<Record<string, string>> {
  const attempts = options?.attempts ?? ADMIN_AUTH_RETRY_ATTEMPTS
  const delayMs = options?.delayMs ?? ADMIN_AUTH_RETRY_DELAY_MS

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const headers = await adminAuthHeaders()

    if (headers.Authorization) {
      return headers
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, delayMs))
    }
  }

  return {}
}
