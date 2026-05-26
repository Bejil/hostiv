<script setup lang="ts">
import AdminField from "./AdminField.vue"
import AdminIcon from "./AdminIcon.vue"
import type { PropertyHouseRule } from "../../types/property-site"

const props = defineProps<{
  modelValue: PropertyHouseRule[]
}>()

const emit = defineEmits<{
  "update:modelValue": [value: PropertyHouseRule[]]
}>()

const activeIndex = ref(0)

const tabs = computed(() =>
  props.modelValue.map((rule, index) => ({
    id: index,
    label: rule.title.trim() || `Règle ${index + 1}`
  }))
)

const activeRule = computed(() => props.modelValue[activeIndex.value])

const canRemoveActiveRule = computed(() => props.modelValue.length > 1)

function createEmptyRule(): PropertyHouseRule {
  return {
    title: "",
    text: ""
  }
}

function updateRule(index: number, partial: Partial<PropertyHouseRule>) {
  const rules = [...props.modelValue]

  if (!rules[index]) {
    return
  }

  rules[index] = { ...rules[index], ...partial }
  emit("update:modelValue", rules)
}

function selectTab(index: number) {
  activeIndex.value = index
}

function addRule() {
  const rules = [...props.modelValue, createEmptyRule()]

  emit("update:modelValue", rules)
  activeIndex.value = rules.length - 1
}

function removeActiveRule() {
  if (!canRemoveActiveRule.value) {
    return
  }

  const rules = props.modelValue.filter((_, index) => index !== activeIndex.value)

  emit("update:modelValue", rules)
  activeIndex.value = Math.min(activeIndex.value, rules.length - 1)
}

watch(
  tabs,
  (items) => {
    if (activeIndex.value < items.length) {
      return
    }

    activeIndex.value = Math.max(0, items.length - 1)
  },
  { immediate: true }
)
</script>

<template>
  <div class="admin-house-rules-editor">
    <div class="admin-subpanel">
      <div class="admin-subpanel__head">
        <h3>Règles de la maison</h3>
        <button type="button" class="admin-btn admin-btn--secondary admin-btn--sm" @click="addRule">
          <AdminIcon name="plus" :size="16" />
          Ajouter une règle
        </button>
      </div>

      <p class="admin-house-rules-editor__lead">
        Cartes affichées en grille sur la page (2 colonnes).
      </p>

      <p v-if="!modelValue.length" class="admin-house-rules-editor__empty">
        Aucune règle. Ajoutez au moins une carte pour le règlement.
      </p>

      <template v-else>
        <div class="admin-tabs-shell">
          <div class="admin-tabs" role="tablist" aria-label="Règles de la maison">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              role="tab"
              class="admin-tabs__btn"
              :class="{ 'admin-tabs__btn--active': activeIndex === tab.id }"
              :aria-selected="activeIndex === tab.id"
              @click="selectTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div v-if="activeRule" class="admin-house-rules-editor__panel" role="tabpanel">
          <header class="admin-house-rules-editor__panel-top">
            <div>
              <p class="admin-house-rules-editor__panel-kicker">Règle</p>
              <h4 class="admin-house-rules-editor__panel-title">
                {{ activeRule.title.trim() || "Sans titre" }}
              </h4>
            </div>
            <button
              v-if="canRemoveActiveRule"
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--danger-ghost admin-btn--sm"
              @click="removeActiveRule"
            >
              <AdminIcon name="trash" :size="16" />
              Supprimer
            </button>
          </header>

          <div class="admin-house-rules-editor__fields">
            <AdminField
              label="Titre"
              full-width
              :model-value="activeRule.title"
              @update:model-value="updateRule(activeIndex, { title: $event as string })"
            />
            <AdminField
              label="Texte"
              type="textarea"
              :rows="4"
              full-width
              :model-value="activeRule.text"
              @update:model-value="updateRule(activeIndex, { text: $event as string })"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
