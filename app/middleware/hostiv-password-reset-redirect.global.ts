import {
  HOSTIV_PASSWORD_RESET_LEGACY_EN_PATH,
  HOSTIV_PASSWORD_RESET_PATHS
} from "../data/hostiv-routes"

export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== HOSTIV_PASSWORD_RESET_LEGACY_EN_PATH) {
    return
  }

  return navigateTo({
    path: HOSTIV_PASSWORD_RESET_PATHS.en,
    query: to.query,
    hash: to.hash
  })
})
