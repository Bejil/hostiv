<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminField from "./AdminField.vue"
import AdminPlatformCustomIconFields from "./AdminPlatformCustomIconFields.vue"
import AdminToggle from "./AdminToggle.vue"
import type { PropertyPlatformLink } from "../../types/property-site"
import { ratingToStars } from "../../utils/platform-rating-stars"
import type { AdminIconName } from "./admin-icon-types"

const props = defineProps<{
  open: boolean
  link: PropertyPlatformLink
  isPreset: boolean
  isNew?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [value: PropertyPlatformLink]
}>()

const draft = ref<PropertyPlatformLink>({ ...props.link })

const draftStars = computed(() => ratingToStars(draft.value.rating))

const canSave = computed(() => Boolean(draft.value.name.trim() && draft.value.rating.trim()))

const visibilityHint = computed(() =>
  props.isPreset
    ? "Activez lorsque votre annonce est publiée sur cette plateforme"
    : "Désactivez pour masquer cette plateforme sur le site public"
)

watch(
  () => [props.open, props.link] as const,
  ([isOpen, link]) => {
    if (isOpen) {
      draft.value = { ...link }
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

function patchDraft(partial: Partial<PropertyPlatformLink>) {
  const next: Partial<PropertyPlatformLink> = { ...partial }

  if ("rating" in partial) {
    next.stars = ratingToStars(String(partial.rating ?? ""))
  }

  draft.value = { ...draft.value, ...next }
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
        class="hostiv-modal hostiv-modal--platform-link"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--platform-link"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-platform-link-edit-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" aria-label="Fermer" @click="emit('close')">
              <span class="sr-only">Fermer</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="admin-platform-link-edit-title" class="hostiv-modal__title">
                  {{
                    isNew
                      ? "Ajouter une plateforme"
                      : isPreset
                        ? "Modifier la plateforme"
                        : "Modifier la plateforme personnalisée"
                  }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ draft.name || "Sans nom" }}
                </p>
              </div>
            </header>

            <div class="admin-platform-link-modal__fields">
              <AdminToggle
                :model-value="!draft.hidden"
                label="Afficher sur le site"
                :hint="visibilityHint"
                @update:model-value="patchDraft({ hidden: !$event })"
              />
              <AdminField
                label="Nom"
                required
                :model-value="draft.name"
                full-width
                @update:model-value="patchDraft({ name: $event as string })"
              />
              <div class="admin-platform-links__rating-field">
                <span class="admin-field__label">
                  Note<span class="admin-field__required" aria-hidden="true"> *</span>
                </span>
                <div class="admin-platform-links__rating-inline">
                  <input
                    class="admin-field__control"
                    type="text"
                    :value="draft.rating"
                    @input="patchDraft({ rating: ($event.target as HTMLInputElement).value })"
                  />
                  <p
                    class="admin-platform-links__stars-display"
                    :class="{ 'admin-platform-links__stars-display--empty': !draftStars }"
                    aria-label="Aperçu des étoiles"
                  >
                    {{ draftStars || "☆☆☆☆☆" }}
                  </p>
                </div>
                <span class="admin-field__hint">
                  Toute note au format score / max (ex. 4,97/5, 9/10) est convertie sur 5 étoiles
                </span>
              </div>
              <AdminPlatformCustomIconFields
                v-if="!isPreset"
                :icon="draft.icon"
                :icon-bg="draft.icon_bg"
                @update:icon="patchDraft({ icon: $event as AdminIconName })"
                @update:icon-bg="patchDraft({ icon_bg: $event })"
              />
              <AdminField
                label="URL"
                :model-value="draft.url"
                type="url"
                full-width
                @update:model-value="patchDraft({ url: $event as string })"
              />
            </div>

            <p v-if="!canSave" class="admin-platform-link-modal__hint">
              Le nom et la note sont obligatoires pour enregistrer.
            </p>

            <footer class="admin-platform-link-modal__footer">
              <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="emit('close')">
                Annuler
              </button>
              <button
                type="button"
                class="hostiv-btn hostiv-btn--primary"
                :disabled="!canSave"
                @click="save"
              >
                Enregistrer
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
