function animateCount(target: number, onUpdate: (value: number) => void, durationMs: number) {
  const start = performance.now()

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / durationMs)
    const eased = 1 - (1 - progress) ** 3

    onUpdate(Math.round(target * eased))

    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(tick)
}

export function useHostivCommissionReveal(targetPercent: number) {
  const rootRef = ref<HTMLElement | null>(null)
  const revealed = ref(false)
  const displayPercent = ref(0)

  onMounted(() => {
    const el = rootRef.value

    if (!el || import.meta.server) {
      return
    }

    const reveal = () => {
      if (revealed.value) {
        return
      }

      revealed.value = true

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        displayPercent.value = targetPercent
        return
      }

      animateCount(targetPercent, (value) => {
        displayPercent.value = value
      }, 2200)
    }

    if (el.classList.contains("scroll-reveal-visible")) {
      reveal()
      return
    }

    const observer = new MutationObserver(() => {
      if (el.classList.contains("scroll-reveal-visible")) {
        reveal()
        observer.disconnect()
      }
    })

    observer.observe(el, { attributes: true, attributeFilter: ["class"] })
  })

  return {
    rootRef,
    revealed,
    displayPercent
  }
}
