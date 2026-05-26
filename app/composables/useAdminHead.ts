/** Police et métadonnées communes à l’espace admin (charte Hostiv). */
export function useAdminHead(title?: string) {
  useHead({
    title: title ? `${title} — Admin Hostiv` : "Admin Hostiv",
    link: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
      }
    ]
  })
}
