<script setup lang="ts">
import { ArrowUpRight, Search } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { posts } from '../data/posts'
import { formatDate } from '../utils/formatDate'

const keyword = ref('')

const filteredPosts = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) return posts

  return posts.filter((post) => {
    const searchable = [
      post.title,
      post.description,
      post.category,
      ...post.tags,
    ].join(' ')

    return searchable.toLowerCase().includes(value)
  })
})
</script>

<template>
  <section class="page-intro">
    <p class="eyebrow">Archive</p>
    <h1>文章</h1>
    <p>按照时间整理的全部内容。你可以从工程、设计、部署等主题开始浏览。</p>
  </section>

  <section class="toolbar">
    <Search :size="18" />
    <input v-model="keyword" type="search" placeholder="搜索标题、标签或分类" />
  </section>

  <section class="article-list" aria-label="文章列表">
    <article v-for="post in filteredPosts" :key="post.slug" class="article-row">
      <div class="article-date">
        <span>{{ formatDate(post.date) }}</span>
        <strong>{{ post.category }}</strong>
      </div>

      <div class="article-summary">
        <RouterLink :to="`/articles/${post.slug}`">
          <h2>{{ post.title }}</h2>
        </RouterLink>
        <p>{{ post.description }}</p>
        <div class="tag-list">
          <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>

      <RouterLink class="row-action" :to="`/articles/${post.slug}`" aria-label="打开文章">
        <ArrowUpRight :size="19" />
      </RouterLink>
    </article>

    <div v-if="filteredPosts.length === 0" class="empty-state">
      没有找到匹配的文章。
    </div>
  </section>
</template>
