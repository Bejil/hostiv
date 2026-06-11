<script setup lang="ts">
import { ChevronDown } from "@lucide/vue"
import type { HostivLocale } from "../../types/hostiv-locale"

const { locale, locales, localeLabels, localeFlags, landing, switchLocale } = useHostivLocale()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const currentLabel = computed(() => localeLabels[locale.value])

function selectLocale(value: HostivLocale) {
  open.value = false
  void switchLocale(value)
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value || !rootRef.value) {
    return
  }

  if (!rootRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick)
})
</script>

<template>
  <div
    ref="rootRef"
    class="hostiv-locale-select"
    :class="{ 'hostiv-locale-select--open': open }"
  >
    <button
      type="button"
      class="hostiv-locale-select__trigger"
      :aria-label="landing.navUi.languageLabel"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click.stop="open = !open"
    >
      <span class="hostiv-locale-select__flag" aria-hidden="true">{{ localeFlags[locale] }}</span>
      <span class="hostiv-locale-select__value">{{ currentLabel }}</span>
      <ChevronDown :size="14" class="hostiv-locale-select__chevron" aria-hidden="true" />
    </button>

    <ul v-if="open" class="hostiv-locale-select__menu" role="listbox">
      <li v-for="item in locales" :key="item" role="option" :aria-selected="item === locale">
        <button
          type="button"
          class="hostiv-locale-select__option"
          :class="{ 'hostiv-locale-select__option--active': item === locale }"
          @click="selectLocale(item)"
        >
          <span class="hostiv-locale-select__flag" aria-hidden="true">{{ localeFlags[item] }}</span>
          <span>{{ localeLabels[item] }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
