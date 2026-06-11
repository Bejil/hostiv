<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminField from "./AdminField.vue"
import AdminToggle from "./AdminToggle.vue"
import type { PropertyCalendarFeed } from "../../types/property-site"

const props = defineProps<{
  open: boolean
  feed: PropertyCalendarFeed
  isNew?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [value: PropertyCalendarFeed]
}>()

const { ui } = useAdminUi()

const draft = ref<PropertyCalendarFeed>({ ...props.feed })

const canSave = computed(() => Boolean(draft.value.name.trim() && draft.value.url.trim()))

const modalTitle = computed(() => (props.isNew ? ui.value.ics.addTitle : ui.value.ics.editTitle))

const modalSubtitle = computed(() => draft.value.name.trim() || ui.value.ics.namePlaceholder)

watch(
  () => [props.open, props.feed] as const,
  ([isOpen, feed]) => {
    if (isOpen) {
      draft.value = { ...feed }
    }
  },
  { immediate: true, deep: true }
)

function onBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("close")
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) {
    emit("close")
  }
}

function patchDraft(partial: Partial<PropertyCalendarFeed>) {
  draft.value = { ...draft.value, ...partial }
}

function save() {
  if (!canSave.value) {
    return
  }

  emit("save", { ...draft.value })
  emit("close")
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--ics-calendar-edit"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--ics-calendar-edit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-ics-calendar-edit-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" :aria-label="ui.common.close" @click="emit('close')">
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="admin-ics-calendar-edit-title" class="hostiv-modal__title">
                  {{ modalTitle }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ modalSubtitle }}
                </p>
              </div>
            </header>

            <div class="admin-ics-calendar-modal__fields">
              <div class="admin-ics-calendar-modal__field-row">
                <AdminField
                  :label="ui.ics.nameLabel"
                  required
                  :model-value="draft.name"
                  :placeholder="ui.ics.nameFieldPlaceholder"
                  @update:model-value="patchDraft({ name: $event as string })"
                />
                <AdminField
                  :label="ui.ics.urlLabel"
                  required
                  :model-value="draft.url"
                  type="url"
                  :placeholder="ui.ics.urlPlaceholder"
                  @update:model-value="patchDraft({ url: $event as string })"
                />
              </div>
              <AdminToggle
                :model-value="draft.enabled"
                :label="ui.ics.activeLabel"
                :hint="ui.ics.activeHint"
                @update:model-value="patchDraft({ enabled: $event })"
              />
            </div>

            <p v-if="!canSave" class="admin-ics-calendar-modal__hint">
              {{ ui.ics.requiredHint }}
            </p>

            <footer class="admin-ics-calendar-modal__footer">
              <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="emit('close')">
                {{ ui.common.cancel }}
              </button>
              <button
                type="button"
                class="hostiv-btn hostiv-btn--primary"
                :disabled="!canSave"
                @click="save"
              >
                {{ ui.common.save }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
