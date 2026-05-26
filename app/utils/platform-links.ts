import type { PropertyPlatformLink } from "../types/property-site"

export function isPlatformLinkHidden(link: PropertyPlatformLink): boolean {
  return Boolean(link.hidden)
}

export function visiblePlatformLinks(links: PropertyPlatformLink[]): PropertyPlatformLink[] {
  return links.filter((link) => !isPlatformLinkHidden(link))
}
