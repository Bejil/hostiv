import type { Ref } from "vue"

const ADMIN_HEADER_STICKY_TOP_VAR = "--admin-header-sticky-top"

/** Marge sous le header pour éviter tout chevauchement visuel au scroll. */
const STICKY_TOP_GAP_PX = 0

function readHeaderHeight(header: HTMLElement) {
  return header.offsetHeight
}

function applyAdminHeaderStickyTop(heightPx: number) {
  if (typeof document === "undefined" || !document.body) {
    return
  }

  document.body.style.setProperty(
    ADMIN_HEADER_STICKY_TOP_VAR,
    `${heightPx + STICKY_TOP_GAP_PX}px`
  )
}

function clearAdminHeaderStickyTop() {
  if (typeof document === "undefined" || !document.body) {
    return
  }

  document.body.style.removeProperty(ADMIN_HEADER_STICKY_TOP_VAR)
}

/** Aligne les barres sticky admin (live editor, filtres…) sous le header réel. */
export function useAdminHeaderStickyTop(headerRef?: Ref<HTMLElement | null>) {
  let resizeObserver: ResizeObserver | null = null

  function sync() {
    if (typeof document === "undefined") {
      return
    }

    const header = headerRef?.value ?? document.querySelector<HTMLElement>(".admin-page__header")

    if (!header) {
      return
    }

    applyAdminHeaderStickyTop(readHeaderHeight(header))
  }

  function observeHeader(header: HTMLElement | null) {
    resizeObserver?.disconnect()
    resizeObserver = null

    if (!header || typeof ResizeObserver === "undefined") {
      return
    }

    resizeObserver = new ResizeObserver(sync)
    resizeObserver.observe(header)
  }

  if (headerRef) {
    watch(
      headerRef,
      (header) => {
        sync()
        observeHeader(header)
      },
      { flush: "post" }
    )
  }

  onMounted(() => {
    sync()
    observeHeader(
      headerRef?.value ?? document.querySelector<HTMLElement>(".admin-page__header")
    )

    window.addEventListener("resize", sync, { passive: true })

    requestAnimationFrame(() => {
      sync()
      requestAnimationFrame(sync)
    })
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
    window.removeEventListener("resize", sync)
    clearAdminHeaderStickyTop()
  })

  return { syncAdminHeaderStickyTop: sync }
}
