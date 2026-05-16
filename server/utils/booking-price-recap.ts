import {
  BOOKING_BASE_NIGHT_PRICE_EUR,
  BOOKING_EXTRA_MAIN_GUEST_PER_NIGHT_EUR,
  BOOKING_INCLUDED_MAIN_GUESTS,
  computeBookingPriceEstimate,
  formatEuro
} from "../../app/data/bookingPricing"

export type BookingPriceRecapLine = {
  label: string
  amount: string
  muted?: boolean
}

export type BookingPriceRecap = {
  lines: BookingPriceRecapLine[]
  total: string
  footnote: string
}

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value > 1 ? plural : singular}`
}

export function buildBookingPriceRecap(
  nights: number,
  mainGuests: number,
  options?: { paidByCard?: boolean }
): BookingPriceRecap {
  const estimate = computeBookingPriceEstimate(nights, mainGuests)
  const discountEur = Math.max(0, estimate.baseLodgingEur - estimate.lodgingAfterDiscountEur)

  const lines: BookingPriceRecapLine[] = [
    {
      label: `${pluralize(estimate.nights, "nuit", "nuits")} × ${BOOKING_BASE_NIGHT_PRICE_EUR}\u00a0€`,
      amount: formatEuro(estimate.baseLodgingEur)
    }
  ]

  if (discountEur > 0 && estimate.discountLabel) {
    lines.push({
      label: estimate.discountLabel,
      amount: `− ${formatEuro(discountEur)}`,
      muted: true
    })
  }

  if (estimate.guestSupplementEur > 0) {
    lines.push({
      label: `Supplément voyageurs (+ ${BOOKING_EXTRA_MAIN_GUEST_PER_NIGHT_EUR}\u00a0€ / nuit / voyageur au-delà de ${BOOKING_INCLUDED_MAIN_GUESTS})`,
      amount: formatEuro(estimate.guestSupplementEur)
    })
  }

  const footnoteParts = ["Hors taxes de séjour."]

  if (options?.paidByCard) {
    footnoteParts.push("Montant réglé par carte sécurisée.")
  }

  return {
    lines,
    total: formatEuro(estimate.totalEur),
    footnote: footnoteParts.join(" ")
  }
}

export function buildBookingPriceRecapTextLines(recap: BookingPriceRecap): string[] {
  const out = ["Récapitulatif tarifaire"]

  for (const line of recap.lines) {
    out.push(`${line.label} : ${line.amount}`)
  }

  out.push(`Total : ${recap.total}`)

  if (recap.footnote) {
    out.push(recap.footnote)
  }

  return out
}

export function buildBookingPriceRecapHtml(recap: BookingPriceRecap, escape: (s: string) => string) {
  const rows = recap.lines
    .map((line) => {
      const color = line.muted ? "#f0e8df" : "#ffffff"
      const weight = line.muted ? "600" : "500"

      return `<tr>
        <td style="padding:8px 0 0;font-size:14px;line-height:1.45;color:${color};font-weight:${weight};max-width:72%;">${escape(line.label)}</td>
        <td style="padding:8px 0 0;font-size:14px;line-height:1.45;color:#ffffff;font-weight:700;white-space:nowrap;text-align:right;vertical-align:top;">${escape(line.amount)}</td>
      </tr>`
    })
    .join("")

  const footnote = recap.footnote
    ? `<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#f0e8df;">${escape(recap.footnote)}</p>`
    : ""

  return `
          <tr><td style="padding:24px 32px 0;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6b5a4c;">Récapitulatif tarifaire</p>
            <div style="margin-top:12px;padding:16px 18px;border-radius:16px;border:1px solid #4a433c;background-color:#574e44;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${rows}
                <tr>
                  <td colspan="2" style="padding:14px 0 0;border-top:1px solid rgba(252,248,244,0.22);"></td>
                </tr>
                <tr>
                  <td style="padding:0;font-size:15px;font-weight:700;color:#ffffff;">Total</td>
                  <td style="padding:0;font-size:20px;font-weight:700;color:#ffffff;text-align:right;white-space:nowrap;">${escape(recap.total)}</td>
                </tr>
              </table>
              ${footnote}
            </div>
          </td></tr>`
}
