<script setup lang="ts">
import AdminIcon from "./AdminIcon.vue"
import AdminPlatformIconPicker from "./AdminPlatformIconPicker.vue"
import {
  DEFAULT_PLATFORM_CUSTOM_ICON,
  DEFAULT_PLATFORM_ICON_BG,
  normalizePlatformCustomIconId,
  normalizePlatformIconBg,
  platformCustomIconLabel
} from "../../data/platform-custom-icons"
import type { AdminIconName } from "./admin-icon-types"

const props = defineProps<{
  icon?: string
  iconBg?: string
}>()

const emit = defineEmits<{
  "update:icon": [value: AdminIconName]
  "update:iconBg": [value: string]
}>()

const iconId = computed(() => normalizePlatformCustomIconId(props.icon ?? DEFAULT_PLATFORM_CUSTOM_ICON))
const iconBg = computed(() => normalizePlatformIconBg(props.iconBg ?? DEFAULT_PLATFORM_ICON_BG))

function onColorInput(event: Event) {
  emit("update:iconBg", normalizePlatformIconBg((event.target as HTMLInputElement).value))
}

function onColorTextInput(event: Event) {
  const value = (event.target as HTMLInputElement).value.trim()

  if (/^#[0-9a-f]{3,8}$/i.test(value)) {
    emit("update:iconBg", normalizePlatformIconBg(value))
  }
}
</script>

<template>
  <div class="admin-platform-custom-icon-fields">
    <AdminPlatformIconPicker
      class="admin-platform-custom-icon-fields__icon"
      :model-value="iconId"
      @update:model-value="emit('update:icon', $event)"
    />

    <div class="admin-platform-custom-icon-fields__color">
      <span class="admin-field__label">Couleur de fond</span>
      <div class="admin-platform-custom-icon-fields__color-inputs">
        <input
          class="admin-platform-custom-icon-fields__color-picker"
          type="color"
          :value="iconBg"
          aria-label="Couleur de fond de l’icône"
          @input="onColorInput"
        />
        <input
          class="admin-field__control admin-platform-custom-icon-fields__color-text"
          type="text"
          :value="iconBg"
          maxlength="7"
          spellcheck="false"
          autocapitalize="off"
          @change="onColorTextInput"
        />
      </div>
    </div>

    <div class="admin-platform-custom-icon-fields__preview-wrap">
      <span class="admin-field__label admin-platform-custom-icon-fields__preview-label">Aperçu</span>
      <div class="admin-platform-custom-icon-fields__preview" :style="{ backgroundColor: iconBg }">
        <AdminIcon :name="iconId" :size="22" />
        <span class="sr-only">{{ platformCustomIconLabel(iconId) }}</span>
      </div>
    </div>
  </div>
</template>
