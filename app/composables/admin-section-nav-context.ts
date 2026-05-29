import type { InjectionKey } from "vue"
import type { useAdminSectionNavigation } from "./useAdminSectionNavigation"

export type AdminSectionNav = ReturnType<typeof useAdminSectionNavigation>

export const adminSectionNavKey: InjectionKey<AdminSectionNav> = Symbol("admin-section-nav")
