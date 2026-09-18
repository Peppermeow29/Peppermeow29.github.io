<script setup lang="ts">
import { ArrowLeft, CalendarDays, Clock, Link2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { posts } from '../data/posts'
import { formatDate } from '../utils/formatDate'

const route = useRoute()
const post = computed(() => posts.find((item) => item.slug === route.params.slug))

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'pre'; text: string }
  | { kind: 'card'; url: string; title: string; description: string; site: string }

const blocks = computed<Block[]>(() => {
  const result: Block[] = []
  let inCode = false
  let codeLines: string[] = []

  for (const line of post.value?.content ?? []) {
    if (line.trim() === '```') {
      if (inCode) {
        result.push({ kind: 'pre', text: codeLines.join('\n') })
        codeLines = []
      }
      inCode = !inCode
      continue
    }
    if (inCode) {
      codeLines.push(line)
    } else if (line.startsWith('## ')) {
      result.push({ kind: 'h2', text: line.slice(3) })
    } else if (line.startsWith('[card] ')) {
      const [url, title, description, site] = line
        .slice('[card] '.length)
        .split(' | ')
        .map((part) => part.trim())

      if (url?.startsWith('http')) {
        let host = url
        try {
          host = new URL(url).hostname
        } catch {
          /* 保持原样 */
        }
        result.push({
          kind: 'card',
          url,
          title: title || url,
          description: description || '',
          site: site || host,
        })
      }
    } else {
      result.push({ kind: 'p', text: line })
    }
  }

  return result
})

/** 把段落文本里的裸 URL 拆成 文本/链接 片段，供模板渲染成 <a> */
const URL_RE = /(https?:\/\/[^\s，。；、）)]+)/g

function splitLinks(text: string) {
  // split 带捕获组时，结果数组里 URL 与纯文本交替出现，直接按前缀判断即可
  return text
    .split(URL_RE)
    .filter(Boolean)
    .map((part) => ({
      url: part.startsWith('http') ? part : null,
      text: part,
    }))
}
</script>

<template>
  <article v-if="post" class="article-detail">
    <RouterLink class="back-link" to="/articles">
      <ArrowLeft :size="17" />
      返回文章列表
    </RouterLink>

    <header class="article-hero">
      <span class="category-pill">{{ post.category }}</span>
      <h1>{{ post.title }}</h1>
      <p>{{ post.description }}</p>
      <div class="detail-meta">
        <span>
          <CalendarDays :size="17" />
          {{ formatDate(post.date) }}
        </span>
        <span>
          <Clock :size="17" />
          {{ post.readingTime }}
        </span>
      </div>
    </header>

    <img v-if="post.cover" class="article-cover" :src="post.cover" :alt="`${post.title} 封面`" />

    <div class="prose">
      <template v-for="(block, index) in blocks" :key="index">
        <h2 v-if="block.kind === 'h2'">{{ block.text }}</h2>

        <pre v-else-if="block.kind === 'pre'"><code>{{ block.text }}</code></pre>

        <a
          v-else-if="block.kind === 'card'"
          class="link-card"
          :href="block.url"
          target="_blank"
          rel="noreferrer"
        >
          <span class="link-card-icon">
            <Link2 :size="22" />
          </span>
          <span class="link-card-body">
            <strong class="link-card-title">{{ block.title }}</strong>
            <span v-if="block.description" class="link-card-desc">{{ block.description }}</span>
            <span class="link-card-site">{{ block.site }}</span>
          </span>
        </a>

        <p v-else>
          <template v-for="(seg, segIndex) in splitLinks(block.text)" :key="segIndex">
            <a v-if="seg.url" :href="seg.url" target="_blank" rel="noreferrer">{{ seg.text }}</a>
            <template v-else>{{ seg.text }}</template>
          </template>
        </p>
      </template>
    </div>

    <footer class="article-tags">
      <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
    </footer>
  </article>

  <section v-else class="empty-state standalone">
    <h1>文章不存在</h1>
    <RouterLink class="primary-action" to="/articles">返回文章列表</RouterLink>
  </section>
</template>

<style scoped>
.article-cover {
  width: 100%;
  margin-top: 26px;
  border: 1px solid var(--line);
  border-radius: 14px;
}

.prose h2 {
  margin: 40px 0 14px;
  font-size: 1.42rem;
  letter-spacing: 0.2px;
  color: #2f251d;
}

.prose a {
  color: var(--accent-dark, #8a5a2b);
  word-break: break-all;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose pre {
  overflow-x: auto;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #f7f2ea;
  font-size: 0.92rem;
  line-height: 1.75;
}

/* 飞书风格链接卡片 */
.link-card {
  display: flex;
  gap: 14px;
  align-items: center;
  margin: 18px 0;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #f7f3ec;
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.link-card:hover {
  border-color: var(--accent-dark, #8a5a2b);
  background: #f2ece0;
}

.link-card-icon {
  display: grid;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 8px;
  background: #3370ff;
  color: #fff;
}

.link-card-body {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.link-card-title {
  color: #2f251d;
  font-size: 0.98rem;
  font-weight: 700;
}

.link-card-desc {
  overflow: hidden;
  color: #7a6c5d;
  font-size: 0.85rem;
  line-height: 1.5;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.link-card-site {
  margin-top: 2px;
  color: #9b8d7c;
  font-size: 0.78rem;
}
</style>
