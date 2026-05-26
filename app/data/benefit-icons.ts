export type BenefitIconShape =
  | { tag: "path"; d: string }
  | { tag: "rect"; x: string; y: string; width: string; height: string; rx?: string }
  | { tag: "circle"; cx: string; cy: string; r: string }
  | { tag: "line"; x1: string; y1: string; x2: string; y2: string }
  | { tag: "polyline"; points: string }

export const BENEFIT_ICON_GRAPHICS = {
  calendar: {
    label: "Calendrier",
    shapes: [
      { tag: "rect", x: "3", y: "4", width: "18", height: "18", rx: "2" },
      { tag: "path", d: "M16 2v4M8 2v4M3 10h18" }
    ]
  },
  family: {
    label: "Famille",
    shapes: [
      { tag: "path", d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" },
      { tag: "circle", cx: "9", cy: "7", r: "4" },
      { tag: "path", d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" }
    ]
  },
  key: {
    label: "Clés",
    shapes: [
      { tag: "path", d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" },
      { tag: "path", d: "m9 11 2 2" },
      { tag: "path", d: "M7.5 15.5 4 19a2 2 0 1 0 2.8 2.8l3.5-3.5" }
    ]
  },
  parking: {
    label: "Parking",
    shapes: [
      { tag: "path", d: "M14 16H9m10-4h-3m-5-4H5" },
      { tag: "circle", cx: "7", cy: "16", r: "2" },
      { tag: "circle", cx: "17", cy: "16", r: "2" },
      { tag: "path", d: "M5 16h2M17 16h2M5 12h14" }
    ]
  },
  wifi: {
    label: "Wi‑Fi",
    shapes: [
      { tag: "path", d: "M5 12.55a11 11 0 0 1 14.08 0" },
      { tag: "path", d: "M8.53 16.11a6 6 0 0 1 6.95 0" },
      { tag: "path", d: "M12 20h.01" },
      { tag: "path", d: "M2 8.82a15 15 0 0 1 20 0" }
    ]
  },
  tv: {
    label: "Télévision",
    shapes: [
      { tag: "rect", x: "2", y: "7", width: "20", height: "13", rx: "2" },
      { tag: "path", d: "M17 2 12 7 7 2" }
    ]
  },
  coffee: {
    label: "Café",
    shapes: [
      { tag: "path", d: "M18 8h1a4 4 0 0 1 0 8h-1" },
      { tag: "path", d: "M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" },
      { tag: "path", d: "M6 2v2M10 2v2M14 2v2" }
    ]
  },
  bed: {
    label: "Chambre",
    shapes: [
      { tag: "path", d: "M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" },
      { tag: "path", d: "M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" },
      { tag: "path", d: "M12 4v6" },
      { tag: "path", d: "M2 18h20" }
    ]
  },
  bath: {
    label: "Salle de bain",
    shapes: [
      { tag: "path", d: "M10 4 8 6" },
      { tag: "path", d: "M17 19v2" },
      { tag: "path", d: "M7 19v2" },
      { tag: "path", d: "M2 12h20a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-3a2 2 0 0 1 2-2z" }
    ]
  },
  utensils: {
    label: "Cuisine",
    shapes: [
      { tag: "path", d: "M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" },
      { tag: "path", d: "M7 2v20" },
      { tag: "path", d: "M21 15V2v0a5 5 0 0 0-5 5v8" },
      { tag: "path", d: "M21 15v7" }
    ]
  },
  washing: {
    label: "Lave-linge",
    shapes: [
      { tag: "rect", x: "3", y: "2", width: "18", height: "20", rx: "2" },
      { tag: "circle", cx: "12", cy: "13", r: "5" },
      { tag: "path", d: "M8 2h8" }
    ]
  },
  wind: {
    label: "Climatisation",
    shapes: [
      { tag: "path", d: "M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" },
      { tag: "path", d: "M9.6 4.6A2 2 0 1 1 11 8H2" },
      { tag: "path", d: "M12.6 19.4A2 2 0 1 0 14 16H2" }
    ]
  },
  flame: {
    label: "Chauffage",
    shapes: [{ tag: "path", d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" }]
  },
  shield: {
    label: "Sécurité",
    shapes: [{ tag: "path", d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }]
  },
  star: {
    label: "Qualité",
    shapes: [
      {
        tag: "path",
        d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a.53.53 0 0 0 .475.245l5.518.804a.53.53 0 0 1 .294.904l-3.992 3.892a.53.53 0 0 0-.152.472l.942 5.497a.53.53 0 0 1-.771.56l-4.933-2.592a.53.53 0 0 0-.494 0L6.316 18.64a.53.53 0 0 1-.77-.56l.942-5.497a.53.53 0 0 0-.152-.472L2.594 8.928a.53.53 0 0 1 .294-.906l5.518-.803a.53.53 0 0 0 .475-.245l2.31-4.679z"
      }
    ]
  },
  heart: {
    label: "Coup de cœur",
    shapes: [
      {
        tag: "path",
        d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      }
    ]
  },
  "map-pin": {
    label: "Emplacement",
    shapes: [
      { tag: "path", d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" },
      { tag: "circle", cx: "12", cy: "10", r: "3" }
    ]
  },
  train: {
    label: "Transports",
    shapes: [
      { tag: "rect", x: "4", y: "3", width: "16", height: "16", rx: "2" },
      { tag: "path", d: "M4 11h16" },
      { tag: "path", d: "M12 3v8" },
      { tag: "path", d: "m8 19-2 2M16 19l2 2" },
      { tag: "path", d: "M8 15h0M16 15h0" }
    ]
  },
  clock: {
    label: "Horaires",
    shapes: [
      { tag: "circle", cx: "12", cy: "12", r: "10" },
      { tag: "path", d: "M12 6v6l4 2" }
    ]
  },
  home: {
    label: "Logement",
    shapes: [
      { tag: "path", d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
      { tag: "path", d: "M9 22V12h6v10" }
    ]
  },
  "door-open": {
    label: "Arrivée autonome",
    shapes: [
      { tag: "path", d: "M13 4h3a2 2 0 0 1 2 2v14" },
      { tag: "path", d: "M2 20h20" },
      { tag: "path", d: "M6 12v.01" },
      { tag: "path", d: "M10 12v.01" }
    ]
  },
  check: {
    label: "Vérifié",
    shapes: [
      { tag: "circle", cx: "12", cy: "12", r: "10" },
      { tag: "path", d: "m9 12 2 2 4-4" }
    ]
  },
  leaf: {
    label: "Éco",
    shapes: [
      { tag: "path", d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" },
      { tag: "path", d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" }
    ]
  },
  volume: {
    label: "Calme",
    shapes: [
      { tag: "path", d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" },
      { tag: "path", d: "M16 9l4 4M20 9l-4 4" }
    ]
  },
  trees: {
    label: "Jardin",
    shapes: [
      { tag: "path", d: "M10 10v.2A3 3 0 0 1 8.9 16H5v2h14v-2h-3.9a3 3 0 0 1-1.1-5.8V10a3 3 0 0 0-3-3 3 3 0 0 0-3 3Z" },
      { tag: "path", d: "M12 19v3" }
    ]
  },
  sun: {
    label: "Lumineux",
    shapes: [
      { tag: "circle", cx: "12", cy: "12", r: "4" },
      { tag: "path", d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" }
    ]
  },
  baby: {
    label: "Bébé",
    shapes: [
      { tag: "path", d: "M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" },
      { tag: "path", d: "M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1-2.2 2.2 9 9 0 0 1-13.2 0 2 2 0 0 1-2.2-2.2A9 9 0 0 1 5 6.3" },
      { tag: "path", d: "M12 2a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" }
    ]
  },
  pet: {
    label: "Animaux",
    shapes: [
      { tag: "path", d: "M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4.7 10.55-.361 2.88 1.41 4.177 2.873 3.89 1.016-.2 1.74-.758 2.327-1.52" },
      { tag: "path", d: "M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4.7 10.55.361 2.88-1.41 4.177-2.873 3.89-1.016-.2-1.74-.758-2.327-1.52" },
      { tag: "path", d: "M8 14v.5M16 14v.5M11.25 16.25h1.5L12 17l-.75-.75Z" }
    ]
  },
  laptop: {
    label: "Télétravail",
    shapes: [
      { tag: "path", d: "M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9" },
      { tag: "path", d: "M2 17h20v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2Z" }
    ]
  },
  luggage: {
    label: "Voyage",
    shapes: [
      { tag: "path", d: "M6 20h12M10 20V10a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v10" },
      { tag: "path", d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }
    ]
  },
  elevator: {
    label: "Ascenseur",
    shapes: [
      { tag: "rect", x: "4", y: "2", width: "16", height: "20", rx: "2" },
      { tag: "path", d: "M10 8h4M12 16V8" },
      { tag: "path", d: "m9 11 3-3 3 3M15 13l-3 3-3-3" }
    ]
  },
  accessibility: {
    label: "Accessibilité",
    shapes: [
      { tag: "circle", cx: "12", cy: "4", r: "2" },
      { tag: "path", d: "m15 7-2 7h3l-1 10" },
      { tag: "path", d: "M9 14h6M7 21h10" }
    ]
  },
  sparkles: {
    label: "Propreté",
    shapes: [
      { tag: "path", d: "m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" },
      { tag: "path", d: "M5 3v4M19 17v4M3 5h4M17 19h4" }
    ]
  },
  building: {
    label: "Résidence",
    shapes: [
      { tag: "rect", x: "4", y: "2", width: "16", height: "20", rx: "2" },
      { tag: "path", d: "M9 22v-4h6v4" },
      { tag: "path", d: "M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" }
    ]
  },
  iron: {
    label: "Fer à repasser",
    shapes: [{ tag: "path", d: "M6 2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM6 10h12v8a4 4 0 0 1-8 0v-8z" }]
  },
  hairdryer: {
    label: "Sèche-cheveux",
    shapes: [
      { tag: "path", d: "M18 6V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2" },
      { tag: "path", d: "M6 6h12v10a4 4 0 0 1-8 0V6Z" },
      { tag: "path", d: "M6 10H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2" }
    ]
  },
  snowflake: {
    label: "Fraîcheur",
    shapes: [
      { tag: "path", d: "M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07M4.93 19.07 19.07 4.93" }
    ]
  },
  gift: {
    label: "Accueil",
    shapes: [
      { tag: "rect", x: "3", y: "8", width: "18", height: "13", rx: "2" },
      { tag: "path", d: "M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" }
    ]
  },
  phone: {
    label: "Contact hôte",
    shapes: [
      { tag: "path", d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" }
    ]
  },
  mail: {
    label: "E-mail",
    shapes: [
      { tag: "rect", x: "2", y: "4", width: "20", height: "16", rx: "2" },
      { tag: "path", d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" }
    ]
  },
  globe: {
    label: "Centre-ville",
    shapes: [
      { tag: "circle", cx: "12", cy: "12", r: "10" },
      { tag: "path", d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" },
      { tag: "path", d: "M2 12h20" }
    ]
  },
  camera: {
    label: "Photos fidèles",
    shapes: [
      { tag: "path", d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" },
      { tag: "circle", cx: "12", cy: "13", r: "3" }
    ]
  },
  award: {
    label: "Recommandé",
    shapes: [
      { tag: "circle", cx: "12", cy: "8", r: "6" },
      { tag: "path", d: "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" }
    ]
  }
} as const satisfies Record<string, { label: string; shapes: BenefitIconShape[] }>

export type BenefitIconId = keyof typeof BENEFIT_ICON_GRAPHICS

export const DEFAULT_BENEFIT_ICON: BenefitIconId = "calendar"

export const BENEFIT_ICON_OPTIONS = Object.entries(BENEFIT_ICON_GRAPHICS).map(([value, meta]) => ({
  value: value as BenefitIconId,
  label: meta.label
}))

const benefitIconIdSet = new Set<string>(Object.keys(BENEFIT_ICON_GRAPHICS))

export function isBenefitIconId(value: string): value is BenefitIconId {
  return benefitIconIdSet.has(value)
}

export function normalizeBenefitIconId(value: string | undefined): BenefitIconId {
  if (value && isBenefitIconId(value)) {
    return value
  }

  return DEFAULT_BENEFIT_ICON
}

export function benefitIconShapes(icon: string): BenefitIconShape[] {
  return BENEFIT_ICON_GRAPHICS[normalizeBenefitIconId(icon)].shapes
}
