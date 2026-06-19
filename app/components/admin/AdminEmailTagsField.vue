<script setup lang="ts">
import { X } from "@lucide/vue"
import {
  EMAIL_TAGS_WILDCARD,
  addEmailTag,
  joinEmailTags,
  parseEmailTags,
  removeEmailTagAt
} from "../../utils/email-tags"

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    hint?: string
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const { ui } = usePlatformAdminUi()

const inputRef = ref<HTMLInputElement | null>(null)
const draft = ref("")
const fieldError = ref("")

const tags = computed({
  get: () => parseEmailTags(props.modelValue),
  set: (value: string[]) => {
    emit("update:modelValue", joinEmailTags(value))
  }
})

const fieldLabel = computed(() => props.label ?? ui.value.promoCodes.fields.allowedEmails)
const fieldHint = computed(() => props.hint ?? ui.value.promoCodes.fields.allowedEmailsHint)

const inputPlaceholder = computed(() => {
  if (tags.value.length === 1 && tags.value[0] === EMAIL_TAGS_WILDCARD) {
    return ui.value.promoCodes.fields.allowedEmailsPlaceholderWildcard
  }

  return ui.value.promoCodes.fields.allowedEmailsPlaceholder
})

function focusInput() {
  if (!props.disabled) {
    inputRef.value?.focus()
  }
}

function tryAddCandidate(candidate: string) {
  fieldError.value = ""
  const result = addEmailTag(tags.value, candidate)

  if (result.ok) {
    tags.value = result.tags
    draft.value = ""
    return true
  }

  if (result.reason === "invalid") {
    fieldError.value = ui.value.promoCodes.fields.allowedEmailsInvalid
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
      draft.value = part.trim()
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

  if (event.key === "Backspace" && !draft.value && tags.value.length) {
    tags.value = removeEmailTagAt(tags.value, tags.value.length - 1)
  }
}

function removeTag(index: number) {
  tags.value = removeEmailTagAt(tags.value, index)
}
</script>

<template>
  <div class="admin-seo-keywords-field">
    <label class="admin-field admin-field--full">
      <span class="admin-field__label">{{ fieldLabel }}</span>

      <div
        class="admin-seo-keywords-field__control"
        :class="{ 'admin-seo-keywords-field__control--disabled': disabled }"
        @click="focusInput"
      >
        <ul
          v-if="tags.length"
          class="admin-seo-keywords-field__chips"
          :aria-label="fieldLabel"
        >
          <li v-for="(tag, index) in tags" :key="`${tag}-${index}`">
            <span class="admin-seo-keywords-field__chip">
              {{ tag }}
              <button
                type="button"
                class="admin-seo-keywords-field__chip-remove"
                :disabled="disabled"
                :aria-label="ui.promoCodes.fields.removeEmailTag"
                @click.stop="removeTag(index)"
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
          :disabled="disabled"
          autocomplete="off"
          @input="onInput"
          @keydown="onKeydown"
          @blur="commitDraft"
        />
      </div>

      <span class="admin-field__hint">{{ fieldHint }}</span>
      <span v-if="fieldError" class="admin-field__hint admin-field__hint--error">{{ fieldError }}</span>
    </label>
  </div>
</template>
