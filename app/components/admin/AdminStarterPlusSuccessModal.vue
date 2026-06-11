<script setup lang="ts">
import { Check, Sparkles, X } from "@lucide/vue"
import { getHostivLanding } from "../../data/hostivLanding"
import { adminUiFormat } from "../../data/admin-ui"
import { formatHostivSubscriptionDate } from "../../utils/hostiv-subscription-access"
import type { HostivSubscriptionAccess } from "../../utils/hostiv-subscription-access"

const props = defineProps<{
  open: boolean
  access: HostivSubscriptionAccess | null
}>()

const { ui, locale } = useAdminUi()
const ext = computed(() => ui.value.extended)

const premiumAddon = computed(() => getHostivLanding(locale.value).pricing.premiumAddon)

const periodRange = computed(() => {
  if (!props.access?.has_starter_plus) {
    return ""
  }

  return adminUiFormat(ext.value.starterPlusSuccess.periodRange, {
    start: formatHostivSubscriptionDate(props.access.premium_tools_started_at),
    end: formatHostivSubscriptionDate(props.access.premium_tools_until)
  })
})

const emit = defineEmits<{
  close: []
  "open-welcome-guide": []
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
        class="hostiv-modal hostiv-modal--starter-plus-success"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--starter-plus-success"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-starter-plus-success-title"
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
              <span class="hostiv-modal__logo hostiv-modal__logo--icon" aria-hidden="true">
                <Check :size="22" stroke-width="2.5" />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 id="admin-starter-plus-success-title" class="hostiv-modal__title">
                  {{ ext.starterPlusSuccess.title }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ ext.starterPlusSuccess.subtitle }}
                </p>
              </div>
            </header>

            <dl v-if="access?.has_starter_plus" class="hostiv-modal__starter-plus-dates">
              <div>
                <dt>{{ ext.starterPlusSuccess.periodLabel }}</dt>
                <dd>{{ periodRange }}</dd>
              </div>
            </dl>

            <p class="hostiv-modal__plan-card-tagline">{{ premiumAddon.tagline }}</p>

            <footer class="hostiv-modal__danger-footer hostiv-modal__pro-upgrade-actions">
              <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="emit('close')">
                {{ ui.proUpgrade.later }}
              </button>
              <button type="button" class="hostiv-btn hostiv-btn--primary" @click="emit('open-welcome-guide')">
                <Sparkles :size="16" stroke-width="2" aria-hidden="true" />
                {{ ext.starterPlusSuccess.openWelcomeGuide }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
