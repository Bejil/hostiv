<script setup lang="ts">
import { X } from "@lucide/vue"
import { adminUiFormat } from "../../data/admin-ui"
import { getAdminSeoKeywordSuggestions } from "../../data/admin-seo-field-examples"
import type { HostivLocale } from "../../types/hostiv-locale"
import AdminSeoKeywordsLimitModal from "./AdminSeoKeywordsLimitModal.vue"
import {
  SEO_KEYWORDS_MAX_COUNT,
  addSeoKeyword,
  joinSeoKeywords,
  normalizeSeoKeyword,
  parseSeoKeywords,
  removeSeoKeywordAt,
  seoKeywordExists
} from "../../utils/seo-keywords"

const props = defineProps<{
  modelValue: string
  label?: string
  hint?: string
  /** Langue des suggestions (indépendante de la langue de l’admin). */
  keywordLocale?: HostivLocale
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const { ui } = useAdminUi()
const suggestionLocale = computed(() => props.keywordLocale ?? "fr")
const ext = computed(() => ui.value.extended)

const inputRef = ref<HTMLInputElement | null>(null)
const draft = ref("")
const limitModalOpen = ref(false)

const keywords = computed({
  get: () => parseSeoKeywords(props.modelValue),
  set: (value: string[]) => {
    emit("update:modelValue", joinSeoKeywords(value))
  }
})

const remainingCount = computed(() => Math.max(0, SEO_KEYWORDS_MAX_COUNT - keywords.value.length))

const fieldLabel = computed(() => props.label ?? ext.value.seoKeywords.label)

const fieldHint = computed(
  () =>
    props.hint ??
    adminUiFormat(ext.value.seoKeywords.hint, {
      max: SEO_KEYWORDS_MAX_COUNT,
      remaining: remainingCount.value
    })
)

const inputPlaceholder = computed(() => {
  if (keywords.value.length) {
    return remainingCount.value
      ? ext.value.seoKeywords.placeholder.add
      : ext.value.seoKeywords.placeholder.limit
  }

  return ext.value.seoKeywords.placeholder.empty
})

const visibleSuggestions = computed(() =>
  getAdminSeoKeywordSuggestions(suggestionLocale.value).filter(
    (suggestion) => !seoKeywordExists(keywords.value, suggestion)
  )
)

function focusInput() {
  inputRef.value?.focus()
}

function openLimitModal() {
  limitModalOpen.value = true
}

function tryAddCandidate(candidate: string) {
  const result = addSeoKeyword(keywords.value, candidate)

  if (result.ok) {
    keywords.value = result.keywords
    draft.value = ""
    return true
  }

  if (result.reason === "limit") {
    openLimitModal()
  }

  return false
}

function commitDraft() {
  if (!draft.value.trim()) {
    return
  }

  tryAddCandidate(draft.value)
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value

  if (!value.includes(",")) {
    draft.value = value
    return
  }

  const parts = value.split(",")
  draft.value = ""

  for (const part of parts) {
    if (!part.trim() && parts.length > 1) {
      continue
    }

    if (!tryAddCandidate(part) && part.trim()) {
      draft.value = normalizeSeoKeyword(part)
      break
    }
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === ",") {
    event.preventDefault()
    commitDraft()
    return
  }

  if (event.key === "Backspace" && !draft.value && keywords.value.length) {
    keywords.value = removeSeoKeywordAt(keywords.value, keywords.value.length - 1)
  }
}

function removeKeyword(index: number) {
  keywords.value = removeSeoKeywordAt(keywords.value, index)
}

function addSuggestion(suggestion: string) {
  tryAddCandidate(suggestion)
  focusInput()
}
</script>

<template>
  <div class="admin-seo-keywords-field">
    <label class="admin-field admin-field--full">
      <span class="admin-field__label">{{ fieldLabel }}</span>

      <div class="admin-seo-keywords-field__control" @click="focusInput">
        <ul
          v-if="keywords.length"
          class="admin-seo-keywords-field__chips"
          :aria-label="ext.seoKeywords.chipsAria"
        >
          <li v-for="(keyword, index) in keywords" :key="`${keyword}-${index}`">
            <span class="admin-seo-keywords-field__chip">
              {{ keyword }}
              <button
                type="button"
                class="admin-seo-keywords-field__chip-remove"
                :aria-label="adminUiFormat(ext.seoKeywords.removeChip, { keyword })"
                @click.stop="removeKeyword(index)"
              >
                <X :size="12" stroke-width="2.5" />
              </button>
            </span>
          </li>
        </ul>

        <input
          ref="inputRef"
          class="admin-seo-keywords-field__input"
          type="text"
          :value="draft"
          :placeholder="inputPlaceholder"
          :disabled="!remainingCount"
          autocomplete="off"
          @input="onInput"
          @keydown="onKeydown"
          @blur="commitDraft"
        />
      </div>

      <span class="admin-field__hint">
        {{ fieldHint }}
      </span>
    </label>

    <div v-if="visibleSuggestions.length" class="admin-seo-keywords-field__suggestions">
      <p class="admin-seo-keywords-field__suggestions-label">
        {{ ext.seoKeywords.suggestionsLabel }}
      </p>
      <ul class="admin-seo-keywords-field__suggestion-list">
        <li v-for="suggestion in visibleSuggestions" :key="suggestion">
          <button
            type="button"
            class="admin-seo-keywords-field__suggestion-pill"
            :disabled="!remainingCount"
            @click="addSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </li>
      </ul>
    </div>

    <AdminSeoKeywordsLimitModal :open="limitModalOpen" @close="limitModalOpen = false" />
  </div>
</template>
