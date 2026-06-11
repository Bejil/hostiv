<script setup lang="ts">
import { ChevronDown } from "@lucide/vue"
import type { AccordionItem } from "@nuxt/ui"
import type { AdminNavSectionId } from "../../data/admin-nav-sections"
import { getAdminCustomizationBlocks } from "../../data/admin-nav-sections"
import AdminCustomizationBlockBody from "./AdminCustomizationBlockBody.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminTemplateEditor from "./AdminTemplateEditor.vue"
import AdminCustomizationBlockStatus from "./AdminCustomizationBlockStatus.vue"
import { useAdminEditorContext } from "../../composables/admin-editor-context"
import { isCustomizationBlockComplete } from "../../utils/admin-customization-block-completion"

const props = defineProps<{
  openBlockId: AdminNavSectionId | null
}>()

const emit = defineEmits<{
  "update:openBlockId": [value: AdminNavSectionId | null]
}>()

const ctx = useAdminEditorContext()
const { locale } = useAdminUi()

const customizationBlocks = computed(() => getAdminCustomizationBlocks(locale.value))

const templateBlock = computed(() =>
  customizationBlocks.value.find((block) => block.id === "template")
)

const accordionBlocks = computed(() =>
  customizationBlocks.value.filter((block) => block.id !== "template")
)

const accordionItems = computed<AccordionItem[]>(() =>
  accordionBlocks.value.map((block) => ({
    label: block.title,
    value: block.id,
    slot: block.id
  }))
)

const accordionModel = computed({
  get: () => {
    if (!props.openBlockId || props.openBlockId === "template") {
      return undefined
    }

    return props.openBlockId
  },
  set: (value: string | undefined) => {
    emit("update:openBlockId", (value as AdminNavSectionId | undefined) ?? null)
  }
})

const accordionUi = {
  root: "admin-customization-accordion",
  item: "admin-customization-accordion__item rounded-none",
  header: "admin-customization-accordion__header",
  trigger:
    "admin-customization-accordion__trigger group flex w-full items-center justify-between gap-3 rounded-none text-left font-semibold text-[var(--admin-ink)]",
  label: "admin-customization-accordion__label min-w-0 flex-1",
  trailingIcon: "hidden",
  content: "admin-customization-accordion__content",
  body: "admin-customization-accordion__body"
} as const

const blockDescriptionById = computed(() =>
  Object.fromEntries(accordionBlocks.value.map((block) => [block.id, block.description]))
)

const blockIconById = computed(() =>
  Object.fromEntries(accordionBlocks.value.map((block) => [block.id, block.icon]))
)

function isBlockComplete(blockId: AdminNavSectionId) {
  return isCustomizationBlockComplete(ctx.record.value, blockId, locale.value)
}
</script>

<template>
  <section class="admin-customization">
    <div
      v-if="templateBlock"
      id="admin-block-template"
      class="admin-customization__template"
      data-admin-customization-block="template"
    >
      <div class="admin-customization__template-card">
        <div class="admin-customization__template-intro">
          <div>
            <p class="admin-general-card__kicker">{{ templateBlock.label }}</p>
            <h3>{{ templateBlock.title }}</h3>
          </div>
          <p>{{ templateBlock.description }}</p>
        </div>
        <AdminTemplateEditor
          :model-value="ctx.record.value.content.template.id"
          @update:model-value="ctx.patchContent('template', { id: $event })"
        />
      </div>
    </div>

    <UAccordion
      v-model="accordionModel"
      :items="accordionItems"
      type="single"
      collapsible
      :unmount-on-hide="false"
      :ui="accordionUi"
    >
      <template #trailing="{ open }">
        <ChevronDown
          :size="20"
          stroke-width="2"
          class="admin-customization-accordion__chevron"
          :class="{ 'admin-customization-accordion__chevron--open': open }"
          aria-hidden="true"
        />
      </template>

      <template #default="{ item }">
        <span class="admin-customization-accordion__head">
          <span class="admin-customization-accordion__copy">
            <span class="admin-customization-accordion__title-row">
              <AdminIcon
                v-if="blockIconById[String(item.value)]"
                :name="blockIconById[String(item.value)]"
                :size="20"
                class="admin-customization-accordion__icon"
              />
              <span class="admin-customization-accordion__title">{{ item.label }}</span>
            </span>
            <span
              v-if="blockDescriptionById[String(item.value)]"
              class="admin-customization__block-lead"
            >
              {{ blockDescriptionById[String(item.value)] }}
            </span>
          </span>
          <AdminCustomizationBlockStatus
            :complete="isBlockComplete(item.value as AdminNavSectionId)"
          />
        </span>
      </template>

      <template v-for="block in accordionBlocks" :key="block.id" #[block.id]>
        <div
          :id="`admin-block-${block.id}`"
          class="admin-customization__panel"
          :data-admin-customization-block="block.id"
        >
          <AdminCustomizationBlockBody :block-id="block.id" />
        </div>
      </template>
    </UAccordion>
  </section>
</template>
