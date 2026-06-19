<script setup lang="ts">
import { Check, ChevronDown, ChevronUp, PartyPopper, X } from "@lucide/vue"
import { adminSectionNavKey } from "../../composables/admin-section-nav-context"
import type { AdminNavSectionId, AdminSectionId } from "../../data/admin-nav-sections"
import { isCustomizationBlockComplete } from "../../utils/admin-customization-block-completion"
import { adminUiFormat } from "../../data/admin-ui"
import {
  getAdminSetupGuideCustomizationBlockIds,
  getAdminSetupGuideItems,
  buildSetupGuideProgress,
  getSetupGuideBlockLabel,
  isSetupGuideItemComplete,
  type AdminSetupGuideItemId
} from "../../utils/admin-setup-guide"
import type { PropertyAdminRecord } from "../../types/property-admin"

const props = defineProps<{
  slug: string
  record: PropertyAdminRecord
}>()

const route = useRoute()
const router = useRouter()
const sectionNav = inject(adminSectionNavKey)
const { ui, locale } = useAdminUi()

const setupGuideItems = computed(() => getAdminSetupGuideItems(locale.value))

const visibleSetupGuideItems = computed(() => {
  if (props.record.admin_access?.role === "cohost") {
    return setupGuideItems.value.filter((item) => item.id !== "stripe" && item.section !== "payouts")
  }

  return setupGuideItems.value
})
const setupGuideCustomizationBlockIds = computed(() =>
  getAdminSetupGuideCustomizationBlockIds(locale.value)
)

const storageKey = computed(() => `hostiv-admin-setup-guide:${props.slug}`)

const dismissedAfterComplete = ref(false)
const panelOpen = ref(true)
const customizationOpen = ref(true)
const skippedIds = ref<Set<string>>(new Set())

const stripe = computed(() => ({
  status: sectionNav?.stripeConnectStatus.value ?? null,
  hasLoadError: sectionNav?.stripeConnectLoadError.value ?? false
}))

const progress = computed(() =>
  buildSetupGuideProgress(
    props.record,
    stripe.value,
    skippedIds.value,
    locale.value,
    visibleSetupGuideItems.value
  )
)

function loadPreferences() {
  if (!import.meta.client) {
    return
  }

  try {
    const raw = localStorage.getItem(storageKey.value)

    if (!raw) {
      return
    }

    const parsed = JSON.parse(raw) as {
      dismissedAfterComplete?: boolean
      panelOpen?: boolean
      customizationOpen?: boolean
      skipped?: string[]
    }

    if (parsed.dismissedAfterComplete === true) {
      dismissedAfterComplete.value = true
    }

    if (typeof parsed.panelOpen === "boolean") {
      panelOpen.value = parsed.panelOpen
    }

    if (typeof parsed.customizationOpen === "boolean") {
      customizationOpen.value = parsed.customizationOpen
    }

    if (Array.isArray(parsed.skipped)) {
      skippedIds.value = new Set(parsed.skipped)
    }
  } catch {
    // ignore corrupt storage
  }
}

function savePreferences() {
  if (!import.meta.client) {
    return
  }

  localStorage.setItem(
    storageKey.value,
    JSON.stringify({
      dismissedAfterComplete: dismissedAfterComplete.value,
      panelOpen: panelOpen.value,
      customizationOpen: customizationOpen.value,
      skipped: [...skippedIds.value]
    })
  )
}

watch([dismissedAfterComplete, panelOpen, customizationOpen, skippedIds], savePreferences, {
  deep: true
})

watch(
  () => progress.value.allComplete,
  (complete) => {
    if (complete) {
      panelOpen.value = true
    }
  },
  { immediate: true }
)

function isItemComplete(itemId: AdminSetupGuideItemId) {
  return isSetupGuideItemComplete(
    itemId,
    props.record,
    stripe.value,
    skippedIds.value,
    locale.value
  )
}

function isItemSkipped(itemId: AdminSetupGuideItemId) {
  return skippedIds.value.has(itemId)
}

function toggleSkipped(itemId: AdminSetupGuideItemId) {
  const next = new Set(skippedIds.value)

  if (next.has(itemId)) {
    next.delete(itemId)
  } else {
    next.add(itemId)
  }

  skippedIds.value = next
}

function navigateTo(
  section: AdminSectionId,
  blockId?: AdminNavSectionId,
  itemId?: AdminSetupGuideItemId
) {
  if (!sectionNav) {
    return
  }

  if (blockId) {
    sectionNav.selectSection(blockId)
    return
  }

  sectionNav.selectSection(section)

  if (itemId === "stripe") {
    router.replace({
      path: route.path,
      query: { ...route.query, section: "payouts", accounting: "payments" }
    })
  }
}

function dismissGuide() {
  if (!progress.value.allComplete) {
    return
  }

  dismissedAfterComplete.value = true
}

function openPanel() {
  panelOpen.value = true
}

function togglePanel() {
  if (progress.value.allComplete) {
    return
  }

  panelOpen.value = !panelOpen.value
}

onMounted(loadPreferences)
</script>

<template>
  <div v-if="!dismissedAfterComplete" class="admin-setup-guide">
    <section
      class="admin-setup-guide__panel"
      :class="{
        'admin-setup-guide__panel--collapsed': !panelOpen && !progress.allComplete
      }"
      :aria-label="ui.setupGuide.ariaLabel"
    >
      <header class="admin-setup-guide__head">
        <div class="admin-setup-guide__head-main">
          <p class="admin-setup-guide__kicker">{{ ui.setupGuide.kicker }}</p>
          <p class="admin-setup-guide__progress-label">
            <template v-if="progress.allComplete">{{ ui.setupGuide.progressAllComplete }}</template>
            <template v-else-if="progress.allRequiredDone">{{ ui.setupGuide.progressRequiredDone }}</template>
            <template v-else>{{ ui.setupGuide.progressDefault }}</template>
          </p>
          <p v-if="!progress.allComplete" class="admin-setup-guide__progress-meta">
            {{
              progress.completed > 1
                ? adminUiFormat(ui.setupGuide.progressMetaPlural, {
                    completed: String(progress.completed),
                    total: String(progress.total)
                  })
                : adminUiFormat(ui.setupGuide.progressMeta, {
                    completed: String(progress.completed),
                    total: String(progress.total)
                  })
            }}
            <span class="admin-setup-guide__progress-required">
              {{
                adminUiFormat(ui.setupGuide.progressRequired, {
                  completed: String(progress.requiredCompleted),
                  total: String(progress.requiredTotal)
                })
              }}
            </span>
          </p>
        </div>

        <div class="admin-setup-guide__head-actions">
          <button
            v-if="!progress.allComplete"
            type="button"
            class="admin-setup-guide__icon-btn"
            :aria-label="panelOpen ? ui.setupGuide.collapse : ui.setupGuide.expand"
            @click="togglePanel"
          >
            <ChevronUp v-if="panelOpen" :size="16" />
            <ChevronDown v-else :size="16" />
          </button>
          <button
            v-if="progress.allComplete"
            type="button"
            class="admin-setup-guide__icon-btn"
            :aria-label="ui.setupGuide.dismiss"
            @click="dismissGuide"
          >
            <X :size="16" />
          </button>
        </div>
      </header>

      <div
        v-if="!panelOpen && !progress.allComplete"
        class="admin-setup-guide__collapsed-action"
      >
        <button
          type="button"
          class="admin-setup-guide__open-btn"
          @click="openPanel"
        >
          {{ ui.setupGuide.open }}
        </button>
      </div>

      <div
        v-if="panelOpen || progress.allComplete"
        class="admin-setup-guide__progress"
        aria-hidden="true"
      >
        <span class="admin-setup-guide__progress-fill" :style="{ width: `${progress.percent}%` }" />
      </div>

      <div v-if="panelOpen || progress.allComplete" class="admin-setup-guide__body">
        <div
          v-if="progress.allComplete || progress.allRequiredDone"
          class="admin-setup-guide__done"
        >
          <PartyPopper :size="22" aria-hidden="true" />
          <p v-if="progress.allComplete">{{ ui.setupGuide.doneComplete }}</p>
          <p v-else>{{ ui.setupGuide.doneRequired }}</p>
        </div>

        <ul v-if="!progress.allComplete" class="admin-setup-guide__list" role="list">
          <li
            v-for="item in visibleSetupGuideItems"
            :key="item.id"
            class="admin-setup-guide__item"
            :class="{
              'admin-setup-guide__item--done': isItemComplete(item.id),
              'admin-setup-guide__item--optional': item.optional,
              'admin-setup-guide__item--expanded': item.id === 'customization' && customizationOpen
            }"
          >
            <div class="admin-setup-guide__row">
              <button
                type="button"
                class="admin-setup-guide__row-main"
                @click="
                  item.id === 'customization'
                    ? (customizationOpen = !customizationOpen)
                    : navigateTo(item.section, item.blockId, item.id)
                "
              >
                <span
                  class="admin-setup-guide__check"
                  :class="{ 'admin-setup-guide__check--done': isItemComplete(item.id) }"
                  aria-hidden="true"
                >
                  <Check v-if="isItemComplete(item.id)" :size="12" stroke-width="3" />
                </span>
                <span class="admin-setup-guide__label">{{ item.label }}</span>
              </button>

              <button
                v-if="item.id === 'customization'"
                type="button"
                class="admin-setup-guide__expand"
                :aria-expanded="customizationOpen"
                :aria-label="ui.setupGuide.showSections"
                @click="customizationOpen = !customizationOpen"
              >
                <ChevronDown
                  :size="16"
                  class="admin-setup-guide__expand-icon"
                  :class="{ 'admin-setup-guide__expand-icon--open': customizationOpen }"
                />
              </button>

              <button
                v-else-if="item.optional && (!isItemComplete(item.id) || isItemSkipped(item.id))"
                type="button"
                class="admin-setup-guide__skip"
                @click.stop="toggleSkipped(item.id)"
              >
                {{ isItemSkipped(item.id) ? ui.common.undoSkip : ui.common.skip }}
              </button>
            </div>

            <div v-if="item.id === 'customization' && customizationOpen" class="admin-setup-guide__sublist-wrap">
              <p class="admin-setup-guide__sublist-kicker">{{ ui.setupGuide.sublistKicker }}</p>
              <ul class="admin-setup-guide__sublist" role="list">
                <li
                  v-for="blockId in setupGuideCustomizationBlockIds"
                  :key="blockId"
                  class="admin-setup-guide__subitem"
                  :class="{
                    'admin-setup-guide__subitem--done': isCustomizationBlockComplete(record, blockId, locale)
                  }"
                >
                  <button
                    type="button"
                    class="admin-setup-guide__subitem-btn"
                    @click="navigateTo('customization', blockId)"
                  >
                    <span
                      class="admin-setup-guide__check admin-setup-guide__check--sm"
                      :class="{
                        'admin-setup-guide__check--done': isCustomizationBlockComplete(record, blockId)
                      }"
                      aria-hidden="true"
                    >
                      <Check
                        v-if="isCustomizationBlockComplete(record, blockId, locale)"
                        :size="10"
                        stroke-width="3"
                      />
                    </span>
                    <span class="admin-setup-guide__subitem-label">
                      {{ getSetupGuideBlockLabel(blockId, locale) }}
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
