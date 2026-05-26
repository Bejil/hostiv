<script setup lang="ts">
import { ArrowUp } from "@lucide/vue"

const { scrollToTop } = useHostivScrollToTop()
const visible = ref(false)

const SCROLL_THRESHOLD = 320

function updateVisibility() {
  visible.value = window.scrollY > SCROLL_THRESHOLD
}

onMounted(() => {
  updateVisibility()
  window.addEventListener("scroll", updateVisibility, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener("scroll", updateVisibility)
})
</script>

<template>
  <Transition name="hostiv-scroll-top">
    <button
      v-show="visible"
      type="button"
      class="hostiv-scroll-top"
      aria-label="Remonter en haut de la page"
      @click="scrollToTop"
    >
      <ArrowUp :size="20" aria-hidden="true" />
    </button>
  </Transition>
</template>
