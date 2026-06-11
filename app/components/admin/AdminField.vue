<script setup lang="ts">
import { Languages } from "@lucide/vue"
import { adminEditorContextKey } from "../../composables/admin-editor-context"
import { useAdminFieldTranslate } from "../../composables/useAdminFieldTranslate"
import AdminFieldHelp from "./AdminFieldHelp.vue"

const TRANSLATABLE_FIELD_TYPES = new Set(["text", "email", "url", "textarea"])

const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string | number | boolean
    type?: "text" | "number" | "email" | "url" | "password" | "textarea" | "checkbox" | "date" | "time"
    step?: string | number
    min?: string | number
    max?: string | number
    rows?: number
    hint?: string
    placeholder?: string
    fullWidth?: boolean
    required?: boolean
    disabled?: boolean
    examples?: string[]
    /** Bloque copier, coller et glisser-déposer (ex. confirmation sensible). */
    preventClipboard?: boolean
    /** Affiche le bouton de traduction automatique (défaut : oui pour texte / textarea). */
    translatable?: boolean
  }>(),
  {
    type: "text",
    rows: 3,
    fullWidth: false,
    disabled: false,
    preventClipboard: false,
    translatable: true
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: string | number | boolean]
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)
const editorCtx = inject(adminEditorContextKey, null)
const { translateFieldText } = useAdminFieldTranslate()

const translating = ref(false)
const translateError = ref<string | null>(null)

const showTranslate = computed(
  () =>
    props.translatable &&
    TRANSLATABLE_FIELD_TYPES.has(props.type) &&
    !props.disabled &&
    Boolean(editorCtx?.siteEditLocale)
)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement

  if (props.type === "number") {
    emit("update:modelValue", target.value === "" ? 0 : Number(target.value))
    return
  }

  if (props.type === "checkbox") {
    emit("update:modelValue", (target as HTMLInputElement).checked)
    return
  }

  emit("update:modelValue", target.value)
}

function onClipboardEvent(event: Event) {
  if (props.preventClipboard) {
    event.preventDefault()
  }
}

watch(
  () => props.modelValue,
  () => {
    translateError.value = null
  }
)

async function onTranslate() {
  if (!editorCtx?.siteEditLocale || translating.value) {
    return
  }

  const source = String(props.modelValue ?? "").trim()

  if (!source) {
    translateError.value = ext.value.fieldTranslate.empty
    return
  }

  translating.value = true
  translateError.value = null

  try {
    const result = await translateFieldText(source, editorCtx.siteEditLocale.value)

    emit("update:modelValue", result.text)
  } catch {
    translateError.value = ext.value.fieldTranslate.error
  } finally {
    translating.value = false
  }
}
</script>

<template>
  <label
    class="admin-field"
    :class="{
      'admin-field--checkbox': type === 'checkbox',
      'admin-field--full': fullWidth
    }"
  >
    <span v-if="type !== 'checkbox'" class="admin-field__label-row">
      <span class="admin-field__label">
        {{ label }}<span v-if="required" class="admin-field__required" aria-hidden="true"> *</span>
      </span>
      <AdminFieldHelp v-if="examples?.length" :examples="examples" />
    </span>
    <div
      v-if="type === 'textarea'"
      class="admin-field__control-wrap"
      :class="{ 'admin-field__control-wrap--translate': showTranslate }"
    >
      <textarea
        class="admin-field__control"
        :rows="rows"
        :value="String(modelValue)"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="preventClipboard ? 'off' : undefined"
        @input="onInput"
        @paste="onClipboardEvent"
        @copy="onClipboardEvent"
        @cut="onClipboardEvent"
        @drop.prevent="preventClipboard"
      />
      <button
        v-if="showTranslate"
        type="button"
        class="admin-field__translate"
        :disabled="translating"
        :aria-label="ext.fieldTranslate.aria"
        :title="ext.fieldTranslate.aria"
        @click.prevent="onTranslate"
      >
        <Languages :size="14" aria-hidden="true" />
      </button>
    </div>
    <input
      v-else-if="type === 'checkbox'"
      type="checkbox"
      :checked="Boolean(modelValue)"
      @change="onInput"
    />
    <div
      v-else-if="TRANSLATABLE_FIELD_TYPES.has(type)"
      class="admin-field__control-wrap admin-field__control-wrap--input"
      :class="{ 'admin-field__control-wrap--translate': showTranslate }"
    >
      <input
        class="admin-field__control"
        :type="type"
        :value="modelValue"
        :step="step"
        :min="min"
        :max="max"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="preventClipboard ? 'off' : undefined"
        @input="onInput"
        @paste="onClipboardEvent"
        @copy="onClipboardEvent"
        @cut="onClipboardEvent"
        @drop.prevent="preventClipboard"
      />
      <button
        v-if="showTranslate"
        type="button"
        class="admin-field__translate"
        :disabled="translating"
        :aria-label="ext.fieldTranslate.aria"
        :title="ext.fieldTranslate.aria"
        @click.prevent="onTranslate"
      >
        <Languages :size="14" aria-hidden="true" />
      </button>
    </div>
    <input
      v-else
      class="admin-field__control"
      :type="type"
      :value="modelValue"
      :step="step"
      :min="min"
      :max="max"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="preventClipboard ? 'off' : undefined"
      @input="onInput"
      @paste="onClipboardEvent"
      @copy="onClipboardEvent"
      @cut="onClipboardEvent"
      @drop.prevent="preventClipboard"
    />
    <span v-if="type === 'checkbox'" class="admin-field__label-row">
      <span class="admin-field__label">
        {{ label }}<span v-if="required" class="admin-field__required" aria-hidden="true"> *</span>
      </span>
      <AdminFieldHelp v-if="examples?.length" :examples="examples" />
    </span>
    <span v-if="translateError" class="admin-field__translate-error" role="alert">
      {{ translateError }}
    </span>
    <span v-if="hint" class="admin-field__hint">{{ hint }}</span>
  </label>
</template>
