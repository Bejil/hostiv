<script setup lang="ts">
import {
  loadStripe,
  type Stripe,
  type StripeElements,
  type StripePaymentElement
} from "@stripe/stripe-js"

const props = defineProps<{
  clientSecret: string
  totalLabel: string
  guestEmail: string
}>()

const emit = defineEmits<{
  success: [paymentIntentId: string]
  error: [message: string]
}>()

const runtimeConfig = useRuntimeConfig()
const paymentMountRef = ref<HTMLElement | null>(null)

const isReady = ref(false)
const isProcessing = ref(false)
const localError = ref<string | null>(null)

let stripe: Stripe | null = null
let elements: StripeElements | null = null
let paymentElement: StripePaymentElement | null = null

function destroyPaymentElement() {
  paymentElement?.destroy()
  paymentElement = null
  elements = null
  stripe = null
  isReady.value = false
}

async function mountPaymentElement() {
  destroyPaymentElement()
  localError.value = null

  const publishableKey = String(runtimeConfig.public.stripePublishableKey || "").trim()

  if (!publishableKey) {
    localError.value = "Paiement non configuré (clé publique Stripe manquante)."
    emit("error", localError.value)
    return
  }

  stripe = await loadStripe(publishableKey)

  if (!stripe) {
    localError.value = "Impossible de charger Stripe."
    emit("error", localError.value)
    return
  }

  elements = stripe.elements({
    clientSecret: props.clientSecret,
    locale: "fr",
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#6b4f33",
        colorText: "#2a221c",
        colorBackground: "#fcf8f4",
        borderRadius: "12px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      }
    }
  })

  paymentElement = elements.create("payment", {
    layout: {
      type: "accordion",
      defaultCollapsed: false,
      radios: "always",
      spacedAccordionItems: true,
      // Carte, Apple Pay, Google Pay visibles ; le reste derrière « Autres » (libellé Stripe en fr)
      visibleAccordionItemsCount: 3
    },
    paymentMethodOrder: ["card", "apple_pay", "google_pay"],
    wallets: {
      applePay: "auto",
      googlePay: "auto",
      link: "never"
    },
    defaultValues: {
      billingDetails: {
        email: props.guestEmail
      }
    }
  })

  await nextTick()

  if (!paymentMountRef.value) {
    return
  }

  paymentElement.mount(paymentMountRef.value)
  paymentElement.on("ready", () => {
    isReady.value = true
  })
}

async function confirmPayment() {
  if (!stripe || !elements || isProcessing.value) {
    return
  }

  isProcessing.value = true
  localError.value = null

  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    redirect: "if_required",
    confirmParams: {
      receipt_email: props.guestEmail
    }
  })

  isProcessing.value = false

  if (error) {
    localError.value =
      error.message || "Le paiement n’a pas pu être finalisé. Réessayez ou utilisez une autre carte."
    emit("error", localError.value)
    return
  }

  if (paymentIntent?.status === "succeeded") {
    emit("success", paymentIntent.id)
    return
  }

  localError.value = "Paiement en attente de confirmation. Réessayez dans un instant."
  emit("error", localError.value)
}

watch(
  () => props.clientSecret,
  () => {
    void mountPaymentElement()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  destroyPaymentElement()
})

defineExpose({ confirmPayment })
</script>

<template>
  <div class="booking-stripe-payment">
    <p class="booking-stripe-payment-lead">
      Choisissez votre moyen de paiement
    </p>

    <div ref="paymentMountRef" class="booking-stripe-payment-element" />

    <p v-if="localError" class="booking-modal-submit-error" role="alert">
      {{ localError }}
    </p>

    <button
      type="button"
      class="booking-modal-submit"
      :disabled="!isReady || isProcessing"
      @click="confirmPayment"
    >
      {{ isProcessing ? "Paiement en cours…" : `Payer ${totalLabel}` }}
    </button>

    <p class="booking-stripe-payment-note">
      Paiement traité par Stripe. Vos coordonnées bancaires ne transitent pas par notre serveur.
    </p>
  </div>
</template>
