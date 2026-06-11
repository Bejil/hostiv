import type { HostivLocale } from "../types/hostiv-locale"

export function useAdminFieldTranslate() {
  async function translateFieldText(text: string, targetLocale: HostivLocale) {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    return await $fetch<{ text: string }>("/api/admin/translate", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: {
        text,
        to: targetLocale
      }
    })
  }

  return { translateFieldText }
}
