export type BookingReservationStatus = "confirmed" | "cancelled"

export type AdminBookingReservationStatus = "upcoming" | "past" | "cancelled"

export type BookingReservationRow = {
  id: string
  property_id: string
  property_slug: string
  stripe_payment_intent_id: string | null
  status: BookingReservationStatus
  arrival_date: string
  departure_date: string
  stay_nights: number
  adults: number
  children: number
  babies: number
  main_guests: number
  guest_first_name: string
  guest_last_name: string
  guest_email: string
  guest_phone: string
  message: string
  total_eur: number
  created_at: string
  updated_at: string
  cancelled_at: string | null
  refunded_at: string | null
  stripe_refund_id: string | null
}

export type BookingReservationInsert = Omit<
  BookingReservationRow,
  "id" | "created_at" | "updated_at" | "cancelled_at"
> & {
  id?: string
  created_at?: string
  updated_at?: string
  cancelled_at?: string | null
}

export type BookingReservationUpdate = Partial<BookingReservationRow>

export type AdminBookingReservation = Pick<
  BookingReservationRow,
  | "id"
  | "status"
  | "arrival_date"
  | "departure_date"
  | "stay_nights"
  | "adults"
  | "children"
  | "babies"
  | "main_guests"
  | "guest_first_name"
  | "guest_last_name"
  | "guest_email"
  | "guest_phone"
  | "message"
  | "total_eur"
  | "created_at"
> & {
  display_status: AdminBookingReservationStatus
  stripe_payment_intent_id: string | null
  refunded_at: string | null
  stripe_refund_id: string | null
}
