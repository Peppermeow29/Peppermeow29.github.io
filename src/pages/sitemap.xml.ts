import type { APIRoute } from 'astro'
import { getPosts, postPath } from '../lib/posts'
import { withBase } from '../lib/url'

/** 手写 sitemap，避免为一个静态页面引入额外依赖。 */
export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://peppermeow29.github.io')
  const posts = await getPosts()

  const entries = [
    { path: '/', lastmod: undefined as string | undefined },
    { path: '/articles/', lastmod: posts[0]?.data.date.toISOString().slice(0, 10) },
    { path: '/about/', lastmod: undefined },
    ...posts.map((post) => ({
      path: postPath(post),
      lastmod: (post.data.updated ?? post.data.date).toISOString().slice(0, 10),
    })),
  ]

  const urls = entries
    .map(({ path, lastmod }) => {
      const loc = new URL(withBase(path), origin).href
      return lastmod
        ? `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
        : `  <url><loc>${loc}</loc></url>`
    })
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
