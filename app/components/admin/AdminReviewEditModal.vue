<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminField from "./AdminField.vue"
import AdminFieldHelp from "./AdminFieldHelp.vue"
import type { PropertyReview } from "../../types/property-site"
import { getAdminCustomizationCardExamples } from "../../data/admin-customization-field-examples"
import { ratingToStars } from "../../utils/platform-rating-stars"

const props = defineProps<{
  open: boolean
  review: PropertyReview
  isNew?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [value: PropertyReview]
}>()

const { ui, locale } = useAdminUi()

const cardExamples = computed(() => getAdminCustomizationCardExamples(locale.value))

const draft = ref<PropertyReview>({ ...props.review })

const draftStars = computed(() => ratingToStars(draft.value.rating))

const canSave = computed(
  () => Boolean(draft.value.author.trim() && draft.value.quote.trim())
)

const modalTitle = computed(() =>
  props.isNew
    ? ui.value.editors.reviews.modal.addTitle
    : ui.value.editors.reviews.modal.editTitle
)

watch(
  () => [props.open, props.review] as const,
  ([isOpen, review]) => {
    if (isOpen) {
      draft.value = { ...review }
    }
  },
  { immediate: true, deep: true }
)

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
  if (event.key === "Escape" && props.open) {
    emit("close")
  }
}

function patchDraft(partial: Partial<PropertyReview>) {
  draft.value = { ...draft.value, ...partial }
}

function save() {
  if (!canSave.value) {
    return
  }

  emit("save", {
    ...draft.value,
    author: draft.value.author.trim(),
    date: draft.value.date.trim(),
    quote: draft.value.quote.trim(),
    rating: draft.value.rating.trim() || "5/5"
  })
  emit("close")
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--review"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--review"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-review-edit-title"
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
                <h2 id="admin-review-edit-title" class="hostiv-modal__title">
                  {{ modalTitle }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ draft.author.trim() || ui.editors.shared.noAuthor }}
                </p>
              </div>
            </header>

            <div class="admin-review-modal__fields">
              <AdminField
                :label="ui.editors.shared.author"
                required
                full-width
                :examples="[...cardExamples.reviewAuthor]"
                :model-value="draft.author"
                @update:model-value="patchDraft({ author: $event as string })"
              />
              <AdminField
                :label="ui.editors.shared.displayDate"
                full-width
                :placeholder="ui.editors.shared.datePlaceholder"
                :examples="[...cardExamples.reviewDate]"
                :model-value="draft.date"
                @update:model-value="patchDraft({ date: $event as string })"
              />
              <div class="admin-review-modal__rating-field">
                <span class="admin-field__label-row">
                  <span class="admin-field__label">{{ ui.editors.shared.rating }}</span>
                  <AdminFieldHelp :examples="[...cardExamples.reviewRating]" />
                </span>
                <div class="admin-review-modal__rating-inline">
                  <input
                    class="admin-field__control"
                    type="text"
                    :placeholder="ui.editors.shared.ratingPlaceholder"
                    :value="draft.rating"
                    @input="patchDraft({ rating: ($event.target as HTMLInputElement).value })"
                  />
                  <p
                    class="admin-review-modal__stars-display"
                    :class="{ 'admin-review-modal__stars-display--empty': !draftStars }"
                    :aria-label="ui.editors.shared.starsPreview"
                  >
                    {{ draftStars || ui.editors.shared.emptyStars }}
                  </p>
                </div>
                <span class="admin-field__hint">{{ ui.editors.shared.ratingFormatHint }}</span>
              </div>
              <AdminField
                :label="ui.editors.shared.quote"
                required
                type="textarea"
                :rows="4"
                full-width
                :examples="[...cardExamples.reviewQuote]"
                :model-value="draft.quote"
                @update:model-value="patchDraft({ quote: $event as string })"
              />
            </div>

            <p v-if="!canSave" class="admin-review-modal__hint">
              {{ ui.editors.reviews.modal.saveHint }}
            </p>

            <footer class="admin-review-modal__footer">
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
