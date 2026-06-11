<script setup lang="ts">
import { adminUiFormat } from "../../data/admin-ui"
import { X } from "@lucide/vue"
import AdminEmptyState from "./AdminEmptyState.vue"
import AdminIcsCalendarDeleteModal from "./AdminIcsCalendarDeleteModal.vue"
import AdminIcsCalendarEditModal from "./AdminIcsCalendarEditModal.vue"
import AdminIcon from "./AdminIcon.vue"
import type { PropertyCalendarFeed } from "../../types/property-site"

const props = defineProps<{
  open: boolean
  feeds: PropertyCalendarFeed[]
}>()

const emit = defineEmits<{
  close: []
  add: [feed: PropertyCalendarFeed]
  update: [index: number, feed: PropertyCalendarFeed]
  remove: [index: number]
}>()

const { ui } = useAdminUi()

const editModalOpen = ref(false)
const deleteModalOpen = ref(false)
const editingIndex = ref<number | null>(null)
const deletingIndex = ref<number | null>(null)
const isCreatingNew = ref(false)

const activeFeedCount = computed(
  () =>
    props.feeds.filter(
      (feed) => feed.enabled && feed.name.trim() && feed.url.trim()
    ).length
)

const editingFeed = computed((): PropertyCalendarFeed | null => {
  if (editingIndex.value === null) {
    return null
  }

  return props.feeds[editingIndex.value] ?? null
})

const deletingFeedName = computed(() => {
  if (deletingIndex.value === null) {
    return ui.value.ics.thisCalendar
  }

  const feed = props.feeds[deletingIndex.value]

  if (!feed) {
    return ui.value.ics.thisCalendar
  }

  const name = feed.name.trim()

  if (name) {
    return name
  }

  return adminUiFormat(ui.value.ics.calendarFallback, {
    index: deletingIndex.value + 1
  })
})

const feedsSummary = computed(() => {
  const count = props.feeds.length

  if (count === 1) {
    return adminUiFormat(ui.value.ics.calendarConfigured, { count })
  }

  return adminUiFormat(ui.value.ics.calendarsConfigured, { count })
})

const activeFeedsSuffix = computed(() => {
  const count = activeFeedCount.value

  if (count > 1) {
    return adminUiFormat(ui.value.ics.activeCountPlural, { count })
  }

  return adminUiFormat(ui.value.ics.activeCount, { count })
})

const draftFeed = ref<PropertyCalendarFeed>(createEmptyFeed())

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) {
      return
    }

    document.body.style.overflow = isOpen ? "hidden" : ""

    if (!isOpen) {
      closeEdit()
      closeDelete()
    }
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
  }
})

function createEmptyFeed(): PropertyCalendarFeed {
  return {
    id: crypto.randomUUID(),
    name: "",
    url: "",
    enabled: true
  }
}

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

function feedDisplayName(feed: PropertyCalendarFeed, index: number) {
  const name = feed.name.trim()

  if (name) {
    return name
  }

  return adminUiFormat(ui.value.ics.calendarFallback, { index: index + 1 })
}

function openCreate() {
  isCreatingNew.value = true
  editingIndex.value = null
  draftFeed.value = createEmptyFeed()
  editModalOpen.value = true
}

function openEdit(index: number) {
  const feed = props.feeds[index]

  if (!feed) {
    return
  }

  isCreatingNew.value = false
  editingIndex.value = index
  draftFeed.value = { ...feed }
  editModalOpen.value = true
}

function closeEdit() {
  editModalOpen.value = false
  editingIndex.value = null
  isCreatingNew.value = false
  draftFeed.value = createEmptyFeed()
}

function saveEdit(feed: PropertyCalendarFeed) {
  if (isCreatingNew.value) {
    emit("add", feed)
  } else if (editingIndex.value !== null) {
    emit("update", editingIndex.value, feed)
  }

  closeEdit()
}

function openDelete(index: number) {
  deletingIndex.value = index
  deleteModalOpen.value = true
}

function closeDelete() {
  deleteModalOpen.value = false
  deletingIndex.value = null
}

function confirmDelete() {
  if (deletingIndex.value !== null) {
    emit("remove", deletingIndex.value)
  }

  closeDelete()
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

            <button type="button" class="hostiv-modal__close" :aria-label="ui.common.close" @click="emit('close')">
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="admin-ics-calendars-modal-title" class="hostiv-modal__title">
                  {{ ui.ics.title }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ ui.ics.subtitle }}
                </p>
              </div>
            </header>

            <p class="admin-ics-calendars-modal__hint">
              <AdminIcon name="alert" :size="15" aria-hidden="true" />
              {{ ui.ics.hint }}
            </p>

            <div class="admin-ics-calendars-modal__toolbar">
              <p v-if="feeds.length" class="admin-ics-calendars-modal__summary">
                {{ feedsSummary }}
                <span v-if="activeFeedCount !== feeds.length">
                  {{ activeFeedsSuffix }}
                </span>
              </p>
              <p v-else class="admin-ics-calendars-modal__summary admin-ics-calendars-modal__summary--empty">
                {{ ui.ics.noCalendars }}
              </p>
              <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="openCreate">
                <AdminIcon name="plus" :size="16" />
                {{ ui.ics.addLink }}
              </button>
            </div>

            <AdminEmptyState
              v-if="!feeds.length"
              icon="calendar"
              :title="ui.ics.emptyTitle"
              :description="ui.ics.emptyDescription"
            >
              <button type="button" class="admin-btn admin-btn--secondary" @click="openCreate">
                <AdminIcon name="plus" :size="16" />
                {{ ui.ics.addLink }}
              </button>
            </AdminEmptyState>

            <ul v-else class="admin-ics-calendars-modal__list" role="list">
              <li
                v-for="(feed, index) in feeds"
                :key="feed.id"
                class="admin-ics-calendars-modal__item"
                :class="{ 'admin-ics-calendars-modal__item--inactive': !feed.enabled }"
              >
                <p class="admin-ics-calendars-modal__item-name">
                  {{ feedDisplayName(feed, index) }}
                  <span v-if="!feed.enabled" class="admin-ics-calendars-modal__item-badge">{{ ui.ics.inactive }}</span>
                </p>
                <p class="admin-ics-calendars-modal__item-url" :title="feed.url">
                  {{ feed.url.trim() || ui.ics.missingUrl }}
                </p>
                <div class="admin-ics-calendars-modal__item-actions">
                  <button
                    type="button"
                    class="admin-btn admin-btn--secondary admin-btn--sm admin-btn--icon-only"
                    :aria-label="ui.ics.editCalendar"
                    :title="ui.common.edit"
                    @click="openEdit(index)"
                  >
                    <AdminIcon name="pencil" :size="16" />
                  </button>
                  <button
                    type="button"
                    class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm admin-btn--icon-only"
                    :aria-label="ui.ics.deleteCalendar"
                    :title="ui.common.delete"
                    @click="openDelete(index)"
                  >
                    <AdminIcon name="trash" :size="16" />
                  </button>
                </div>
              </li>
            </ul>

            <footer class="admin-ics-calendars-modal__footer">
              <button type="button" class="hostiv-btn hostiv-btn--primary" @click="emit('close')">
                {{ ui.common.close }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <AdminIcsCalendarEditModal
    :open="editModalOpen"
    :feed="isCreatingNew ? draftFeed : editingFeed ?? draftFeed"
    :is-new="isCreatingNew"
    @close="closeEdit"
    @save="saveEdit"
  />

  <AdminIcsCalendarDeleteModal
    :open="deleteModalOpen"
    :calendar-name="deletingFeedName"
    @cancel="closeDelete"
    @confirm="confirmDelete"
  />
</template>
