import type { InjectionKey, Ref } from "vue"

export type BookingPopover = "dates" | "guests" | null
export type CalendarSelectionStep = "arrival" | "departure"
export type GuestType = "adults" | "children" | "babies"
export type BookingFieldsInstance = "hero" | "sticky" | "modal"

export type BookingReservationContext = {
  MIN_BOOKING_NOTICE_DAYS: number
  MIN_STAY_NIGHTS: number
  MAX_STAY_NIGHTS: number
  MAX_TRAVELERS: number
  MAX_BABIES: number
  calendarWeekdayLabels: string[]
  arrivalDate: Ref<string>
  departureDate: Ref<string>
  guestCounts: {
    adults: number
    children: number
    babies: number
  }
  activeCalendarStep: Ref<CalendarSelectionStep>
  openBookingPopover: Ref<BookingPopover>
  openBookingModalPopover: Ref<BookingPopover>
  isBookingModalOpen: Ref<boolean>
  isStickyBookingStripVisible: Ref<boolean>
  bookingDateSummary: Ref<string>
  bookingDateMeta: Ref<string>
  guestSummary: Ref<string>
  guestMeta: Ref<string>
  stayNights: Ref<number>
  visibleCalendarMonths: Ref<Date[]>
  canGoToPreviousCalendarMonth: Ref<boolean>
  formatLongDisplayDate: (value: string) => string
  formatCalendarMonth: (date: Date) => string
  buildCalendarDays: (month: Date) => Array<{
    key: string
    label: string
    isoDate: string | null
    isDisabled: boolean
    isReserved: boolean
    isArrival: boolean
    isDeparture: boolean
    isInRange: boolean
    isRangeEdge: boolean
  }>
  pluralize: (value: number, singular: string, plural: string) => string
  toggleBookingPopover: (popover: Exclude<BookingPopover, null>) => void
  toggleBookingModalPopover: (popover: Exclude<BookingPopover, null>) => void
  canIncrementGuest: (type: GuestType) => boolean
  canDecrementGuest: (type: GuestType) => boolean
  updateGuests: (type: GuestType, delta: 1 | -1) => void
  shiftCalendarMonths: (offset: number) => void
  selectCalendarDate: (isoDate: string) => void
}

export const BOOKING_RESERVATION_KEY: InjectionKey<BookingReservationContext> =
  Symbol("bookingReservation")
