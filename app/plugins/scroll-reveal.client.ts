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

  return window.innerWidth <= 640 ? 120 : 168
}

function getRootMarginBottom() {
  return `-${getBottomViewportInset()}px`
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
  el.classList.add("scroll-reveal-visible")
  observers.get(el)?.disconnect()
  observers.delete(el)
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("scroll-reveal", {
    mounted(el: HTMLElement, binding) {
      const options: ScrollRevealBinding =
        typeof binding.value === "object" ? binding.value : undefined
      const threshold = options?.threshold ?? 0.1
      const delay = options?.delay ?? Number(el.dataset.revealDelay ?? DEFAULT_DELAY_MS)

      el.classList.add("scroll-reveal")
      el.style.setProperty("--scroll-reveal-delay", `${delay}ms`)

      if (prefersReducedMotion()) {
        revealElement(el)
        return
      }

      const rootMargin =
        options?.rootMargin ?? `0px 0px ${getRootMarginBottom()} 0px`

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
    },
    unmounted(el) {
      observers.get(el)?.disconnect()
      observers.delete(el)
    }
  })
})
