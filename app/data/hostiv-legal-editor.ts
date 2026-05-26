/**
 * Coordonnées de l’éditeur (LCEN, RGPD). Personne physique — pas de raison sociale.
 *
 * Adresse postale (LCEN) : pour un site proposant un service payant, l’adresse de
 * l’éditeur doit en principe figurer sur les mentions légales (souvent le domicile
 * ou, si vous vous immatriculez, l’adresse de l’entreprise / une domiciliation).
 * Une simple mention « adresse sur demande » n’est en général pas considérée conforme
 * pour une activité commerciale. En cas de doute, vérifiez avec un professionnel du droit.
 */
export const hostivLegalEditor = {
  fullName: "Michaël Blin",
  tradeName: "Hostiv",
  domain: "hostiv.fr",
  email: "contact@hostiv.fr",
  postalAddress: "2 chemin du bord de l'eau, 78300 Poissy, France",
  phone: "06 71 70 66 08"
} as const

export const hostivLegalHosting = {
  vercel: {
    name: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    website: "https://vercel.com"
  },
  supabase: {
    name: "Supabase, Inc.",
    region: "Union européenne (région Frankfurt, eu-central-1)",
    website: "https://supabase.com"
  }
} as const
