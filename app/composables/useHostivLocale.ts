import {
  detectHostivLocaleFromPath,
  getHostivHomePath,
  isHostivMarketingRoute,
  isHostivPasswordResetRoute,
  normalizeHostivMarketingPath,
  switchHostivLocalePath
} from "../data/hostiv-routes"
import { getHostivLanding } from "../data/hostivLanding"
import type { HostivLocale } from "../types/hostiv-locale"
import {
  HOSTIV_LOCALE_FLAGS,
  HOSTIV_LOCALE_LABELS,
  HOSTIV_LOCALES
} from "../types/hostiv-locale"
import {
  readStoredHostivLocale,
  writeStoredHostivLocale
} from "../utils/hostiv-locale-storage"

export function useHostivLocale() {
  const route = useRoute()

  const storedLocale = useState<HostivLocale>("hostiv-locale", () => "fr")

  onMounted(() => {
    if (isHostivMarketingRoute(route.path)) {
      return
    }

    const saved = readStoredHostivLocale()

    if (saved) {
      storedLocale.value = saved
    }
  })

  const locale = computed<HostivLocale>(() => {
    if (isHostivMarketingRoute(route.path)) {
      return detectHostivLocaleFromPath(route.path)
    }

    return storedLocale.value
  })

  const landing = computed(() => getHostivLanding(locale.value))

  const homePath = computed(() => getHostivHomePath(locale.value))

  watch(
    () => route.path,
    (path) => {
      if (!isHostivMarketingRoute(path)) {
        return
      }

      const pathLocale = detectHostivLocaleFromPath(path)

      storedLocale.value = pathLocale
      writeStoredHostivLocale(pathLocale)
    },
    { immediate: true }
  )

  watch(
    locale,
    (value) => {
      useHead({
        htmlAttrs: {
          lang: value
        }
      })
    },
    { immediate: true }
  )

  function switchLocale(targetLocale: HostivLocale) {
    if (targetLocale === locale.value) {
      return
    }

    storedLocale.value = targetLocale
    writeStoredHostivLocale(targetLocale)

    const path = normalizeHostivMarketingPath(route.path)

    if (!isHostivMarketingRoute(path) && !isHostivPasswordResetRoute(path)) {
      return
    }

    return navigateTo(switchHostivLocalePath(route.fullPath, targetLocale))
  }

  return {
    locale,
    landing,
    homePath,
    locales: HOSTIV_LOCALES,
    localeLabels: HOSTIV_LOCALE_LABELS,
    localeFlags: HOSTIV_LOCALE_FLAGS,
    switchLocale
  }
}
