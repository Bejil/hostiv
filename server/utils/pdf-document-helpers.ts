import { rgb, type PDFPage, type PDFFont, type RGB } from "pdf-lib"
import type { InvoiceRgb } from "../../app/data/site-template-invoice-theme"

export const PDF_PAGE_WIDTH = 595.28
export const PDF_PAGE_HEIGHT = 841.89
export const PDF_MARGIN = 48
export const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2

export function pdfRgb(color: InvoiceRgb): RGB {
  return rgb(color.r, color.g, color.b)
}

/** Texte compatible polices PDF standard (WinAnsi / Helvetica, Times). */
export function sanitizePdfText(value: string) {
  return value
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/[\u2010-\u2015\u2212\u2011\u00ad]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022/g, "-")
    .replace(/[★☆✓✔✗]/g, "*")
    .replace(/[^\t\n\r\x20-\xFF]/g, " ")
}

export function wrapPdfText(text: string, maxWidth: number, fontSize: number, font: PDFFont) {
  const paragraphs = sanitizePdfText(text).split(/\n/)
  const lines: string[] = []

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("")
      continue
    }

    const words = paragraph.split(/\s+/)
    let current = ""

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word

      if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = candidate
      }
    }

    if (current) {
      lines.push(current)
    }
  }

  return lines.length ? lines : [""]
}

/** Bandeau haut de page aligné sur la charte facture / template. */
export function drawTemplateTopBand(
  page: PDFPage,
  theme: {
    layout: "warm" | "editorial" | "minimal"
    topBandHeight: number
    accent: InvoiceRgb
    accentSecondary: InvoiceRgb
  }
) {
  const bandHeight = theme.topBandHeight

  if (theme.layout === "editorial") {
    page.drawRectangle({
      x: 0,
      y: PDF_PAGE_HEIGHT - bandHeight,
      width: PDF_PAGE_WIDTH,
      height: bandHeight,
      color: pdfRgb(theme.accent)
    })
    page.drawRectangle({
      x: 0,
      y: PDF_PAGE_HEIGHT - bandHeight - 5,
      width: PDF_PAGE_WIDTH,
      height: 5,
      color: pdfRgb(theme.accentSecondary)
    })
    return
  }

  const half = PDF_PAGE_WIDTH / 2

  page.drawRectangle({
    x: 0,
    y: PDF_PAGE_HEIGHT - bandHeight,
    width: half,
    height: bandHeight,
    color: pdfRgb(theme.accentSecondary)
  })
  page.drawRectangle({
    x: half,
    y: PDF_PAGE_HEIGHT - bandHeight,
    width: half,
    height: bandHeight,
    color: pdfRgb(theme.accent)
  })
}

/** Bande diagonale décorative (séparation visuelle type « vague »). */
export function drawDiagonalAccentBand(
  page: PDFPage,
  baselineY: number,
  bandHeight: number,
  fill: RGB,
  opacity = 1
) {
  const w = PDF_PAGE_WIDTH
  const h = bandHeight

  page.drawRectangle({
    x: 0,
    y: baselineY - h * 0.35,
    width: w,
    height: h,
    color: fill,
    opacity
  })
  page.drawRectangle({
    x: 0,
    y: baselineY - h * 0.85,
    width: w * 0.62,
    height: h * 0.42,
    color: fill,
    opacity: opacity * 0.55
  })
}
