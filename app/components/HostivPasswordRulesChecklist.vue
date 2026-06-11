<script setup lang="ts">
import { Check } from "@lucide/vue"
import { adminUiFormat } from "../data/admin-ui"
import {
  evaluateHostivPassword,
  HOSTIV_PASSWORD_MIN_LENGTH,
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

const { ui } = useAdminUi()
const { landing: hostivLanding } = useHostivLocale()
const adminPasswordRules = computed(() => ui.value.extended.account.passwordRules)
const hostivPasswordRules = computed(() => hostivLanding.value.accountModal.passwordRules)

const introText = computed(() => {
  if (props.variant === "admin" && adminPasswordRules.value) {
    return adminPasswordRules.value.intro
  }

  return hostivPasswordRules.value.intro
})

function ruleLabel(key: HostivPasswordRuleKey) {
  if (props.variant === "admin" && adminPasswordRules.value) {
    if (key === "length") {
      return adminUiFormat(adminPasswordRules.value.length, { min: HOSTIV_PASSWORD_MIN_LENGTH })
    }

    return adminPasswordRules.value[key]
  }

  return hostivPasswordRules.value[key]
}

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
      {{ introText }}
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
        {{ ruleLabel(key) }}
      </li>
    </ul>
  </div>
</template>
