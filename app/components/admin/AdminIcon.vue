<script setup lang="ts">
const props = defineProps<{
  name:
    | "settings"
    | "image"
    | "calendar"
    | "card"
    | "map"
    | "text"
    | "layout"
    | "list"
    | "mail"
    | "external"
    | "logout"
    | "save"
    | "check"
    | "alert"
    | "plus"
    | "trash"
    | "upload"
    | "eye"
    | "hestia"
    | "search"
    | "heart"
    | "star"
    | "user"
    | "quote"
  size?: number
}>()

const size = computed(() => props.size ?? 18)
</script>

<template>
  <svg
    class="admin-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </template>
    <template v-else-if="name === 'image'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </template>
    <template v-else-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </template>
    <template v-else-if="name === 'card'">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </template>
    <template v-else-if="name === 'map'">
      <path d="M9 18 3 20V6l6-2 6 2 6-2v14l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </template>
    <template v-else-if="name === 'text'">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </template>
    <template v-else-if="name === 'layout'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </template>
    <template v-else-if="name === 'list'">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </template>
    <template v-else-if="name === 'mail'">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </template>
    <template v-else-if="name === 'external'">
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </template>
    <template v-else-if="name === 'logout'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </template>
    <template v-else-if="name === 'save'">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="M20 6 9 17l-5-5" />
    </template>
    <template v-else-if="name === 'alert'">
      <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </template>
    <template v-else-if="name === 'plus'">
      <path d="M12 5v14M5 12h14" />
    </template>
    <template v-else-if="name === 'trash'">
      <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </template>
    <template v-else-if="name === 'upload'">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </template>
    <template v-else-if="name === 'eye'">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </template>
    <template v-else-if="name === 'hestia'">
      <path d="M12 2 4 7v10l8 5 8-5V7l-8-5Z" />
      <path d="M12 12v10M12 12 4 7M12 12l8-5" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </template>
    <template v-else-if="name === 'heart'">
      <path
        d="M12 21s-6.5-4.35-9-8.35C1.5 9.5 3 5.5 6.5 5.5c2 0 3.5 1.5 5.5 4 2-2.5 3.5-4 5.5-4 3.5 0 5 4 2.5 7.15C18.5 16.65 12 21 12 21Z"
      />
    </template>
    <template v-else-if="name === 'star'">
      <path
        d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2Z"
      />
    </template>
    <template v-else-if="name === 'user'">
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </template>
    <template v-else-if="name === 'quote'">
      <path d="M7.5 12H4a4 4 0 0 1 0-8h1.5M16.5 12H13a4 4 0 0 1 0-8h1.5M7.5 20H6a4 4 0 0 1 0-8h1.5M16.5 20H15a4 4 0 0 1 0-8h1.5" />
    </template>
  </svg>
</template>
