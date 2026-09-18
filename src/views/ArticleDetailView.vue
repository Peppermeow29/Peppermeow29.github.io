<script setup lang="ts">
import { ArrowLeft, CalendarDays, Clock } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { posts } from '../data/posts'
import { formatDate } from '../utils/formatDate'

const route = useRoute()
const post = computed(() => posts.find((item) => item.slug === route.params.slug))

type Block = { kind: 'p' | 'h2' | 'pre'; text: string }

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
    } else {
      result.push({ kind: 'p', text: line })
    }
  }

  return result
})
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
        <p v-else>{{ block.text }}</p>
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

.prose pre {
  overflow-x: auto;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #f7f2ea;
  font-size: 0.92rem;
  line-height: 1.75;
}
</style>
