<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label?: string
  hint?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
}>()
</script>

<template>
  <label class="admin-toggle" :class="{ 'admin-toggle--disabled': disabled }">
    <span v-if="label || hint">
      <span v-if="label" class="admin-toggle__label">{{ label }}</span>
      <span v-if="hint" class="admin-toggle__hint">{{ hint }}</span>
    </span>
    <span class="admin-toggle__track" :class="{ 'admin-toggle__track--on': modelValue }">
      <input
        type="checkbox"
        class="admin-toggle__input"
        :checked="modelValue"
        :disabled="disabled"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span class="admin-toggle__thumb" />
    </span>
  </label>
</template>
