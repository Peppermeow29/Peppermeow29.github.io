import type { APIRoute } from 'astro'
import { getPosts, postPath } from '../lib/posts'
import { withBase } from '../lib/url'

const SITE_NAME = 'Z.Coding Blog'
const SITE_DESCRIPTION = '记录工程实践、产品观察和长期思考的个人博客。'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** 手写 RSS 2.0，避免为一个静态文件引入依赖。 */
export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://peppermeow29.github.io')
  const posts = await getPosts()
  const self = new URL(withBase('/rss.xml'), origin).href
  const home = new URL(withBase('/'), origin).href
  const lastBuild = posts[0]?.data.date ?? new Date()

  const items = posts
    .map((post) => {
      const url = new URL(withBase(postPath(post)), origin).href
      const tags = post.data.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n')

      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <category>${escapeXml(post.data.category)}</category>
${tags}
      <description>${escapeXml(post.data.description)}</description>
    </item>`
    })
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${home}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
