<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string | number | boolean
    type?: "text" | "number" | "email" | "url" | "password" | "textarea" | "checkbox" | "date"
    step?: string | number
    min?: string | number
    max?: string | number
    rows?: number
    hint?: string
    placeholder?: string
    fullWidth?: boolean
    required?: boolean
    disabled?: boolean
    /** Bloque copier, coller et glisser-déposer (ex. confirmation sensible). */
    preventClipboard?: boolean
  }>(),
  {
    type: "text",
    rows: 3,
    fullWidth: false,
    disabled: false,
    preventClipboard: false
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: string | number | boolean]
}>()

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
</script>

<template>
  <label
    class="admin-field"
    :class="{
      'admin-field--checkbox': type === 'checkbox',
      'admin-field--full': fullWidth
    }"
  >
    <span v-if="type !== 'checkbox'" class="admin-field__label">
      {{ label }}<span v-if="required" class="admin-field__required" aria-hidden="true"> *</span>
    </span>
    <textarea
      v-if="type === 'textarea'"
      class="admin-field__control"
      :rows="rows"
      :value="String(modelValue)"
      :placeholder="placeholder"
      :autocomplete="preventClipboard ? 'off' : undefined"
      @input="onInput"
      @paste="onClipboardEvent"
      @copy="onClipboardEvent"
      @cut="onClipboardEvent"
      @drop.prevent="preventClipboard"
    />
    <input
      v-else-if="type === 'checkbox'"
      type="checkbox"
      :checked="Boolean(modelValue)"
      @change="onInput"
    />
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
    <span v-if="type === 'checkbox'" class="admin-field__label">
      {{ label }}<span v-if="required" class="admin-field__required" aria-hidden="true"> *</span>
    </span>
    <span v-if="hint" class="admin-field__hint">{{ hint }}</span>
  </label>
</template>
