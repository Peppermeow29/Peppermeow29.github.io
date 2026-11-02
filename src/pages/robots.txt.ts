import type { APIRoute } from 'astro'
import { withBase } from '../lib/url'

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://peppermeow29.github.io')
  const sitemap = new URL(withBase('/sitemap.xml'), origin).href

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
