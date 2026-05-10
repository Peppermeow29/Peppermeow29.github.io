<script setup lang="ts">
import { ArrowRight, BookOpen, Clock, Sparkles } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { featuredPost, posts } from '../data/posts'
import { formatDate } from '../utils/formatDate'

const recentPosts = posts.slice(0, 3)
</script>

<template>
  <section class="hero-section">
    <div class="hero-copy">
      <p class="eyebrow">Personal notes on code, design, and writing</p>
      <h1>一个安静、清晰、适合长期写作的个人博客。</h1>
      <p class="hero-lede">
        用 Vue 构建，用 GitHub Pages 发布。记录工程实践、产品观察和那些值得慢慢沉淀的想法。
      </p>
      <div class="hero-actions">
        <RouterLink class="primary-action" to="/articles">
          阅读文章
          <ArrowRight :size="18" />
        </RouterLink>
        <RouterLink class="secondary-action" to="/about">关于我</RouterLink>
      </div>
    </div>

    <aside class="featured-panel" aria-label="推荐文章">
      <div class="panel-topline">
        <span>Featured</span>
        <Sparkles :size="18" />
      </div>
      <h2>{{ featuredPost.title }}</h2>
      <p>{{ featuredPost.description }}</p>
      <div class="post-meta">
        <span>{{ formatDate(featuredPost.date) }}</span>
        <span>{{ featuredPost.readingTime }}</span>
      </div>
      <RouterLink class="text-link" :to="`/articles/${featuredPost.slug}`">
        打开文章
        <ArrowRight :size="16" />
      </RouterLink>
    </aside>
  </section>

  <section class="section-grid">
    <div class="section-heading">
      <p class="eyebrow">Latest writing</p>
      <h2>最近更新</h2>
    </div>

    <div class="post-grid">
      <article v-for="post in recentPosts" :key="post.slug" class="post-card">
        <div>
          <span class="category-pill">{{ post.category }}</span>
          <h3>{{ post.title }}</h3>
          <p>{{ post.description }}</p>
        </div>
        <div class="card-footer">
          <span>
            <Clock :size="15" />
            {{ post.readingTime }}
          </span>
          <RouterLink :to="`/articles/${post.slug}`" aria-label="阅读文章">
            <ArrowRight :size="18" />
          </RouterLink>
        </div>
      </article>
    </div>
  </section>

  <section class="journal-band">
    <div>
      <BookOpen :size="24" />
      <h2>写作方向</h2>
    </div>
    <p>
      这里会持续整理前端工程、部署实践、论文与项目复盘，以及对产品界面和知识管理的观察。
    </p>
  </section>
</template>
