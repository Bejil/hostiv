<script setup lang="ts">
import { AlertTriangle, X } from "@lucide/vue"
import { adminUiFormat } from "../../data/admin-ui"
import { SEO_KEYWORDS_MAX_COUNT } from "../../utils/seo-keywords"

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)

const limitSubtitle = computed(() =>
  adminUiFormat(ext.value.seoKeywords.limitModal.subtitle, { max: SEO_KEYWORDS_MAX_COUNT })
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
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="open"
        class="hostiv-modal hostiv-modal--delete"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--delete"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-seo-keywords-limit-title"
            aria-describedby="admin-seo-keywords-limit-desc"
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

            <header class="hostiv-modal__head hostiv-modal__head--delete">
              <span class="hostiv-modal__danger-icon" aria-hidden="true">
                <AlertTriangle :size="26" stroke-width="1.75" />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 id="admin-seo-keywords-limit-title" class="hostiv-modal__title">
                  {{ ext.seoKeywords.limitModal.title }}
                </h2>
                <p id="admin-seo-keywords-limit-desc" class="hostiv-modal__subtitle">
                  {{ limitSubtitle }}
                </p>
              </div>
            </header>

            <footer class="hostiv-modal__danger-footer">
              <button type="button" class="hostiv-btn hostiv-btn--primary" @click="emit('close')">
                {{ ext.seoKeywords.limitModal.understood }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
