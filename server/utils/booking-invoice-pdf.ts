import { PDFDocument, StandardFonts, rgb, type RGB } from "pdf-lib"
import {
  resolvePropertyInvoiceTheme,
  type InvoiceRgb,
  type SiteTemplateInvoiceTheme
} from "../../app/data/site-template-invoice-theme"
import type { AdminBookingReservation } from "../../app/types/booking-reservation"
import type { HostivAccountProfile } from "../../app/types/hostiv-account"
import type { PropertyAdminRecord } from "../../app/types/property-admin"

export type BookingInvoiceContext = {
  reservation: AdminBookingReservation
  property: PropertyAdminRecord
  issuer: HostivAccountProfile
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 56

function pdfColor(color: InvoiceRgb): RGB {
  return rgb(color.r, color.g, color.b)
}

export function formatBookingInvoiceNumber(reservation: AdminBookingReservation) {
  const short = reservation.id.replace(/-/g, "").slice(0, 8).toUpperCase()
  const year = new Date(reservation.created_at || Date.now()).getFullYear()

  return `FAC-${year}-${short}`
}

function formatLongDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date)
}

function formatStayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return value
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, day))
}

function formatEuro(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(amount)
}

function sanitizePdfText(value: string) {
  return value
    .replace(/\u2019/g, "'")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[^\t\n\r\x20-\xFF]/g, " ")
}

function wrapText(text: string, maxWidth: number, fontSize: number) {
  const words = sanitizePdfText(text).split(/\s+/)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    const width = candidate.length * fontSize * 0.5

    if (width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines.length ? lines : [""]
}

function invoiceFilename(reservation: AdminBookingReservation, propertySlug: string) {
  const guest = `${reservation.guest_last_name}-${reservation.guest_first_name}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `facture-${propertySlug}-${formatBookingInvoiceNumber(reservation)}${guest ? `-${guest}` : ""}.pdf`
}

export function bookingInvoiceDownloadFilename(
  reservation: AdminBookingReservation,
  propertySlug: string
) {
  return invoiceFilename(reservation, propertySlug)
}

function drawPageChrome(page: ReturnType<PDFDocument["addPage"]>, theme: SiteTemplateInvoiceTheme) {
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: pdfColor(theme.pageBackground)
  })

  const bandHeight = theme.topBandHeight

  if (theme.layout === "editorial") {
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - bandHeight,
      width: PAGE_WIDTH,
      height: bandHeight,
      color: pdfColor(theme.accent)
    })
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - bandHeight - 5,
      width: PAGE_WIDTH,
      height: 5,
      color: pdfColor(theme.accentSecondary)
    })
  } else {
    const half = PAGE_WIDTH / 2

    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - bandHeight,
      width: half,
      height: bandHeight,
      color: pdfColor(theme.accentSecondary)
    })
    page.drawRectangle({
      x: half,
      y: PAGE_HEIGHT - bandHeight,
      width: half,
      height: bandHeight,
      color: pdfColor(theme.accent)
    })
  }
}

function drawTemplateBadge(
  page: ReturnType<PDFDocument["addPage"]>,
  theme: SiteTemplateInvoiceTheme,
  brand: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontBold: Awaited<ReturnType<PDFDocument["embedFont"]>>
) {
  const badgeTop = MARGIN + theme.topBandHeight + 4

  page.drawText(sanitizePdfText(brand), {
    x: MARGIN,
    y: PAGE_HEIGHT - badgeTop - 14,
    size: 13,
    font: fontBold,
    color: pdfColor(theme.ink)
  })

  page.drawText(sanitizePdfText(theme.name.toUpperCase()), {
    x: MARGIN,
    y: PAGE_HEIGHT - badgeTop - 26,
    size: 8,
    font: fontBold,
    color: pdfColor(theme.accentSecondary)
  })
}

function tableHeaderColor(theme: SiteTemplateInvoiceTheme) {
  return theme.accent
}

function totalAmountColor(theme: SiteTemplateInvoiceTheme) {
  if (theme.id === "marina") {
    return theme.accentSecondary
  }

  return theme.accent
}

export async function buildBookingInvoicePdf(context: BookingInvoiceContext): Promise<Buffer> {
  const { reservation, property, issuer } = context
  const theme = resolvePropertyInvoiceTheme(property)
  const brand = sanitizePdfText(property.brand_name.trim() || property.slug)
  const address = sanitizePdfText(property.location?.address?.trim() ?? "")
  const guestName = sanitizePdfText(
    `${reservation.guest_first_name} ${reservation.guest_last_name}`.trim()
  )
  const invoiceNo = formatBookingInvoiceNumber(reservation)
  const stayLabel = `${formatStayDate(reservation.arrival_date)} -> ${formatStayDate(reservation.departure_date)}`
  const nights = Math.max(1, reservation.stay_nights)
  const unitPrice = reservation.total_eur / nights
  const isCancelled = reservation.status === "cancelled"
  const contentWidth = PAGE_WIDTH - MARGIN * 2

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  drawPageChrome(page, theme)

  let top = MARGIN + theme.topBandHeight + 28

  const drawRightText = (
    text: string,
    size: number,
    options?: { bold?: boolean; color?: RGB }
  ) => {
    const activeFont = options?.bold ? fontBold : font
    const color = options?.color ?? pdfColor(theme.ink)
    const width = activeFont.widthOfTextAtSize(sanitizePdfText(text), size)

    page.drawText(sanitizePdfText(text), {
      x: PAGE_WIDTH - MARGIN - width,
      y: PAGE_HEIGHT - top - size,
      size,
      font: activeFont,
      color
    })
    top += size + 6
  }

  const drawText = (
    text: string,
    x: number,
    size: number,
    options?: { bold?: boolean; color?: RGB; lineHeight?: number }
  ) => {
    const activeFont = options?.bold ? fontBold : font
    const color = options?.color ?? pdfColor(theme.ink)
    const lineHeight = options?.lineHeight ?? size + 4

    page.drawText(sanitizePdfText(text), {
      x,
      y: PAGE_HEIGHT - top - size,
      size,
      font: activeFont,
      color
    })

    top += lineHeight
  }

  drawTemplateBadge(page, theme, brand, font, fontBold)

  const headerStartTop = MARGIN + theme.topBandHeight + 36
  top = headerStartTop

  drawRightText("FACTURE", 22, { bold: true, color: pdfColor(theme.ink) })
  drawRightText(`N° ${invoiceNo}`, 10, { color: pdfColor(theme.muted) })
  drawRightText(`Date d'emission : ${formatLongDate(new Date())}`, 10, {
    color: pdfColor(theme.muted)
  })

  if (isCancelled) {
    drawRightText("Reservation annulee", 10, { color: pdfColor(theme.danger) })
  }

  top = Math.max(top, headerStartTop + 72) + 8

  const columnGap = 24
  const columnWidth = (contentWidth - columnGap) / 2
  const blockTop = top

  const drawColumnBlock = (
    title: string,
    lines: string[],
    x: number,
    startTop: number
  ) => {
    let localTop = startTop

    page.drawText(sanitizePdfText(title.toUpperCase()), {
      x,
      y: PAGE_HEIGHT - localTop - 11,
      size: 9,
      font: fontBold,
      color: pdfColor(theme.accentSecondary)
    })
    localTop += 16

    for (const line of lines) {
      if (!line.trim()) {
        continue
      }

      page.drawText(sanitizePdfText(line), {
        x,
        y: PAGE_HEIGHT - localTop - 10,
        size: 10,
        font,
        color: pdfColor(theme.ink)
      })
      localTop += 14
    }

    return localTop
  }

  const issuerLines = [brand]

  if (issuer.full_name.trim()) {
    issuerLines.push(issuer.full_name.trim())
  }

  if (issuer.email.trim()) {
    issuerLines.push(issuer.email.trim())
  }

  if (address) {
    issuerLines.push(address)
  }

  const clientLines = [guestName || "-"]

  if (reservation.guest_email.trim()) {
    clientLines.push(reservation.guest_email.trim())
  }

  if (reservation.guest_phone.trim()) {
    clientLines.push(reservation.guest_phone.trim())
  }

  const issuerBottom = drawColumnBlock("Emetteur", issuerLines, MARGIN, blockTop)
  const clientBottom = drawColumnBlock(
    "Client",
    clientLines,
    MARGIN + columnWidth + columnGap,
    blockTop
  )

  top = Math.max(issuerBottom, clientBottom) + 24

  const tableTop = top
  const headerHeight = 22
  const rowHeight = 56
  const colDesc = contentWidth * 0.52
  const colQty = contentWidth * 0.14
  const colUnit = contentWidth * 0.17
  const colTotal = contentWidth - colDesc - colQty - colUnit
  const headerColor = tableHeaderColor(theme)
  const tableBorderWidth = theme.layout === "editorial" ? 2 : 1

  if (theme.layout === "editorial") {
    page.drawRectangle({
      x: MARGIN + 6,
      y: PAGE_HEIGHT - tableTop - headerHeight - 6,
      width: contentWidth,
      height: headerHeight + rowHeight + 6,
      color: pdfColor(theme.accentSecondary),
      opacity: 0.35
    })
  }

  page.drawRectangle({
    x: MARGIN,
    y: PAGE_HEIGHT - tableTop - headerHeight,
    width: contentWidth,
    height: headerHeight,
    color: pdfColor(headerColor)
  })

  const headerY = PAGE_HEIGHT - tableTop - 15
  let colX = MARGIN + 8

  page.drawText("Description", {
    x: colX,
    y: headerY,
    size: 9,
    font: fontBold,
    color: pdfColor(theme.accentText)
  })
  colX += colDesc
  page.drawText("Qte", {
    x: colX + colQty - 28,
    y: headerY,
    size: 9,
    font: fontBold,
    color: pdfColor(theme.accentText)
  })
  colX += colQty
  page.drawText("Prix unit. TTC", {
    x: colX + colUnit - 62,
    y: headerY,
    size: 9,
    font: fontBold,
    color: pdfColor(theme.accentText)
  })
  colX += colUnit
  page.drawText("Total TTC", {
    x: colX + colTotal - 52,
    y: headerY,
    size: 9,
    font: fontBold,
    color: pdfColor(theme.accentText)
  })

  const rowTop = tableTop + headerHeight

  page.drawRectangle({
    x: MARGIN,
    y: PAGE_HEIGHT - rowTop - rowHeight,
    width: contentWidth,
    height: rowHeight,
    color: pdfColor(theme.cardBackground),
    borderColor: pdfColor(theme.border),
    borderWidth: tableBorderWidth
  })

  const description = sanitizePdfText(
    `Hebergement - ${stayLabel}\n${nights} nuit${nights > 1 ? "s" : ""} · ${reservation.adults} adulte${reservation.adults > 1 ? "s" : ""}${reservation.children ? `, ${reservation.children} enfant${reservation.children > 1 ? "s" : ""}` : ""}${reservation.babies ? `, ${reservation.babies} bebe${reservation.babies > 1 ? "s" : ""}` : ""}`
  )

  const descriptionLines = description.split("\n")
  let descY = PAGE_HEIGHT - rowTop - 18

  for (const line of descriptionLines) {
    page.drawText(line, {
      x: MARGIN + 8,
      y: descY,
      size: 10,
      font,
      color: pdfColor(theme.ink)
    })
    descY -= 14
  }

  const rowValueY = PAGE_HEIGHT - rowTop - 34

  page.drawText(String(nights), {
    x: MARGIN + colDesc + colQty - 20,
    y: rowValueY,
    size: 10,
    font,
    color: pdfColor(theme.ink)
  })

  const unitLabel = sanitizePdfText(formatEuro(unitPrice))

  page.drawText(unitLabel, {
    x: MARGIN + colDesc + colQty + colUnit - font.widthOfTextAtSize(unitLabel, 10),
    y: rowValueY,
    size: 10,
    font,
    color: pdfColor(theme.ink)
  })

  const lineTotal = sanitizePdfText(formatEuro(reservation.total_eur))

  page.drawText(lineTotal, {
    x: MARGIN + colDesc + colQty + colUnit + colTotal - fontBold.widthOfTextAtSize(lineTotal, 10),
    y: rowValueY,
    size: 10,
    font: fontBold,
    color: pdfColor(theme.ink)
  })

  top = rowTop + rowHeight + 20

  const totalLabelText = "Total TTC"
  const totalAmount = sanitizePdfText(formatEuro(reservation.total_eur))
  const totalAmountWidth = fontBold.widthOfTextAtSize(totalAmount, 14)
  const totalLabelWidth = fontBold.widthOfTextAtSize(totalLabelText, 11)
  const totalBlockRight = PAGE_WIDTH - MARGIN
  const amountColor = pdfColor(totalAmountColor(theme))

  page.drawText(totalLabelText, {
    x: totalBlockRight - totalAmountWidth - totalLabelWidth - 12,
    y: PAGE_HEIGHT - top - 11,
    size: 11,
    font: fontBold,
    color: pdfColor(theme.muted)
  })

  page.drawText(totalAmount, {
    x: totalBlockRight - totalAmountWidth,
    y: PAGE_HEIGHT - top - 14,
    size: 14,
    font: fontBold,
    color: amountColor
  })

  top += 36

  if (reservation.stripe_payment_intent_id) {
    drawText(`Ref. paiement Stripe : ${reservation.stripe_payment_intent_id}`, MARGIN, 9, {
      color: pdfColor(theme.muted),
      lineHeight: 12
    })
  }

  const legal =
    "TVA non applicable, article 293 B du Code general des impots (prestataire non assujetti)."

  for (const line of wrapText(legal, contentWidth, 9)) {
    drawText(line, MARGIN, 9, { color: pdfColor(theme.muted), lineHeight: 12 })
  }

  drawText(`Charte visuelle : ${theme.name}`, MARGIN, 8, {
    color: pdfColor(theme.muted),
    lineHeight: 11
  })

  if (reservation.message.trim()) {
    top += 8
    drawText("Message du voyageur", MARGIN, 9, { bold: true, lineHeight: 12 })

    for (const line of wrapText(reservation.message.trim(), contentWidth, 9)) {
      drawText(line, MARGIN, 9, { lineHeight: 12 })
    }
  }

  const bytes = await pdfDoc.save()

  return Buffer.from(bytes)
}
