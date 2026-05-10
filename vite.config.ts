import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isUserPage = repoName?.toLowerCase().endsWith('.github.io')
const base = process.env.GITHUB_ACTIONS && repoName && !isUserPage ? `/${repoName}/` : '/'

export default defineConfig({
  base,
  plugins: [vue()],
})
