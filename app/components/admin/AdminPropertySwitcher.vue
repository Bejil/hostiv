<script setup lang="ts">
import { ChevronDown } from "@lucide/vue"
import AdminIcon from "./AdminIcon.vue"
import type { HostivAccessibleProperty } from "../../types/hostiv-property"
import { writeHostivActivePropertySlug } from "../../utils/hostiv-active-property"

const props = defineProps<{
  currentSlug: string
  properties: HostivAccessibleProperty[]
  loading?: boolean
  canAddProperty?: boolean
}>()

const emit = defineEmits<{
  addProperty: []
}>()

const { ui } = useAdminUi()
const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const currentProperty = computed(
  () => props.properties.find((property) => property.slug === props.currentSlug) ?? null
)

const hasMultipleProperties = computed(() => props.properties.length > 1)

const hasMenu = computed(() => hasMultipleProperties.value || props.canAddProperty === true)

function closeMenu() {
  open.value = false
}

function toggleMenu() {
  if (!hasMenu.value) {
    return
  }

  open.value = !open.value
}

function selectProperty(slug: string) {
  if (slug === props.currentSlug) {
    closeMenu()
    return
  }

  writeHostivActivePropertySlug(slug)
  closeMenu()
  void navigateTo(`/${slug}/admin`)
}

function onAddProperty() {
  closeMenu()
  emit("addProperty")
}

function roleLabel(role: HostivAccessibleProperty["role"]) {
  return role === "owner" ? ui.value.header.roleOwner : ui.value.header.roleCohost
}

function onDocumentClick(event: MouseEvent) {
  if (!menuRef.value?.contains(event.target as Node)) {
    closeMenu()
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener("click", onDocumentClick)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener("click", onDocumentClick)
  }
})
</script>

<template>
  <div ref="menuRef" class="admin-property-switcher">
    <button
      type="button"
      class="admin-property-switcher__trigger"
      :class="{ 'admin-property-switcher__trigger--static': !hasMenu }"
      :aria-expanded="hasMenu ? open : false"
      :aria-haspopup="hasMenu ? 'menu' : undefined"
      :aria-label="ui.properties.switcherAria"
      @click="toggleMenu"
    >
      <span class="admin-property-switcher__trigger-icon" aria-hidden="true">
        <AdminIcon name="layout" :size="15" />
      </span>
      <span class="admin-property-switcher__trigger-text">
        <span class="admin-property-switcher__trigger-kicker">{{ ui.properties.switcherAria }}</span>
        <span class="admin-property-switcher__trigger-main">
          <span class="admin-property-switcher__label">
            {{ currentProperty?.brand_name || currentSlug }}
          </span>
          <span class="admin-property-switcher__slug">/{{ currentProperty?.slug || currentSlug }}</span>
        </span>
      </span>
      <ChevronDown
        v-if="hasMenu"
        class="admin-property-switcher__chevron"
        :class="{ 'admin-property-switcher__chevron--open': open }"
        :size="16"
        aria-hidden="true"
      />
    </button>

    <div v-if="open && hasMenu" class="admin-property-switcher__menu" role="menu">
      <button
        v-for="property in properties"
        :key="property.slug"
        type="button"
        role="menuitem"
        class="admin-property-switcher__item"
        :class="{ 'admin-property-switcher__item--active': property.slug === currentSlug }"
        @click="selectProperty(property.slug)"
      >
        <span class="admin-property-switcher__item-main">
          <strong>{{ property.brand_name }}</strong>
          <span class="admin-property-switcher__item-slug">/{{ property.slug }}</span>
        </span>
        <span class="admin-property-switcher__item-role">{{ roleLabel(property.role) }}</span>
      </button>

      <button
        v-if="canAddProperty"
        type="button"
        role="menuitem"
        class="admin-property-switcher__item admin-property-switcher__item--add"
        @click="onAddProperty"
      >
        <AdminIcon name="plus" :size="14" />
        {{ ui.header.addProperty }}
      </button>
    </div>
  </div>
</template>
