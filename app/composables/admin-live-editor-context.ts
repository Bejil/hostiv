import type { InjectionKey, Ref } from "vue"
import type { AdminNavSectionId, AdminSectionId } from "../data/admin-nav-sections"

export type AdminLiveEditorContext = {
  previewEnabled: Ref<boolean>
  notifySectionChange: (sectionId: AdminSectionId) => void
  notifyPreviewBlock: (blockId: AdminNavSectionId | null) => void
  activePreviewBlock: Ref<AdminNavSectionId | null>
}

export const adminLiveEditorContextKey: InjectionKey<AdminLiveEditorContext> =
  Symbol("adminLiveEditorContext")

export function useAdminLiveEditorContext() {
  return inject(adminLiveEditorContextKey, null)
}
