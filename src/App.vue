<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Github, Menu, X } from 'lucide-vue-next'

const route = useRoute()
const isMenuOpen = ref(false)

const navItems = [
  { label: '首页', to: '/' },
  { label: '文章', to: '/articles' },
  { label: '关于', to: '/about' },
]

const currentYear = computed(() => new Date().getFullYear())

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/" aria-label="MyBlog 首页" @click="closeMenu">
        <span class="brand-mark">M</span>
        <span>MyBlog</span>
      </RouterLink>

      <nav class="desktop-nav" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="{ active: route.path === item.to }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <a
        class="header-link"
        href="https://github.com/"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
      >
        <Github :size="18" />
      </a>

      <button
        class="menu-button"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-label="打开导航"
        @click="isMenuOpen = !isMenuOpen"
      >
        <X v-if="isMenuOpen" :size="20" />
        <Menu v-else :size="20" />
      </button>
    </header>

    <nav v-if="isMenuOpen" class="mobile-nav" aria-label="移动端导航">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        @click="closeMenu"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <main>
      <RouterView />
    </main>

    <footer class="site-footer">
      <div>
        <strong>MyBlog</strong>
        <p>把工程经验、阅读笔记和长期思考留在一个安静的地方。</p>
      </div>
      <span>© {{ currentYear }}</span>
    </footer>
  </div>
</template>
