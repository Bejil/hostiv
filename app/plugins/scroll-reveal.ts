type ScrollRevealBinding =
  | {
      threshold?: number
      rootMargin?: string
      delay?: number
    }
  | undefined

const DEFAULT_DELAY_MS = 160
const observers = new WeakMap<HTMLElement, IntersectionObserver>()

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getBottomViewportInset() {
  const sticky = document.querySelector<HTMLElement>(".booking-strip-sticky")

  if (sticky) {
    const rect = sticky.getBoundingClientRect()
    const obscured = window.innerHeight - rect.top

    if (obscured > 0) {
      return Math.ceil(obscured + 28)
    }
  }

  return 0
}

function getRootMarginBottom() {
  const inset = getBottomViewportInset()

  return inset > 0 ? `-${inset}px` : "0px"
}

function isClearlyVisible(el: HTMLElement, threshold: number) {
  const bottomInset = getBottomViewportInset()
  const rect = el.getBoundingClientRect()
  const viewportBottom = window.innerHeight - bottomInset
  const visibleTop = Math.max(rect.top, 0)
  const visibleBottom = Math.min(rect.bottom, viewportBottom)
  const visibleHeight = Math.max(0, visibleBottom - visibleTop)

  return visibleHeight >= rect.height * threshold && rect.top < viewportBottom
}

function revealElement(el: HTMLElement) {
  observers.get(el)?.disconnect()
  observers.delete(el)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add("scroll-reveal-visible")
    })
  })
}

function mountScrollReveal(el: HTMLElement, binding: { value?: unknown }) {
  const options: ScrollRevealBinding =
    typeof binding.value === "object" && binding.value !== null ? binding.value : undefined
  const threshold = options?.threshold ?? 0.1
  const delay = options?.delay ?? Number(el.dataset.revealDelay ?? DEFAULT_DELAY_MS)

  el.classList.remove("scroll-reveal-visible")
  el.classList.add("scroll-reveal")
  el.style.setProperty("--scroll-reveal-delay", `${delay}ms`)

  if (prefersReducedMotion()) {
    el.classList.add("scroll-reveal-visible")
    return
  }

  const bottomMargin = getRootMarginBottom()
  const rootMargin = options?.rootMargin ?? `0px 0px ${bottomMargin} 0px`

  if (isClearlyVisible(el, threshold)) {
    revealElement(el)
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          revealElement(el)
        }
      }
    },
    { threshold, rootMargin }
  )

  observer.observe(el)
  observers.set(el, observer)
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("scroll-reveal", {
    getSSRProps() {
      return { class: "scroll-reveal" }
    },
    mounted(el: HTMLElement, binding) {
      if (import.meta.server) {
        return
      }

      mountScrollReveal(el, binding)
    },
    unmounted(el) {
      if (import.meta.server) {
        return
      }

      observers.get(el)?.disconnect()
      observers.delete(el)
    }
  })
})
