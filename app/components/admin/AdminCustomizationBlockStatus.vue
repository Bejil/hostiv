<script setup lang="ts">
import AdminIcon from "./AdminIcon.vue"

const props = defineProps<{
  complete: boolean
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)

const statusLabel = computed(() =>
  props.complete
    ? ext.value.customization.blockStatus.complete
    : ext.value.customization.blockStatus.incomplete
)
</script>

<template>
  <span
    class="admin-customization-block-status"
    :class="
      complete
        ? 'admin-customization-block-status--complete'
        : 'admin-customization-block-status--incomplete'
    "
    :title="statusLabel"
    :aria-label="statusLabel"
  >
    <AdminIcon v-if="complete" name="check" :size="12" />
  </span>
</template>
