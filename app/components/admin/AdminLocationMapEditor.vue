<script setup lang="ts">
import { computed, ref, watch } from "vue"
import LocationMap from "../LocationMap.vue"
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
const mapMountKey = ref(0)
let geocodeTimer: ReturnType<typeof setTimeout> | null = null
let geocodeRequestId = 0

const hasValidCoords = computed(() => {
  const lat = Number(props.modelValue.latitude)
  const lng = Number(props.modelValue.longitude)

  return Number.isFinite(lat) && Number.isFinite(lng)
})

const mapRenderKey = computed(
  () =>
    `${mapMountKey.value}:${Number(props.modelValue.latitude)}:${Number(props.modelValue.longitude)}:${Number(props.modelValue.radius_meters)}`
)

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
    mapMountKey.value += 1
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
      <div class="admin-subpanel__head">
        <h3>Carte</h3>
        <p
          v-if="geocodeMessage"
          class="admin-location-map__status"
          :class="`admin-location-map__status--${geocodeStatus}`"
        >
          {{ geocodeMessage }}
        </p>
      </div>

      <div class="admin-location-map__row">
        <div class="admin-location-map__preview-card">
          <div class="admin-location-map__map-host">
            <div v-if="hasValidCoords" class="admin-location-map__leaflet-shell">
              <LocationMap
                :key="mapRenderKey"
                :latitude="Number(modelValue.latitude)"
                :longitude="Number(modelValue.longitude)"
                :radius-meters="Number(modelValue.radius_meters) || 400"
                :address="modelValue.address"
              />
            </div>
            <div
              v-else
              class="admin-location-map__placeholder admin-location-map__placeholder--hint"
            >
              Saisissez une adresse pour afficher la carte.
            </div>
            <div
              v-if="geocodeStatus === 'loading'"
              class="admin-location-map__loading"
              aria-live="polite"
            >
              Mise à jour…
            </div>
          </div>
        </div>

        <div class="admin-location-map__fields">
          <AdminField
            label="Adresse"
            type="textarea"
            :rows="3"
            full-width
            :required="markRequired"
            hint="La position et la zone sur la carte sont calculées automatiquement à partir de cette adresse."
            :model-value="modelValue.address"
            @update:model-value="onAddressInput"
          />
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
  </div>
</template>
