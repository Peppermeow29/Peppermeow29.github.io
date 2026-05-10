<script setup lang="ts">
import { Github, Mail, PenLine } from 'lucide-vue-next'
</script>

<template>
  <section class="page-intro about-intro">
    <p class="eyebrow">About</p>
    <h1>关于 MyBlog</h1>
    <p>
      这是一个用于记录个人技术实践和思考的静态博客。它关注稳定、清晰和可维护，而不是复杂的后台系统。
    </p>
  </section>

  <section class="about-layout">
    <div class="about-main">
      <h2>写什么</h2>
      <p>
        这里会记录 Vue 前端开发、项目部署、工程问题排查、论文写作整理，以及一些关于产品界面和长期学习的笔记。
      </p>
      <p>
        博客使用 Git 管理内容，部署在 GitHub Pages 上。每篇文章都应该能被持续修改，而不是写完之后就变成难以维护的静态页面。
      </p>
    </div>

    <aside class="contact-panel">
      <h2>联系</h2>
      <a href="mailto:hello@example.com">
        <Mail :size="18" />
        hello@example.com
      </a>
      <a href="https://github.com/" target="_blank" rel="noreferrer">
        <Github :size="18" />
        GitHub
      </a>
      <a href="/articles">
        <PenLine :size="18" />
        继续阅读
      </a>
    </aside>
  </section>
</template>
