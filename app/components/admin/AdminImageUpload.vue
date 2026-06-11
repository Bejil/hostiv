<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import AdminAlert from "./AdminAlert.vue"
import AdminFieldHelp from "./AdminFieldHelp.vue"
import AdminIcon from "./AdminIcon.vue"
import { appendAssetCacheRevision } from "../../utils/property-asset-url"

const props = defineProps<{
  label: string
  modelValue: string
  defaultPath: string
  compact?: boolean
  cover?: boolean
  /** Cover plein cadre sans bandeaux label / bouton — clic sur l’image pour remplacer. */
  coverTile?: boolean
  required?: boolean
  examples?: string[]
  upload: (file: File, path: string) => Promise<{ path: string; publicUrl: string }>
  previewUrl?: (path: string) => string
  /** Aperçu si `modelValue` est vide (ex. image hero du site). */
  fallbackPreviewPath?: string
  /** Incrémenter après upload pour rafraîchir l’aperçu (même chemin Storage). */
  previewRevision?: number
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
  uploaded: []
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)

const uploading = ref(false)
const localError = ref<string | null>(null)
/** Incrémenté à chaque upload réussi (même chemin Storage, cache navigateur agressif). */
const localPreviewRevision = ref(0)
/** URL affichée immédiatement après upload, avant propagation du modelValue parent. */
const uploadedPreviewSrc = ref<string | null>(null)

function previewCacheToken() {
  const global = props.previewRevision ?? 0
  const local = localPreviewRevision.value

  if (global <= 0 && local <= 0) {
    return undefined
  }

  return `${global}-${local}`
}

const previewPath = computed(
  () => props.modelValue.trim() || props.fallbackPreviewPath?.trim() || ""
)

const preview = computed(() => {
  if (uploadedPreviewSrc.value) {
    return uploadedPreviewSrc.value
  }

  if (!previewPath.value) {
    return ""
  }

  const base = props.previewUrl ? props.previewUrl(previewPath.value) : previewPath.value

  return appendAssetCacheRevision(base, previewCacheToken())
})

/** Évite d’effacer l’aperçu post-upload quand le parent propage le même chemin. */
const pendingUploadedPath = ref<string | null>(null)

watch(
  () => [props.modelValue, props.fallbackPreviewPath] as const,
  ([modelValue]) => {
    const trimmed = modelValue.trim()
    const pending = pendingUploadedPath.value?.trim()

    if (pending && trimmed === pending) {
      pendingUploadedPath.value = null
      uploadedPreviewSrc.value = null
      return
    }

    uploadedPreviewSrc.value = null
  }
)

/** Chemin canonique : réutilise l’asset dédié ou le défaut — jamais le repli visuel (hero, etc.). */
function resolveUploadPath(): string {
  const stored = props.modelValue.trim().replace(/^\/+/, "")
  const fallback = props.fallbackPreviewPath?.trim().replace(/^\/+/, "") ?? ""

  if (stored && (!fallback || stored !== fallback)) {
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

    localPreviewRevision.value += 1
    pendingUploadedPath.value = result.path

    const immediateBase =
      result.publicUrl?.trim() ||
      (props.previewUrl ? props.previewUrl(result.path) : result.path)

    uploadedPreviewSrc.value = appendAssetCacheRevision(immediateBase, previewCacheToken())

    emit("update:modelValue", result.path)
    emit("uploaded")
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    localError.value = e.data?.message || e.message || ext.value.imageUpload.uploadFailed
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
      'admin-image-upload--cover': cover,
      'admin-image-upload--cover-tile': cover && coverTile
    }"
  >
    <label
      v-if="cover && coverTile"
      class="admin-image-upload__canvas admin-image-upload__canvas--tile"
      :aria-label="
        uploading
          ? adminUiFormat(ext.imageUpload.ariaUploading, { label })
          : adminUiFormat(ext.imageUpload.ariaReplace, { label })
      "
    >
      <input type="file" accept="image/*" hidden :disabled="uploading" @change="onFileChange" />
      <img
        v-if="preview"
        :key="preview"
        :src="preview"
        :alt="label"
        class="admin-image-upload__bg"
      />
      <div v-else class="admin-image-upload__bg admin-image-upload__bg--empty" aria-hidden="true">
        <AdminIcon name="image" :size="22" />
      </div>
      <span class="admin-image-upload__tile-overlay" aria-hidden="true">
        <AdminIcon name="upload" :size="16" />
      </span>
    </label>

    <div v-else-if="cover" class="admin-image-upload__canvas">
      <img
        v-if="preview"
        :key="preview"
        :src="preview"
        :alt="label"
        class="admin-image-upload__bg"
      />
      <div v-else class="admin-image-upload__bg admin-image-upload__bg--empty" aria-hidden="true" />
      <div class="admin-image-upload__scrim admin-image-upload__scrim--top" aria-hidden="true" />
      <div class="admin-image-upload__scrim admin-image-upload__scrim--bottom" aria-hidden="true" />
      <p class="admin-image-upload__label">
        <span class="admin-image-upload__label-text">
          {{ label }}<span v-if="required" class="admin-field__required" aria-hidden="true"> *</span>
        </span>
        <AdminFieldHelp v-if="examples?.length" on-dark :examples="examples" />
      </p>
      <label class="admin-btn admin-btn--secondary admin-btn--sm admin-image-upload__pick">
        <input type="file" accept="image/*" hidden :disabled="uploading" @change="onFileChange" />
        <AdminIcon name="upload" :size="16" />
        {{ uploading ? ext.imageUpload.uploading : ext.imageUpload.choose }}
      </label>
    </div>

    <template v-else>
      <div class="admin-image-upload__top">
        <p class="admin-image-upload__label">
          <span class="admin-image-upload__label-text">
            {{ label }}<span v-if="required" class="admin-field__required" aria-hidden="true"> *</span>
          </span>
          <AdminFieldHelp v-if="examples?.length" :examples="examples" />
        </p>
        <div class="admin-image-upload__preview-wrap">
          <img
            v-if="preview"
            :key="preview"
            :src="preview"
            :alt="label"
            class="admin-image-upload__preview"
          />
          <div v-else class="admin-image-upload__preview--empty">
            <AdminIcon name="image" :size="compact ? 20 : 28" />
          </div>
        </div>
      </div>
      <div class="admin-image-upload__actions">
        <label class="admin-btn admin-btn--secondary admin-btn--sm admin-image-upload__pick">
          <input type="file" accept="image/*" hidden :disabled="uploading" @change="onFileChange" />
          <AdminIcon name="upload" :size="16" />
          {{ uploading ? ext.imageUpload.uploading : compact ? ext.imageUpload.choose : ext.imageUpload.chooseImage }}
        </label>
      </div>
    </template>

    <AdminAlert v-if="localError" variant="error" :message="localError" />
  </div>
</template>
