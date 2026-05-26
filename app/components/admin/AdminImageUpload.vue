<script setup lang="ts">
import AdminAlert from "./AdminAlert.vue"
import AdminIcon from "./AdminIcon.vue"

const props = defineProps<{
  label: string
  modelValue: string
  defaultPath: string
  compact?: boolean
  cover?: boolean
  required?: boolean
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl?: (path: string) => string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const uploading = ref(false)
const localError = ref<string | null>(null)

const preview = computed(() => {
  if (!props.modelValue) {
    return ""
  }

  return props.previewUrl ? props.previewUrl(props.modelValue) : props.modelValue
})

/** Chemin canonique : réutilise l’asset existant ou le défaut pour écraser via upsert Storage. */
function resolveUploadPath(): string {
  const stored = props.modelValue.trim().replace(/^\/+/, "")

  if (stored) {
    return stored
  }

  return props.defaultPath.replace(/^\/+/, "")
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  localError.value = null
  uploading.value = true

  try {
    const path = resolveUploadPath()
    const result = await props.upload(file, path)

    emit("update:modelValue", result.path)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    localError.value = e.data?.message || e.message || "Échec de l’envoi."
  } finally {
    uploading.value = false
    input.value = ""
  }
}
</script>

<template>
  <div
    class="admin-image-upload"
    :class="{
      'admin-image-upload--compact': compact && !cover,
      'admin-image-upload--cover': cover
    }"
  >
    <div v-if="cover" class="admin-image-upload__canvas">
      <img
        v-if="preview"
        :src="preview"
        :alt="label"
        class="admin-image-upload__bg"
      />
      <div v-else class="admin-image-upload__bg admin-image-upload__bg--empty" aria-hidden="true" />
      <div class="admin-image-upload__scrim admin-image-upload__scrim--top" aria-hidden="true" />
      <div class="admin-image-upload__scrim admin-image-upload__scrim--bottom" aria-hidden="true" />
      <p class="admin-image-upload__label">
        {{ label }}<span v-if="required" class="admin-field__required" aria-hidden="true"> *</span>
      </p>
      <label class="admin-btn admin-btn--secondary admin-btn--sm admin-image-upload__pick">
        <input type="file" accept="image/*" hidden :disabled="uploading" @change="onFileChange" />
        <AdminIcon name="upload" :size="16" />
        {{ uploading ? "Envoi…" : "Choisir" }}
      </label>
    </div>

    <template v-else>
      <div class="admin-image-upload__top">
        <p class="admin-image-upload__label">
          {{ label }}<span v-if="required" class="admin-field__required" aria-hidden="true"> *</span>
        </p>
        <div class="admin-image-upload__preview-wrap">
          <img v-if="preview" :src="preview" :alt="label" class="admin-image-upload__preview" />
          <div v-else class="admin-image-upload__preview--empty">
            <AdminIcon name="image" :size="compact ? 20 : 28" />
          </div>
        </div>
      </div>
      <div class="admin-image-upload__actions">
        <label class="admin-btn admin-btn--secondary admin-btn--sm admin-image-upload__pick">
          <input type="file" accept="image/*" hidden :disabled="uploading" @change="onFileChange" />
          <AdminIcon name="upload" :size="16" />
          {{ uploading ? "Envoi…" : compact ? "Choisir" : "Choisir une image" }}
        </label>
      </div>
    </template>

    <AdminAlert v-if="localError" variant="error" :message="localError" />
  </div>
</template>
