import { getSiteUiLabels } from "./site-ui-labels"
import type { HostivLocale } from "../types/hostiv-locale"

/** Libellés fixes des horaires affichés sur le site (repli si champs admin vides). */
export const HOUSE_RULES_SCHEDULE_LABELS = getSiteUiLabels("fr").rulesSchedule

export function getHouseRulesScheduleLabels(locale: HostivLocale = "fr") {
  return getSiteUiLabels(locale).rulesSchedule
}
