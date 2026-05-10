<script setup lang="ts">
import { ArrowLeft, CalendarDays, Clock } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { posts } from '../data/posts'
import { formatDate } from '../utils/formatDate'

const route = useRoute()
const post = computed(() => posts.find((item) => item.slug === route.params.slug))
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

    <div class="prose">
      <p v-for="paragraph in post.content" :key="paragraph">{{ paragraph }}</p>
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
