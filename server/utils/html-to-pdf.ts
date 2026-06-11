import type { Browser, Page } from "playwright-core"
import {
  WELCOME_GUIDE_A4_HEIGHT_PX,
  WELCOME_GUIDE_A4_WIDTH_PX,
  WELCOME_GUIDE_PAGE_COUNT
} from "../../app/utils/welcome-guide-html"

let browserInstance: Browser | null = null

async function launchBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright-core")

  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim()

  try {
    return await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {})
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Erreur inconnue"

    throw new Error(
      `Impossible de lancer Chromium pour le PDF (${detail}). Installez le navigateur : npx playwright install chromium`
    )
  }
}

async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await launchBrowser()
  }

  return browserInstance
}

async function waitForGuideImages(page: Page) {
  await page.evaluate(async () => {
    const loadBackground = (element: Element) => {
      const match = getComputedStyle(element).backgroundImage.match(/url\(\s*["']?([^"')]+)["']?\s*\)/)
      const src = match?.[1]?.trim()

      if (!src || src === "none") {
        return Promise.resolve()
      }

      return new Promise<void>((resolve) => {
        const img = new Image()

        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = src
      })
    }

    const photos = Array.from(document.querySelectorAll(".wg-photo"))
    const imgs = Array.from(document.images)

    await Promise.all([
      ...photos.map(loadBackground),
      ...imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.onload = () => resolve()
              img.onerror = () => resolve()
            })
      )
    ])
  })
}

export type RenderHtmlToPdfOptions = {
  waitForImages?: boolean
}

export async function renderHtmlToPdfBuffer(
  html: string,
  options: RenderHtmlToPdfOptions = {}
): Promise<Buffer> {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.setViewportSize({
      width: WELCOME_GUIDE_A4_WIDTH_PX,
      height: WELCOME_GUIDE_A4_HEIGHT_PX * WELCOME_GUIDE_PAGE_COUNT
    })
    await page.setContent(html, { waitUntil: "networkidle" })
    await page.emulateMedia({ media: "print" })
    await page.evaluate(() => document.fonts.ready).catch(() => undefined)

    if (options.waitForImages) {
      await waitForGuideImages(page)
    }

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" }
    })

    return Buffer.from(pdf)
  } finally {
    await page.close()
  }
}
