<script setup lang="ts">
import { X } from "@lucide/vue"
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"

const props = defineProps<{
  open: boolean
  url: string
  loading: boolean
  error: string | null
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended.reservationsIcs)

const emit = defineEmits<{
  close: []
}>()

const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      copied.value = false

      if (copiedTimer) {
        clearTimeout(copiedTimer)
        copiedTimer = null
      }
    }
  }
)

onUnmounted(() => {
  if (copiedTimer) {
    clearTimeout(copiedTimer)
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

async function copyUrl() {
  if (!props.url || !import.meta.client) {
    return
  }

  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true

    if (copiedTimer) {
      clearTimeout(copiedTimer)
    }

    copiedTimer = setTimeout(() => {
      copied.value = false
      copiedTimer = null
    }, 2000)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--reservations-ics-url"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--reservations-ics-url"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-reservations-ics-url-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button
              type="button"
              class="hostiv-modal__close"
              :aria-label="ui.common.close"
              @click="emit('close')"
            >
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <div class="hostiv-modal__head-text">
                <h2 id="admin-reservations-ics-url-title" class="hostiv-modal__title">
                  {{ ext.title }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ ext.subtitle }}
                </p>
              </div>
            </header>

            <p v-if="loading" class="admin-reservations-ics-url-modal__hint">{{ ext.generating }}</p>
            <p v-else-if="error" class="admin-reservations-ics-url-modal__error">{{ error }}</p>

            <template v-else-if="url">
              <AdminField
                :label="ext.urlLabel"
                :model-value="url"
                type="url"
                full-width
                disabled
              />
              <p class="admin-reservations-ics-url-modal__hint">
                {{ ext.hint }}
              </p>
            </template>

            <footer class="admin-reservations-ics-url-modal__footer">
              <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="emit('close')">
                {{ ui.common.close }}
              </button>
              <button
                type="button"
                class="hostiv-btn hostiv-btn--primary"
                :disabled="loading || !url"
                @click="copyUrl"
              >
                <AdminIcon name="external" :size="16" />
                {{ copied ? ext.copied : ext.copyCta }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
