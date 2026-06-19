export function escapeSitemapXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function renderSitemapUrlset(
  urls: Array<{ loc: string; lastmod?: string }>
) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(({ loc, lastmod }) => {
      const lastmodTag = lastmod ? `\n    <lastmod>${escapeSitemapXml(lastmod)}</lastmod>` : ""

      return `  <url>\n    <loc>${escapeSitemapXml(loc)}</loc>${lastmodTag}\n  </url>`
    }),
    "</urlset>"
  ].join("\n")
}
