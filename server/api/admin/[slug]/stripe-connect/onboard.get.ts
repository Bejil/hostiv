/** Évite la confusion : cette route n’accepte que POST (depuis le backoffice). */
export default defineEventHandler(() => {
  throw createError({
    statusCode: 405,
    statusMessage: "Method Not Allowed",
    message:
      "Cette URL doit être appelée en POST avec un token admin (bouton « Connecter mon compte Stripe »), pas en ouvrant le lien dans le navigateur."
  })
})
