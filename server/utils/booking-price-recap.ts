import type { PropertyBookingConfig } from "../../app/types/property-site"
import { computeBookingPriceEstimate, formatEuro } from "../../app/utils/booking-price"
import { HOSTIV_EMAIL } from "./hostiv-email-theme"

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
  config: PropertyBookingConfig,
  options?: { paidByCard?: boolean }
): BookingPriceRecap {
  const estimate = computeBookingPriceEstimate(nights, mainGuests, config)
  const discountEur = Math.max(0, estimate.baseLodgingEur - estimate.lodgingAfterDiscountEur)

  const lines: BookingPriceRecapLine[] = [
    {
      label: `${pluralize(estimate.nights, "nuit", "nuits")} × ${config.base_night_price_eur}\u00a0€`,
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
      label: `Supplément voyageurs (+ ${config.extra_main_guest_per_night_eur}\u00a0€ / nuit / voyageur au-delà de ${config.included_main_guests})`,
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
  const C = HOSTIV_EMAIL
  const rows = recap.lines
    .map((line) => {
      const color = line.muted ? "rgba(240,253,248,0.82)" : C.accentText
      const weight = line.muted ? "600" : "500"

      return `<tr>
        <td style="padding:8px 0 0;font-size:14px;line-height:1.45;color:${color};font-weight:${weight};max-width:72%;">${escape(line.label)}</td>
        <td style="padding:8px 0 0;font-size:14px;line-height:1.45;color:${C.accentText};font-weight:700;white-space:nowrap;text-align:right;vertical-align:top;">${escape(line.amount)}</td>
      </tr>`
    })
    .join("")

  const footnote = recap.footnote
    ? `<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:rgba(240,253,248,0.86);">${escape(recap.footnote)}</p>`
    : ""

  return `
          <tr><td style="padding:24px 32px 0;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.label};">Récapitulatif tarifaire</p>
            <div style="margin-top:12px;padding:18px 20px;border-radius:${C.radius};border:1px solid rgba(6,122,87,0.35);background:${C.priceBgGradient};background-color:${C.priceBg};box-shadow:0 12px 28px rgba(6,122,87,0.18);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${rows}
                <tr>
                  <td colspan="2" style="padding:14px 0 0;border-top:1px solid rgba(240,253,248,0.22);"></td>
                </tr>
                <tr>
                  <td style="padding:0;font-size:15px;font-weight:700;color:${C.accentText};">Total</td>
                  <td style="padding:0;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${C.accentText};text-align:right;white-space:nowrap;">${escape(recap.total)}</td>
                </tr>
              </table>
              ${footnote}
            </div>
          </td></tr>`
}
