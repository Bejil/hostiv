<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <svg
    class="location-highlight-icon-svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'castle'">
      <path d="M3 21h18" />
      <path d="M5 21V9l7-4 7 4v12" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 9h.01M15 9h.01" />
    </template>
    <template v-else-if="name === 'pin'">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </template>
    <template v-else-if="name === 'mall'">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </template>
    <template v-else-if="name === 'train'">
      <path d="M4 15h16M4 19h16" />
      <path d="M4 11h16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4Z" />
      <path d="M8 19v2M16 19v2M8 11h.01M16 11h.01" />
    </template>
    <template v-else-if="name === 'market'">
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M3 9l2.5-5h13L21 9" />
      <path d="M12 3v6" />
    </template>
    <template v-else-if="name === 'mobility'">
      <path d="M14 16H9m10-4h-3m-5-4H5" />
      <circle cx="7" cy="16" r="2" />
      <circle cx="17" cy="16" r="2" />
      <path d="M12 8v4" />
      <path d="M10 6h4" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="9" />
    </template>
  </svg>
</template>
