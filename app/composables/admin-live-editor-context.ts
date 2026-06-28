import type { InjectionKey, Ref } from "vue"
import type { HostivLocale } from "../types/hostiv-locale"
import type { AdminNavSectionId, AdminSectionId } from "../data/admin-nav-sections"
import type { WelcomeGuidePreviewPageId } from "../utils/admin-welcome-guide-preview-messages"

export type AdminLiveEditorContext = {
  previewEnabled: Ref<boolean>
  /** Langue du contenu site en cours d’édition (personnalisation). */
  siteEditLocale: Ref<HostivLocale>
  notifySectionChange: (sectionId: AdminSectionId) => void
  notifyPreviewBlock: (blockId: AdminNavSectionId | null) => void
  activePreviewBlock: Ref<AdminNavSectionId | null>
  activeWelcomeGuidePage: Ref<WelcomeGuidePreviewPageId | undefined>
  setWelcomeGuidePage: (page: WelcomeGuidePreviewPageId | undefined) => void
  /** Révision des assets guide (aperçu live + vignettes upload à gauche). */
  welcomeGuidePreviewAssetRevision: Ref<number>
  /** Incrémente pour forcer le rechargement des images dans l’aperçu guide (cache Storage). */
  bumpWelcomeGuidePreviewAssets: () => void
  /** Enregistre un push immédiat vers l’iframe aperçu guide (après upload d’image). */
  registerWelcomeGuidePreviewPusher: (push: () => void) => () => void
  /** Révision des assets site (aperçu live personnalisation). */
  sitePreviewAssetRevision: Ref<number>
  /** Incrémente pour forcer le rechargement des images dans l’aperçu site (cache Storage). */
  bumpSitePreviewAssets: () => void
  /** Enregistre un push immédiat vers l’iframe aperçu site (après upload d’image). */
  registerSitePreviewPusher: (push: () => void) => () => void
  /** Pousse l’état courant des aperçus live (site + guide). */
  pushLivePreviews: () => void
  /** @deprecated Préférer pushLivePreviews */
  pushSitePreview: () => void
}

export const adminLiveEditorContextKey: InjectionKey<AdminLiveEditorContext> =
  Symbol("adminLiveEditorContext")

export function useAdminLiveEditorContext() {
  return inject(adminLiveEditorContextKey, null)
}
