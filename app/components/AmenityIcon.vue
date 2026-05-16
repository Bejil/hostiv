<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <svg
    class="amenity-icon-svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'wifi'">
      <path d="M5 12.55a11 11 0 0 1 14 0" />
      <path d="M8.5 16.15a6 6 0 0 1 7 0" />
      <path d="M12 20h.01" />
    </template>
    <template v-else-if="name === 'heat'">
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </template>
    <template v-else-if="name === 'fireplace'">
      <path d="M12 3c2 3 4 4.5 4 7a4 4 0 1 1-8 0c0-2.5 2-4 4-7Z" />
    </template>
    <template v-else-if="name === 'water'">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </template>
    <template v-else-if="name === 'door'">
      <path d="M13 4h3a2 2 0 0 1 2 2v14" />
      <path d="M3 8h10v13H3z" />
      <path d="M7 12h.01" />
    </template>
    <template v-else-if="name === 'desk'">
      <path d="M4 10h16" />
      <path d="M6 10V4h12v6" />
      <path d="M8 20h8" />
      <path d="M12 10v10" />
    </template>
    <template v-else-if="name === 'audio'">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </template>
    <template v-else-if="name === 'blinds'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18" />
    </template>
    <template v-else-if="name === 'window'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 3v18M3 12h18" />
    </template>
    <template v-else-if="name === 'plug'">
      <path d="M12 22v-5" />
      <path d="M9 8V2M15 8V2" />
      <path d="M6 8h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z" />
    </template>
    <template v-else-if="name === 'coffee' || name === 'coffee-machine'">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    </template>
    <template v-else-if="name === 'closet'">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M12 6v12" />
    </template>
    <template v-else-if="name === 'hanger'">
      <path d="M6 6h12l-4-4" />
      <path d="M12 2v20" />
    </template>
    <template v-else-if="name === 'iron'">
      <path d="M6 18h12l-2-8H8l-2 8Z" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </template>
    <template v-else-if="name === 'hairdryer'">
      <path d="M4 12h8l6-6" />
      <path d="M18 6v12" />
    </template>
    <template v-else-if="name === 'bedding'">
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
    </template>
    <template v-else-if="name === 'kitchen' || name === 'stove'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 8h2M12 8h2M17 8h2M7 12h2M12 12h2M17 12h2" />
    </template>
    <template v-else-if="name === 'oven' || name === 'microwave'">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <rect x="8" y="6" width="8" height="10" rx="1" />
    </template>
    <template v-else-if="name === 'fridge' || name === 'freezer'">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 2v20" />
    </template>
    <template v-else-if="name === 'dishwasher'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 7h10M7 12h10M7 17h6" />
    </template>
    <template v-else-if="name === 'toaster'">
      <path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6Z" />
      <path d="M7 6V4h10v2" />
    </template>
    <template v-else-if="name === 'dishes'">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
    </template>
    <template v-else-if="name === 'wine'">
      <path d="M8 22h8" />
      <path d="M12 15v7" />
      <path d="M7 2h10l1 8a5 5 0 0 1-10 0l1-8Z" />
    </template>
    <template v-else-if="name === 'basics'">
      <path d="M12 3 3 9v12h18V9l-9-6Z" />
      <path d="M9 21V9l3-2 3 2v12" />
    </template>
    <template v-else-if="name === 'dining'">
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <path d="M7 10V6M12 10V4M17 10V6" />
    </template>
    <template v-else-if="name === 'washer' || name === 'dryer' || name === 'laundry'">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="13" r="5" />
    </template>
    <template v-else-if="name === 'cleaning'">
      <path d="m9 11-6 6v3h3l6-6" />
      <path d="m20 4-5.5 5.5" />
    </template>
    <template v-else-if="name === 'crib' || name === 'highchair'">
      <path d="M4 10h16" />
      <path d="M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
      <path d="M8 20v-2M16 20v-2" />
    </template>
    <template v-else-if="name === 'changing-table'">
      <rect x="3" y="8" width="18" height="10" rx="2" />
      <path d="M7 8V5h10v3" />
    </template>
    <template v-else-if="name === 'toys' || name === 'books'">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </template>
    <template v-else-if="name === 'garden'">
      <path d="M12 22V10" />
      <path d="M6 12c-2-4-2-8 2-8s4 4 2 8" />
      <path d="M18 12c2-4 2-8-2-8s-4 4-2 8" />
    </template>
    <template v-else-if="name === 'parking'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </template>
    <template v-else-if="name === 'ev'">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </template>
    <template v-else-if="name === 'smoke' || name === 'co'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </template>
    <template v-else-if="name === 'firstaid'">
      <path d="M12 6v12M6 12h12" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </template>
  </svg>
</template>

<style scoped>
.amenity-icon-svg {
  display: block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
