<script setup lang="ts">
import { X } from "@lucide/vue"
import { adminUiFormat } from "../../data/admin-ui"
import AdminAccountDeleteModal from "./AdminAccountDeleteModal.vue"
import AdminAccountEditor from "./AdminAccountEditor.vue"
import { useSupabaseClient } from "../../composables/useSupabaseClient"

const props = defineProps<{
  open: boolean
  slug: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { ui } = useAdminUi()
const ext = computed(() => ui.value.extended)

const deleteModalOpen = ref(false)
const deleteConfirmSlug = ref("")
const deleteError = ref<string | null>(null)
const deleting = ref(false)

const showSettingsModal = computed(() => props.open && !deleteModalOpen.value)

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

function onBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).dataset.backdrop === "true") {
    emit("close")
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open || deleteModalOpen.value) {
    return
  }

  if (event.key === "Escape") {
    emit("close")
  }
}

function openDeleteModal() {
  deleteError.value = null
  deleteConfirmSlug.value = ""
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  if (deleting.value) {
    return
  }

  deleteModalOpen.value = false
  deleteConfirmSlug.value = ""
  deleteError.value = null
}

async function onDeleteAccount() {
  deleteError.value = null

  if (deleteConfirmSlug.value.trim().toLowerCase() !== props.slug.trim().toLowerCase()) {
    deleteError.value = adminUiFormat(ext.value.account.deleteSlugMismatch, { slug: props.slug })
    return
  }

  deleting.value = true

  try {
    const headers = await authHeaders()

    await $fetch(`/api/admin/${props.slug}/account`, {
      method: "DELETE",
      headers,
      body: { confirm_slug: deleteConfirmSlug.value.trim() }
    })

    const supabase = useSupabaseClient()

    await supabase.auth.signOut()
    deleteModalOpen.value = false
    emit("close")
    await navigateTo("/")
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }

    deleteError.value = e.data?.message || e.message || ext.value.account.deleteFailed
  } finally {
    deleting.value = false
  }
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      deleteModalOpen.value = false
      deleteConfirmSlug.value = ""
      deleteError.value = null
    }

    if (!import.meta.client) {
      return
    }

    document.body.style.overflow = open ? "hidden" : ""
  }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="hostiv-modal-fade">
      <div
        v-if="showSettingsModal"
        class="hostiv-modal"
        data-backdrop="true"
        role="presentation"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="hostiv-modal-panel" appear>
          <div
            class="hostiv-modal__panel hostiv-modal__panel--account"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-account-settings-modal-title"
            @click.stop
          >
            <span class="hostiv-modal__accent" aria-hidden="true" />
            <span class="hostiv-modal__glow" aria-hidden="true" />

            <button
              type="button"
              class="hostiv-modal__close"
              :aria-label="ui.common.close"
              @click="emit('close')"
            >
              <span class="sr-only">{{ ui.common.close }}</span>
              <X :size="18" stroke-width="2" />
            </button>

            <header class="hostiv-modal__head">
              <span class="hostiv-modal__logo" aria-hidden="true">
                <img
                  src="/hostiv/logo-mark.svg"
                  alt=""
                  width="40"
                  height="40"
                  class="hostiv-modal__logo-img"
                />
              </span>
              <div class="hostiv-modal__head-text">
                <h2 id="admin-account-settings-modal-title" class="hostiv-modal__title">
                  {{ ext.account.settingsTitle }}
                </h2>
                <p class="hostiv-modal__subtitle">
                  {{ ext.account.settingsSubtitle }}
                </p>
              </div>
            </header>

            <AdminAccountEditor
              :slug="slug"
              embedded
              form-id="admin-account-modal-form"
              :show-actions="true"
              @request-delete="openDeleteModal"
            />
          </div>
        </Transition>
      </div>
    </Transition>

    <AdminAccountDeleteModal
      :open="open && deleteModalOpen"
      :slug="slug"
      :loading="deleting"
      :error="deleteError"
      :confirm-slug="deleteConfirmSlug"
      @update:confirm-slug="deleteConfirmSlug = $event"
      @cancel="closeDeleteModal"
      @confirm="onDeleteAccount"
    />
  </Teleport>
</template>
