export function useHostivMarketingHead() {
  const appBaseURL = useRuntimeConfig().app.baseURL || "/"
  const faviconIco = `${appBaseURL}favicon.ico`.replace(/\/{2,}/g, "/")
  const faviconSvg = `${appBaseURL}favicon.svg`.replace(/\/{2,}/g, "/")

  useHead({
    link: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
      },
      { key: "favicon-ico", rel: "icon", type: "image/x-icon", href: faviconIco },
      { key: "favicon-svg", rel: "icon", type: "image/svg+xml", href: faviconSvg }
    ],
    htmlAttrs: {
      class: "hostiv-marketing"
    }
  })

  return { faviconIco, faviconSvg }
}

export function useHostivPageSeo(title: string, description: string) {
  useHostivMarketingHead()

  useSeoMeta({
    title: `${title} | Hostiv`,
    description,
    ogTitle: `${title} | Hostiv`,
    ogDescription: description,
    twitterCard: "summary"
  })
}
