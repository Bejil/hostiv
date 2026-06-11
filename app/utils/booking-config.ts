import type { PropertyBookingConfig } from "../types/property-site"

export const DEFAULT_BOOKING_CONFIG: PropertyBookingConfig = {
  min_booking_notice_days: 3,
  min_stay_nights: 1,
  max_stay_nights: 31,
  max_travelers: 4,
  max_babies: 1,
  base_night_price_eur: 100,
  week_discount_enabled: false,
  week_min_nights: 7,
  week_discount_rate: 0.1,
  month_discount_enabled: false,
  month_min_nights: 28,
  month_discount_rate: 0.2,
  included_main_guests: 3,
  extra_main_guest_per_night_eur: 15,
  cancellation_refund_percent: 0,
  cancellation_days_before_checkin: 7
}

function normalizeNumber(value: unknown, fallback: number) {
  const next = Number(value)

  return Number.isFinite(next) ? next : fallback
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    return value === "true" ? true : value === "false" ? false : fallback
  }

  return fallback
}

export function normalizeBookingConfig(config: Partial<PropertyBookingConfig> | null | undefined): PropertyBookingConfig {
  return {
    min_booking_notice_days: normalizeNumber(
      config?.min_booking_notice_days,
      DEFAULT_BOOKING_CONFIG.min_booking_notice_days
    ),
    min_stay_nights: normalizeNumber(config?.min_stay_nights, DEFAULT_BOOKING_CONFIG.min_stay_nights),
    max_stay_nights: normalizeNumber(config?.max_stay_nights, DEFAULT_BOOKING_CONFIG.max_stay_nights),
    max_travelers: normalizeNumber(config?.max_travelers, DEFAULT_BOOKING_CONFIG.max_travelers),
    max_babies: normalizeNumber(config?.max_babies, DEFAULT_BOOKING_CONFIG.max_babies),
    base_night_price_eur: normalizeNumber(
      config?.base_night_price_eur,
      DEFAULT_BOOKING_CONFIG.base_night_price_eur
    ),
    week_discount_enabled: normalizeBoolean(
      config?.week_discount_enabled,
      DEFAULT_BOOKING_CONFIG.week_discount_enabled
    ),
    week_min_nights: normalizeNumber(config?.week_min_nights, DEFAULT_BOOKING_CONFIG.week_min_nights),
    week_discount_rate: normalizeNumber(config?.week_discount_rate, DEFAULT_BOOKING_CONFIG.week_discount_rate),
    month_discount_enabled: normalizeBoolean(
      config?.month_discount_enabled,
      DEFAULT_BOOKING_CONFIG.month_discount_enabled
    ),
    month_min_nights: normalizeNumber(config?.month_min_nights, DEFAULT_BOOKING_CONFIG.month_min_nights),
    month_discount_rate: normalizeNumber(config?.month_discount_rate, DEFAULT_BOOKING_CONFIG.month_discount_rate),
    included_main_guests: normalizeNumber(
      config?.included_main_guests,
      DEFAULT_BOOKING_CONFIG.included_main_guests
    ),
    extra_main_guest_per_night_eur: normalizeNumber(
      config?.extra_main_guest_per_night_eur,
      DEFAULT_BOOKING_CONFIG.extra_main_guest_per_night_eur
    ),
    cancellation_refund_percent: Math.min(
      100,
      Math.max(0, Math.round(
        normalizeNumber(
          config?.cancellation_refund_percent,
          DEFAULT_BOOKING_CONFIG.cancellation_refund_percent
        )
      ))
    ),
    cancellation_days_before_checkin: Math.max(
      0,
      Math.round(
        normalizeNumber(
          config?.cancellation_days_before_checkin,
          DEFAULT_BOOKING_CONFIG.cancellation_days_before_checkin
        )
      )
    )
  }
}
