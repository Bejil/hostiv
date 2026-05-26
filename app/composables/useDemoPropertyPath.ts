/** Chemin du site démo location (ex. `/thegrandappartement` ou `/mon-slug`). */
export function useDemoPropertyPath() {
  const config = useRuntimeConfig()
  const slug = String(config.public.demoPropertySlug || "thegrandappartement").replace(/^\/+|\/+$/g, "")

  return computed(() => `/${slug}`)
}
