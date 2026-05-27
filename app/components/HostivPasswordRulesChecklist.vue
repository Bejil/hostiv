<script setup lang="ts">
import { Check } from "@lucide/vue"
import {
  evaluateHostivPassword,
  hostivPasswordRuleLabels,
  type HostivPasswordRuleKey
} from "../utils/hostiv-password-rules"

const props = withDefaults(
  defineProps<{
    password: string
    visible: boolean
    id?: string
    variant?: "hostiv" | "admin"
  }>(),
  {
    id: "hostiv-password-rules",
    variant: "hostiv"
  }
)

const passwordRuleKeys: HostivPasswordRuleKey[] = [
  "length",
  "lowercase",
  "uppercase",
  "digit",
  "special"
]

const passwordRules = computed(() => evaluateHostivPassword(props.password))

const rootClass = computed(() =>
  props.variant === "admin" ? "admin-password-rules" : "hostiv-modal__password-rules"
)
</script>

<template>
  <div
    v-if="visible"
    :id="id"
    :class="rootClass"
    role="status"
    aria-live="polite"
  >
    <p :class="variant === 'admin' ? 'admin-password-rules__intro' : 'hostiv-modal__password-rules-intro'">
      Votre mot de passe doit être suffisamment long et complexe en intégrant des lettres (majuscules
      et minuscules), des chiffres, de la ponctuation et des caractères spéciaux :
    </p>
    <ul
      :class="
        variant === 'admin' ? 'admin-password-rules__list' : 'hostiv-modal__password-rules-list'
      "
    >
      <li
        v-for="key in passwordRuleKeys"
        :key="key"
        :class="[
          variant === 'admin' ? 'admin-password-rules__rule' : 'hostiv-modal__password-rule',
          passwordRules[key]
            ? variant === 'admin'
              ? 'admin-password-rules__rule--met'
              : 'hostiv-modal__password-rule--met'
            : ''
        ]"
      >
        <span
          :class="
            variant === 'admin'
              ? 'admin-password-rules__rule-icon'
              : 'hostiv-modal__password-rule-icon'
          "
          aria-hidden="true"
        >
          <Check v-if="passwordRules[key]" :size="12" stroke-width="2.5" />
        </span>
        {{ hostivPasswordRuleLabels[key] }}
      </li>
    </ul>
  </div>
</template>
