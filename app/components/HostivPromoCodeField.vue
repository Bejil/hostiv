<script setup lang="ts">
import type { HostivPromoCodeValidateContext } from "../../types/hostiv-promo-code"

const props = defineProps<{
  context: HostivPromoCodeValidateContext
  email: string
  subscriptionPlan?: string | null
  code: string
  appliedCode?: string | null
  validating?: boolean
  error?: string | null
  compact?: boolean
}>()

const emit = defineEmits<{
  "update:code": [value: string]
  apply: []
  clear: []
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended.promoCode)

const localCode = computed({
  get: () => props.code,
  set: (value: string) => emit("update:code", value)
})
</script>

<template>
  <div class="hostiv-promo-code" :class="{ 'hostiv-promo-code--compact': compact }">
    <label class="hostiv-promo-code__label" :for="`hostiv-promo-code-${context}`">
      {{ ext.label }}
    </label>

    <div class="hostiv-promo-code__row">
      <input
        :id="`hostiv-promo-code-${context}`"
        v-model="localCode"
        class="hostiv-promo-code__input"
        type="text"
        :placeholder="ext.placeholder"
        :disabled="validating"
        autocomplete="off"
        spellcheck="false"
        @keydown.enter.prevent="emit('apply')"
      />

      <button
        v-if="appliedCode"
        type="button"
        class="hostiv-promo-code__clear"
        :disabled="validating"
        @click="emit('clear')"
      >
        {{ ext.remove }}
      </button>

      <button
        v-else
        type="button"
        class="hostiv-promo-code__apply"
        :disabled="validating || !localCode.trim()"
        @click="emit('apply')"
      >
        {{ validating ? ext.applying : ext.apply }}
      </button>
    </div>

    <p v-if="appliedCode" class="hostiv-promo-code__success">
      {{ ext.applied }}
      <strong>{{ appliedCode }}</strong>
    </p>

    <p v-if="error" class="hostiv-promo-code__error" role="alert">{{ error }}</p>
  </div>
</template>
