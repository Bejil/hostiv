<script setup lang="ts">
import { Loader2 } from "@lucide/vue"
import HostivFooter from "../../components/hostiv/HostivFooter.vue"
import HostivNav from "../../components/hostiv/HostivNav.vue"
import { verifyHostivSignupCheckout } from "../../composables/useHostivSubscriptionCheckout"
import { useSupabaseClient } from "../../composables/useSupabaseClient"
import {
  clearHostivSignupLoginCredentials,
  hostivSignupLoginEmailMatches,
  readHostivSignupLoginCredentials
} from "../../utils/hostiv-signup-session"

useHostivMarketingHead()

const route = useRoute()
const router = useRouter()

const status = ref<"loading" | "signing-in" | "ready" | "verify-email" | "pending" | "error">("loading")
const slug = ref<string | null>(null)
const email = ref<string | null>(null)
const errorMessage = ref("")

const adminPath = computed(() => (slug.value ? `/${slug.value}/admin?onboarding=1` : null))

async function tryAutoLoginToAdmin(propertySlug: string, accountEmail: string | null) {
  const credentials = readHostivSignupLoginCredentials()

  if (!credentials || !hostivSignupLoginEmailMatches(credentials, accountEmail)) {
    return false
  }

  status.value = "signing-in"

  try {
    const supabase = useSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      const message = error.message || ""

      if (/email not confirmed|e-mail not confirmed/i.test(message)) {
        clearHostivSignupLoginCredentials()
        slug.value = propertySlug
        email.value = accountEmail
        status.value = "verify-email"
        return true
      }

      return false
    }

    clearHostivSignupLoginCredentials()
    await router.replace(`/${propertySlug}/admin?onboarding=1`)
    return true
  } catch {
    return false
  }
}

async function confirmSignup() {
  const sessionId = String(route.query.session_id || "").trim()

  if (!sessionId) {
    status.value = "error"
    errorMessage.value = "Lien de confirmation incomplet. Recommencez l’inscription depuis la page d’accueil."
    return
  }

  status.value = "loading"

  try {
    const result = await verifyHostivSignupCheckout(sessionId)

    if (result.fulfilled && result.slug) {
      const loggedIn = await tryAutoLoginToAdmin(result.slug, result.email)

      if (loggedIn) {
        return
      }

      slug.value = result.slug
      email.value = result.email

      if (result.email_verification_required) {
        status.value = "verify-email"
      } else {
        status.value = "ready"
      }

      await router.replace({ path: route.path, query: {} })
      return
    }

    status.value = "pending"
    errorMessage.value =
      "Votre paiement est en cours de traitement. Actualisez cette page dans quelques instants."
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    status.value = "error"
    errorMessage.value =
      e.data?.message || e.message || "Impossible de finaliser votre inscription."
  }
}

onMounted(() => {
  void confirmSignup()
})
</script>

<template>
  <div class="hostiv-page">
    <HostivNav />
    <main class="hostiv-section hostiv-section--green">
      <div class="hostiv-container hostiv-signup-confirmation">
        <div
          v-if="status === 'loading' || status === 'signing-in'"
          class="hostiv-signup-confirmation__card"
          role="status"
        >
          <Loader2 :size="28" class="hostiv-signup-confirmation__spinner" stroke-width="2" aria-hidden="true" />
          <h1 class="hostiv-h2">
            {{ status === "signing-in" ? "Ouverture de votre backoffice…" : "Finalisation de votre compte…" }}
          </h1>
          <p class="hostiv-signup-confirmation__lead">
            {{
              status === "signing-in"
                ? "Connexion automatique en cours. Vous allez accéder à l’éditeur dans un instant."
                : "Nous activons votre forfait et créons votre site. Cela ne prend que quelques secondes."
            }}
          </p>
        </div>

        <div v-else-if="status === 'verify-email'" class="hostiv-signup-confirmation__card">
          <h1 class="hostiv-h2">Confirmez votre e-mail</h1>
          <p class="hostiv-signup-confirmation__lead">
            Votre compte et votre site sont créés. Un e-mail de confirmation vient de vous être envoyé —
            cliquez sur le lien pour activer votre accès au backoffice.
          </p>
          <p v-if="email" class="hostiv-signup-confirmation__email">
            E-mail du compte : <strong>{{ email }}</strong>
          </p>
          <p class="hostiv-signup-confirmation__lead">
            Pensez à vérifier vos spams. Une fois confirmé, connectez-vous avec le mot de passe choisi
            à l’inscription.
          </p>
          <NuxtLink
            v-if="adminPath"
            :to="adminPath"
            class="hostiv-btn hostiv-btn--primary hostiv-signup-confirmation__cta"
          >
            J’ai confirmé mon e-mail — accéder au backoffice
          </NuxtLink>
        </div>

        <div v-else-if="status === 'ready'" class="hostiv-signup-confirmation__card">
          <h1 class="hostiv-h2">Compte et site créés</h1>
          <p class="hostiv-signup-confirmation__lead">
            Votre forfait Hostiv est actif pour 12 mois. Connectez-vous pour accéder à votre backoffice.
          </p>
          <p v-if="email" class="hostiv-signup-confirmation__email">
            E-mail du compte : <strong>{{ email }}</strong>
          </p>
          <NuxtLink
            v-if="adminPath"
            :to="adminPath"
            class="hostiv-btn hostiv-btn--primary hostiv-signup-confirmation__cta"
          >
            Se connecter au backoffice
          </NuxtLink>
        </div>

        <div v-else-if="status === 'pending'" class="hostiv-signup-confirmation__card">
          <h1 class="hostiv-h2">Paiement en cours de confirmation</h1>
          <p class="hostiv-signup-confirmation__lead">{{ errorMessage }}</p>
          <button type="button" class="hostiv-btn hostiv-btn--secondary" @click="confirmSignup">
            Actualiser
          </button>
        </div>

        <div v-else class="hostiv-signup-confirmation__card">
          <h1 class="hostiv-h2">Inscription interrompue</h1>
          <p class="hostiv-signup-confirmation__lead">{{ errorMessage }}</p>
          <NuxtLink to="/" class="hostiv-btn hostiv-btn--secondary hostiv-signup-confirmation__cta">
            Retour à l’accueil
          </NuxtLink>
        </div>
      </div>
    </main>
    <HostivFooter />
  </div>
</template>

<style src="../../../assets/css/pages/hostiv/hostiv.css"></style>

<style>
.hostiv-signup-confirmation {
  display: flex;
  justify-content: center;
  padding: 3rem 0 4rem;
}

.hostiv-signup-confirmation__card {
  width: min(520px, 100%);
  padding: 2rem 1.75rem;
  border: 1px solid var(--h-border);
  border-radius: calc(var(--h-radius-lg) + 4px);
  background: #fff;
  box-shadow: var(--h-shadow-soft);
  text-align: center;
  color: var(--h-ink);
}

.hostiv-signup-confirmation__card .hostiv-h2 {
  color: var(--h-ink);
}

.hostiv-signup-confirmation__lead {
  margin: 0.75rem 0 0;
  color: var(--h-muted);
  line-height: 1.55;
}

.hostiv-signup-confirmation__email {
  margin: 1rem 0 0;
  color: var(--h-ink-soft);
  font-size: 0.92rem;
}

.hostiv-signup-confirmation__cta {
  margin-top: 1.35rem;
  width: 100%;
  justify-content: center;
}

.hostiv-signup-confirmation__spinner {
  margin: 0 auto 1rem;
  color: var(--h-accent-deep);
  animation: hostiv-spin 0.8s linear infinite;
}
</style>
