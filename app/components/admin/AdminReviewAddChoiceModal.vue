<script setup lang="ts">
import { PenLine, Quote, X } from "@lucide/vue"

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  create: []
  fromGuest: []
}>()

const { ui } = useAdminUi()

const copy = computed(() => ui.value.editors.reviews.addChoice)

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) {
      return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
  }
})

function onBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("close")
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("close")
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--review-choice"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--review-choice"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-review-add-choice-title"
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
                <h2 id="admin-review-add-choice-title" class="hostiv-modal__title">
                  {{ copy.title }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ copy.subtitle }}
                </p>
              </div>
            </header>

            <div class="admin-review-add-choice__options">
              <button type="button" class="admin-review-add-choice__option" @click="emit('create')">
                <span class="admin-review-add-choice__option-icon" aria-hidden="true">
                  <PenLine :size="22" stroke-width="2" />
                </span>
                <span class="admin-review-add-choice__option-body">
                  <strong>{{ copy.createTitle }}</strong>
                  <span>{{ copy.createDescription }}</span>
                </span>
              </button>

              <button type="button" class="admin-review-add-choice__option" @click="emit('fromGuest')">
                <span class="admin-review-add-choice__option-icon" aria-hidden="true">
                  <Quote :size="22" stroke-width="2" />
                </span>
                <span class="admin-review-add-choice__option-body">
                  <strong>{{ copy.fromGuestTitle }}</strong>
                  <span>{{ copy.fromGuestDescription }}</span>
                </span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
