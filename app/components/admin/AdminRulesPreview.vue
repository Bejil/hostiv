<script setup lang="ts">
import { computed } from "vue"
import type { PropertyHouseRule } from "../../types/property-site"

const props = defineProps<{
  houseRules: PropertyHouseRule[]
  eyebrow: string
  title: string
  intro: string
  checkInLabel: string
  checkInTime: string
  checkOutLabel: string
  checkOutTime: string
}>()

const { ui } = useAdminUi()

const displayEyebrow = computed(
  () => props.eyebrow.trim() || ui.value.previews.common.eyebrow
)
const displayTitle = computed(
  () => props.title.trim() || ui.value.previews.common.sectionTitle
)
const displayIntro = computed(
  () => props.intro.trim() || ui.value.previews.common.intro
)

const displayRules = computed(() =>
  props.houseRules
    .map((rule) => ({
      ...rule,
      title: rule.title.trim() || ui.value.previews.rules.ruleTitle,
      text: rule.text.trim() || ui.value.previews.rules.ruleText
    }))
    .filter((rule) => rule.title || rule.text)
)
</script>

<template>
  <div class="admin-rules-preview" :aria-label="ui.previews.rules.ariaLabel">
    <p class="admin-rules-preview__label">{{ ui.previews.common.label }}</p>
    <section class="admin-rules-preview__section">
      <div class="admin-rules-preview__head">
        <p class="admin-rules-preview__eyebrow">{{ displayEyebrow }}</p>
        <div class="admin-rules-preview__head-row">
          <h2 class="admin-rules-preview__title">{{ displayTitle }}</h2>
          <p class="admin-rules-preview__intro">{{ displayIntro }}</p>
        </div>
      </div>

      <div class="admin-rules-preview__schedule">
        <article class="admin-rules-preview__schedule-item">
          <span>{{ checkInLabel.trim() || ui.previews.rules.checkIn }}</span>
          <strong>{{ checkInTime.trim() || ui.previews.common.emDash }}</strong>
        </article>
        <article class="admin-rules-preview__schedule-item">
          <span>{{ checkOutLabel.trim() || ui.previews.rules.checkOut }}</span>
          <strong>{{ checkOutTime.trim() || ui.previews.common.emDash }}</strong>
        </article>
      </div>

      <p v-if="!displayRules.length" class="admin-rules-preview__empty">
        {{ ui.previews.rules.empty }}
      </p>

      <div v-else class="admin-rules-preview__grid">
        <article
          v-for="(rule, index) in displayRules"
          :key="`${rule.title}-${index}`"
          class="admin-rules-preview__card"
        >
          <h3>{{ rule.title }}</h3>
          <p>{{ rule.text }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
