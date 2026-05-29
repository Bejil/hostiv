<script setup lang="ts">
import { ref, watch } from "vue"
import AdminField from "./AdminField.vue"
import AdminOnboardingFieldExamples from "./AdminOnboardingFieldExamples.vue"
import { useAdminGeocode } from "../../composables/useAdminGeocode"
import type { PropertyLocation } from "../../types/property-site"

const props = defineProps<{
  slug: string
  modelValue: PropertyLocation
  lead: string
  markRequired?: boolean
  showFieldExamples?: boolean
}>()

const leadExamples = [
  "Quartier calme, commerces à pied et RER à 8 min pour Paris.",
  "Entre le château de Versailles et les forêts — cadre verdoyant, accès facile."
]

const emit = defineEmits<{
  "update:modelValue": [value: PropertyLocation]
  "update:lead": [value: string]
}>()

const { geocodeAddress } = useAdminGeocode(props.slug)

const geocodeStatus = ref<"idle" | "loading" | "ok" | "error">("idle")
const geocodeMessage = ref("")
const geocodedAddress = ref(props.modelValue.address.trim())
let geocodeTimer: ReturnType<typeof setTimeout> | null = null
let geocodeRequestId = 0

function patchLocation(partial: Partial<PropertyLocation>) {
  emit("update:modelValue", { ...props.modelValue, ...partial })
}

function scheduleGeocode(address: string) {
  if (geocodeTimer) {
    clearTimeout(geocodeTimer)
  }

  const query = address.trim()

  if (!query || query === geocodedAddress.value) {
    return
  }

  if (query.length < 5) {
    geocodeStatus.value = "idle"
    geocodeMessage.value = ""
    return
  }

  geocodeTimer = setTimeout(() => {
    void runGeocode(query)
  }, 700)
}

async function runGeocode(address: string) {
  const requestId = ++geocodeRequestId

  geocodeStatus.value = "loading"
  geocodeMessage.value = "Recherche de la position…"

  try {
    const result = await geocodeAddress(address)

    if (requestId !== geocodeRequestId) {
      return
    }

    geocodedAddress.value = address
    patchLocation({
      address,
      latitude: result.latitude,
      longitude: result.longitude,
      radius_meters: result.radius_meters
    })
    geocodeStatus.value = "ok"
    geocodeMessage.value = "Position et zone mises à jour automatiquement."
  } catch (error: unknown) {
    if (requestId !== geocodeRequestId) {
      return
    }

    geocodeStatus.value = "error"
    const fetchError = error as { data?: { message?: string }; message?: string }

    geocodeMessage.value =
      fetchError.data?.message ??
      (error instanceof Error ? error.message : "Impossible de localiser cette adresse.")
  }
}

function onAddressInput(value: string | number | boolean) {
  const address = String(value)

  patchLocation({ address })
  scheduleGeocode(address)
}

watch(
  () => props.modelValue.address,
  (address) => {
    const trimmed = address.trim()

    if (trimmed && trimmed === geocodedAddress.value) {
      geocodeStatus.value = "ok"
    }
  }
)
</script>

<template>
  <div class="admin-location-map">
    <div class="admin-subpanel">
      <div class="admin-location-map__fields">
        <AdminField
          label="Adresse"
          type="text"
          full-width
          :required="markRequired"
          hint="La position et la zone sur le site public sont calculées automatiquement à partir de cette adresse."
          :model-value="modelValue.address"
          @update:model-value="onAddressInput"
        />
        <p
          v-if="geocodeMessage"
          class="admin-location-map__status"
          :class="`admin-location-map__status--${geocodeStatus}`"
        >
          {{ geocodeMessage }}
        </p>
        <div class="admin-onboarding-fields__field-block">
          <AdminField
            label="Chapô"
            type="textarea"
            :rows="4"
            full-width
            :required="markRequired"
            :model-value="lead"
            @update:model-value="emit('update:lead', $event as string)"
          />
          <AdminOnboardingFieldExamples
            v-if="showFieldExamples"
            :examples="leadExamples"
          />
        </div>
      </div>
    </div>
  </div>
</template>
