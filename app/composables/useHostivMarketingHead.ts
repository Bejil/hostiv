import type { HostivStaticPage } from "../data/hostivStaticPages"

export function hostivFaviconHeadLinks() {
  const appBaseURL = useRuntimeConfig().app.baseURL || "/"
  const faviconIco = `${appBaseURL}favicon.ico`.replace(/\/{2,}/g, "/")
  const faviconSvg = `${appBaseURL}favicon.svg`.replace(/\/{2,}/g, "/")

  return [
    { key: "favicon-ico", rel: "icon", type: "image/x-icon", href: faviconIco },
    { key: "favicon-svg", rel: "icon", type: "image/svg+xml", href: faviconSvg }
  ]
}

export function useHostivMarketingHead() {
  const appBaseURL = useRuntimeConfig().app.baseURL || "/"
  const faviconIco = `${appBaseURL}favicon.ico`.replace(/\/{2,}/g, "/")
  const faviconSvg = `${appBaseURL}favicon.svg`.replace(/\/{2,}/g, "/")

  useHead({
    link: [...hostivFaviconHeadLinks()],
    htmlAttrs: {
      class: "hostiv-marketing"
    }
  })

  return { faviconIco, faviconSvg }
}

export function useHostivPageSeo(page: Pick<HostivStaticPage, "title" | "description" | "seoTitle" | "seoDescription">) {
  const title = page.seoTitle ?? `${page.title} | Hostiv`
  const description = page.seoDescription ?? page.description

  useHostivMarketingSeo({
    title,
    description,
    ogTitle: title,
    ogDescription: description
  })
}
