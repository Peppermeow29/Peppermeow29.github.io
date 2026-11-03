import { defineConfig } from 'astro/config'

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isUserPage = repo?.toLowerCase().endsWith('.github.io')
const base = process.env.GITHUB_ACTIONS && repo && !isUserPage ? `/${repo}` : '/'

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://peppermeow29.github.io',
  base,
  trailingSlash: 'ignore',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
})
