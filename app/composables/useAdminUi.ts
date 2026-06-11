import { getAdminUi } from "../data/admin-ui"
import { formatAdminDate } from "../utils/admin-format-date"

export function useAdminUi() {
  const { locale } = useHostivLocale()
  const ui = computed(() => getAdminUi(locale.value))

  function formatDate(
    iso: string | null | undefined,
    options?: Intl.DateTimeFormatOptions
  ) {
    return formatAdminDate(iso, locale.value, options)
  }

  return {
    locale,
    ui,
    formatDate
  }
}
