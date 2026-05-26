import { withBase } from "ufo"

/**
 * Préfixe les fichiers du dossier `public/` avec `app.baseURL`.
 * Les chemins retournés sont toujours absolus depuis la racine du site (`/gallery/...`)
 * pour éviter qu’un slug d’URL (`/mon-bien/gallery/...`) casse les images.
 */
export function usePublicAsset() {
  const config = useRuntimeConfig()
  const baseURL = config.app?.baseURL || "/"

  function publicAsset(src: string) {
    const path = src.startsWith("/") ? src : `/${src}`

    if (!baseURL || baseURL === "/") {
      return path
    }

    return withBase(path, baseURL)
  }

  return { publicAsset }
}
