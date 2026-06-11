import type { MaybeRefOrGetter } from "vue"
import { toValue } from "vue"
import type { AdminBookingReservation } from "../types/booking-reservation"
import type { StripeConnectStatus } from "../types/stripe-connect"
import {
  isProductionAdminHost,
  stripeConnectNeedsAttention
} from "../utils/admin-stripe-connect-attention"
import {
  isAdminCustomizationBlockId,
  isAdminTopSectionId,
  type AdminNavSectionId,
  type AdminSectionId,
  type AdminTopSectionId
} from "../data/admin-nav-sections"
import { useSupabaseClient } from "./useSupabaseClient"

export function useAdminSectionNavigation(slug: MaybeRefOrGetter<string>) {
  const route = useRoute()
  const router = useRouter()
  const editorScrollRef = ref<HTMLElement | null>(null)

  function parseRouteSections(): { menu: AdminTopSectionId; block: AdminNavSectionId | null } {
    const raw = route.query.section
    const id = (Array.isArray(raw) ? raw[0] : raw) ?? ""
    const blockRaw = route.query.block
    const blockId = (Array.isArray(blockRaw) ? blockRaw[0] : blockRaw) ?? ""
    const block = isAdminCustomizationBlockId(blockId) ? blockId : null

    if (isAdminCustomizationBlockId(id)) {
      return { menu: "customization", block: id }
    }

    if (id === "customization") {
      return { menu: "customization", block }
    }

    if (isAdminTopSectionId(id)) {
      return { menu: id, block: null }
    }

    if (block) {
      return { menu: "customization", block }
    }

    return { menu: "general", block: null }
  }

  const activeMenuSection = ref<AdminTopSectionId>(parseRouteSections().menu)
  const activeCustomizationBlock = ref<AdminNavSectionId | null>(parseRouteSections().block)
  const upcomingReservationCount = ref(0)
  const stripeConnectStatus = ref<StripeConnectStatus | null>(null)
  const stripeConnectLoading = ref(false)
  const stripeConnectLoadError = ref(false)

  const stripeConnectNeedsAttentionFlag = computed(() => {
    if (stripeConnectLoading.value) {
      return false
    }

    return stripeConnectNeedsAttention(stripeConnectStatus.value, {
      hasLoadError: stripeConnectLoadError.value,
      isProductionHost: isProductionAdminHost()
    })
  })

  function updateStripeConnectStatus(
    status: StripeConnectStatus | null,
    options?: { loadError?: boolean }
  ) {
    stripeConnectStatus.value = status
    stripeConnectLoadError.value = options?.loadError ?? false
    stripeConnectLoading.value = false
  }

  function registerEditorScrollRoot(element: HTMLElement | null) {
    editorScrollRef.value = element
  }

  function findCustomizationScrollTarget(blockId: AdminNavSectionId) {
    const root = editorScrollRef.value

    if (!root) {
      return null
    }

    const anchor = root.querySelector(`#admin-block-${blockId}`)

    if (!(anchor instanceof HTMLElement)) {
      return null
    }

    if (blockId === "template") {
      return anchor
    }

    const item = anchor.closest(".admin-customization-accordion__item")

    return item instanceof HTMLElement ? item : null
  }

  function isAccordionItemBottomVisible(item: HTMLElement, scrollRoot: HTMLElement, padding = 12) {
    const rootRect = scrollRoot.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()

    return itemRect.bottom <= rootRect.bottom - padding
  }

  function scrollToCustomizationBlock(blockId: AdminNavSectionId) {
    const root = editorScrollRef.value

    if (!root) {
      return
    }

    const target = findCustomizationScrollTarget(blockId)

    if (!target) {
      return
    }

    if (isAccordionItemBottomVisible(target, root)) {
      return
    }

    if (blockId === "template") {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }

    const trigger = target.querySelector(".admin-customization-accordion__trigger")

    if (trigger instanceof HTMLElement) {
      trigger.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  function setCustomizationBlock(blockId: AdminNavSectionId | null, options?: { scroll?: boolean }) {
    activeCustomizationBlock.value = blockId

    if (blockId && options?.scroll !== false) {
      nextTick(() => {
        window.setTimeout(() => scrollToCustomizationBlock(blockId), 220)
      })
    }
  }

  function syncCustomizationBlockQuery(blockId: AdminNavSectionId | null) {
    const query = { ...route.query, section: "customization" }

    if (blockId) {
      query.block = blockId
    } else {
      delete query.block
    }

    router.replace({ path: route.path, query })
  }

  function onCustomizationAccordionChange(blockId: AdminNavSectionId | null) {
    setCustomizationBlock(blockId)

    if (activeMenuSection.value === "customization") {
      syncCustomizationBlockQuery(blockId)
    }
  }

  function openCustomization(blockId?: AdminNavSectionId) {
    activeMenuSection.value = "customization"
    const resolved = blockId ?? activeCustomizationBlock.value ?? "header"

    setCustomizationBlock(resolved)
    syncCustomizationBlockQuery(resolved)
  }

  function selectSection(id: AdminSectionId) {
    if (id === "customization" || isAdminCustomizationBlockId(id)) {
      openCustomization(isAdminCustomizationBlockId(id) ? id : undefined)
      return
    }

    activeMenuSection.value = id
    activeCustomizationBlock.value = null

    const query = { ...route.query, section: id }
    delete query.block

    router.replace({ path: route.path, query })
  }

  watch(
    () => [route.query.section, route.query.block] as const,
    () => {
      const parsed = parseRouteSections()

      if (activeMenuSection.value !== parsed.menu) {
        activeMenuSection.value = parsed.menu
      }

      if (activeCustomizationBlock.value !== parsed.block) {
        activeCustomizationBlock.value = parsed.block
      }
    }
  )

  watch(
    () => toValue(slug),
    () => {
      void loadUpcomingReservationCount()
      void loadStripeConnectStatus()
    }
  )

  async function authHeaders(): Promise<Record<string, string>> {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function loadUpcomingReservationCount() {
    const normalizedSlug = toValue(slug).trim()

    if (!normalizedSlug) {
      upcomingReservationCount.value = 0
      return
    }

    try {
      const response = await $fetch<{ reservations: AdminBookingReservation[] }>(
        `/api/admin/${normalizedSlug}/reservations`,
        {
          headers: await authHeaders()
        }
      )

      upcomingReservationCount.value = response.reservations.filter(
        (reservation) => reservation.display_status === "upcoming"
      ).length
    } catch {
      upcomingReservationCount.value = 0
    }
  }

  async function loadStripeConnectStatus() {
    const normalizedSlug = toValue(slug).trim()

    if (!normalizedSlug) {
      updateStripeConnectStatus(null)
      return
    }

    stripeConnectLoading.value = true
    stripeConnectLoadError.value = false

    try {
      const response = await $fetch<StripeConnectStatus>(
        `/api/admin/${normalizedSlug}/stripe-connect`,
        {
          headers: await authHeaders()
        }
      )

      updateStripeConnectStatus(response)
    } catch {
      updateStripeConnectStatus(null, { loadError: true })
    }
  }

  function syncFromRouteOnMount() {
    const parsed = parseRouteSections()

    activeMenuSection.value = parsed.menu
    activeCustomizationBlock.value = parsed.block

    if (parsed.block) {
      nextTick(() => scrollToCustomizationBlock(parsed.block!))
    }

    if (!route.query.section) {
      router.replace({
        path: route.path,
        query: { ...route.query, section: parsed.menu }
      })
    }

    void loadUpcomingReservationCount()
    void loadStripeConnectStatus()
  }

  return {
    activeMenuSection,
    activeCustomizationBlock,
    upcomingReservationCount,
    stripeConnectStatus,
    stripeConnectLoading,
    stripeConnectLoadError,
    stripeConnectNeedsAttention: stripeConnectNeedsAttentionFlag,
    registerEditorScrollRoot,
    selectSection,
    openCustomization,
    setCustomizationBlock,
    onCustomizationAccordionChange,
    scrollToCustomizationBlock,
    loadUpcomingReservationCount,
    loadStripeConnectStatus,
    updateStripeConnectStatus,
    syncFromRouteOnMount
  }
}
