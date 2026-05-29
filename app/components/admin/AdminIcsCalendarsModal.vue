<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import AdminToggle from "./AdminToggle.vue"
import type { PropertyCalendarFeed } from "../../types/property-site"

const props = defineProps<{
  open: boolean
  feeds: PropertyCalendarFeed[]
}>()

const emit = defineEmits<{
  close: []
  add: []
  update: [index: number, partial: Partial<PropertyCalendarFeed>]
  remove: [index: number]
}>()

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
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--ics-calendars"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--ics-calendars"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-ics-calendars-modal-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button type="button" class="hostiv-modal__close" aria-label="Fermer" @click="emit('close')">
              <span class="sr-only">Fermer</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <span class="hostiv-modal__logo" aria-hidden="true">
                <img
                  src="/hostiv/logo-mark.svg"
                  alt=""
                  width="40"
                  height="40"
                  class="hostiv-modal__logo-img"
                />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 id="admin-ics-calendars-modal-title" class="hostiv-modal__title">
                  Autres calendriers
                </h2>
                <p class="hostiv-modal__subtitle">
                  Importez les disponibilités depuis Airbnb, Booking, Abritel ou tout calendrier ICS
                  externe. Les dates bloquées apparaissent sur le calendrier ci-dessus.
                </p>
              </div>
            </header>

            <div class="admin-ics-calendars-modal__toolbar">
              <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="emit('add')">
                <AdminIcon name="plus" :size="16" />
                Ajouter un lien ICS
              </button>
            </div>

            <p v-if="!feeds.length" class="admin-ics-calendars-modal__empty">
              Aucun calendrier externe. Ajoutez l’URL ICS exportée par votre plateforme de réservation.
            </p>

            <div v-else class="admin-ics-calendars-modal__feeds">
              <article v-for="(feed, index) in feeds" :key="feed.id" class="admin-reservations-feed">
                <AdminToggle
                  :model-value="feed.enabled"
                  label="Actif"
                  @update:model-value="emit('update', index, { enabled: $event })"
                />
                <AdminField
                  label="Nom (optionnel)"
                  :model-value="feed.name"
                  placeholder="Airbnb, Booking…"
                  @update:model-value="emit('update', index, { name: $event as string })"
                />
                <AdminField
                  label="Lien ICS"
                  :model-value="feed.url"
                  type="url"
                  placeholder="https://.../calendar.ics"
                  full-width
                  @update:model-value="emit('update', index, { url: $event as string })"
                />
                <button
                  type="button"
                  class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-reservations-feed__delete"
                  aria-label="Supprimer le calendrier"
                  title="Supprimer"
                  @click="emit('remove', index)"
                >
                  <AdminIcon name="trash" :size="16" />
                </button>
              </article>
            </div>

            <footer class="admin-ics-calendars-modal__footer">
              <button type="button" class="hostiv-btn hostiv-btn--primary" @click="emit('close')">
                Fermer
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
