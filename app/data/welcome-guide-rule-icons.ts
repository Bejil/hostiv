import type { BenefitIconShape } from "./benefit-icons"
import { BENEFIT_ICON_GRAPHICS } from "./benefit-icons"

const BAN_LINE: BenefitIconShape = { tag: "line", x1: "4", y1: "4", x2: "20", y2: "20" }

function withBan(shapes: BenefitIconShape[]): BenefitIconShape[] {
  return [...shapes, BAN_LINE]
}

export const WELCOME_GUIDE_RULE_ICON_GRAPHICS = {
  "no-smoking": {
    label: "Non-fumeur",
    shapes: withBan([
      { tag: "path", d: "M18 12H6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2Z" },
      { tag: "path", d: "M12 6V4a1 1 0 0 0-2 0v2" },
      { tag: "path", d: "M12 20v2a1 1 0 0 0 2 0v-2" }
    ])
  },
  "no-parties": {
    label: "Pas de fêtes",
    shapes: withBan([...BENEFIT_ICON_GRAPHICS.star.shapes])
  },
  quiet: {
    label: "Heures de calme",
    shapes: [...BENEFIT_ICON_GRAPHICS.volume.shapes]
  },
  clean: {
    label: "Propreté",
    shapes: [...BENEFIT_ICON_GRAPHICS.washing.shapes]
  },
  trash: {
    label: "Déchets",
    shapes: [
      { tag: "path", d: "M3 6h18" },
      { tag: "path", d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" },
      { tag: "path", d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" },
      { tag: "path", d: "M10 11v6M14 11v6" }
    ]
  },
  recycle: {
    label: "Tri sélectif",
    shapes: [...BENEFIT_ICON_GRAPHICS.leaf.shapes]
  },
  "no-pets": {
    label: "Pas d’animaux",
    shapes: withBan([...BENEFIT_ICON_GRAPHICS.pet.shapes])
  },
  "shoes-off": {
    label: "Chaussures enlevées",
    shapes: [...BENEFIT_ICON_GRAPHICS.home.shapes]
  },
  keys: {
    label: "Clés & accès",
    shapes: [...BENEFIT_ICON_GRAPHICS.key.shapes]
  },
  clock: {
    label: "Horaires",
    shapes: [...BENEFIT_ICON_GRAPHICS.clock.shapes]
  },
  guests: {
    label: "Nombre de voyageurs",
    shapes: [...BENEFIT_ICON_GRAPHICS.family.shapes]
  },
  parking: {
    label: "Parking",
    shapes: [...BENEFIT_ICON_GRAPHICS.parking.shapes]
  },
  wifi: {
    label: "Wi‑Fi",
    shapes: [...BENEFIT_ICON_GRAPHICS.wifi.shapes]
  },
  heating: {
    label: "Chauffage",
    shapes: [...BENEFIT_ICON_GRAPHICS.flame.shapes]
  },
  security: {
    label: "Sécurité",
    shapes: [...BENEFIT_ICON_GRAPHICS.shield.shapes]
  },
  report: {
    label: "Signaler un problème",
    shapes: [
      { tag: "path", d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" },
      { tag: "path", d: "M12 9v4M12 17h.01" }
    ]
  },
  door: {
    label: "Arrivée & départ",
    shapes: [...BENEFIT_ICON_GRAPHICS["door-open"].shapes]
  },
  kitchen: {
    label: "Cuisine",
    shapes: [...BENEFIT_ICON_GRAPHICS.utensils.shapes]
  },
  laundry: {
    label: "Linge",
    shapes: [...BENEFIT_ICON_GRAPHICS.washing.shapes]
  },
  checkout: {
    label: "Départ",
    shapes: [...BENEFIT_ICON_GRAPHICS.luggage.shapes]
  },
  contact: {
    label: "Contact hôte",
    shapes: [...BENEFIT_ICON_GRAPHICS.phone.shapes]
  },
  mail: {
    label: "E-mail",
    shapes: [...BENEFIT_ICON_GRAPHICS.mail.shapes]
  },
  garden: {
    label: "Jardin & extérieur",
    shapes: [...BENEFIT_ICON_GRAPHICS.trees.shapes]
  },
  children: {
    label: "Enfants",
    shapes: [...BENEFIT_ICON_GRAPHICS.baby.shapes]
  },
  enjoy: {
    label: "Bon séjour",
    shapes: [...BENEFIT_ICON_GRAPHICS.heart.shapes]
  },
  elevator: {
    label: "Ascenseur",
    shapes: [...BENEFIT_ICON_GRAPHICS.elevator.shapes]
  },
  thermostat: {
    label: "Climatisation",
    shapes: [...BENEFIT_ICON_GRAPHICS.wind.shapes]
  }
} as const satisfies Record<string, { label: string; shapes: BenefitIconShape[] }>

export type WelcomeGuideRuleIcon = keyof typeof WELCOME_GUIDE_RULE_ICON_GRAPHICS

export const DEFAULT_WELCOME_GUIDE_RULE_ICON: WelcomeGuideRuleIcon = "no-smoking"

export const WELCOME_GUIDE_RULE_ICON_OPTIONS = Object.entries(WELCOME_GUIDE_RULE_ICON_GRAPHICS).map(
  ([id, meta]) => ({
    id: id as WelcomeGuideRuleIcon,
    label: meta.label
  })
)

const iconIdSet = new Set<string>(Object.keys(WELCOME_GUIDE_RULE_ICON_GRAPHICS))

const LEGACY_RULE_ICON_MAP: Record<string, WelcomeGuideRuleIcon> = {
  recycle: "recycle",
  enjoy: "enjoy",
  "report-issue": "report",
  clean: "clean"
}

export function isWelcomeGuideRuleIcon(value: string): value is WelcomeGuideRuleIcon {
  return iconIdSet.has(value)
}

export function welcomeGuideRuleIconLabel(icon: WelcomeGuideRuleIcon | undefined) {
  if (!icon) {
    return "Icône"
  }

  return WELCOME_GUIDE_RULE_ICON_GRAPHICS[icon]?.label ?? "Icône"
}

export function normalizeWelcomeGuideRuleIcon(
  value: unknown,
  fallback: WelcomeGuideRuleIcon = DEFAULT_WELCOME_GUIDE_RULE_ICON
): WelcomeGuideRuleIcon {
  if (typeof value === "string") {
    if (isWelcomeGuideRuleIcon(value)) {
      return value
    }

    const legacy = LEGACY_RULE_ICON_MAP[value]

    if (legacy) {
      return legacy
    }
  }

  return fallback
}

export function welcomeGuideRuleIconShapes(icon: string): BenefitIconShape[] {
  return WELCOME_GUIDE_RULE_ICON_GRAPHICS[normalizeWelcomeGuideRuleIcon(icon)].shapes
}

function shapeToSvg(shape: BenefitIconShape): string {
  switch (shape.tag) {
    case "path":
      return `<path d="${shape.d}"/>`
    case "rect":
      return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}"${shape.rx ? ` rx="${shape.rx}"` : ""}/>`
    case "circle":
      return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}"/>`
    case "line":
      return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}"/>`
    case "polyline":
      return `<polyline points="${shape.points}"/>`
    default:
      return ""
  }
}

/** SVG inline pour le PDF (traits blancs sur pastille bordeaux). */
export function welcomeGuideRuleIconSvgHtml(icon: string) {
  const shapes = welcomeGuideRuleIconShapes(icon)
  const inner = shapes.map(shapeToSvg).join("")

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
}
