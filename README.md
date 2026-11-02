# Z.Coding Blog

一个用 Astro 构建的静态个人博客，纯静态输出，没有前端框架运行时（只有移动端菜单和文章搜索两段内联脚本），部署在 GitHub Pages。

线上访问地址：

```text
https://peppermeow29.github.io/
```

对应 GitHub 仓库名：

```text
Peppermeow29.github.io
```

## 技术栈

- Astro（静态输出，内容集合 + Zod 校验）
- Markdown 写文章
- TypeScript
- GitHub Pages + GitHub Actions

## 本地运行

需要 Node.js >= 22.23.4（Astro 7 的最低要求）。

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

构建产物在 `dist/`，不需要手动提交。

## 目录结构

```text
src/
├─ content/blog/        文章（.md），文件名即 URL slug
├─ content.config.ts    内容集合与 frontmatter schema
├─ components/          SiteHeader、SiteFooter、PostCard
├─ layouts/             BaseLayout（负责 title / description / OG 等 head 信息）
├─ lib/                 posts、日期格式化、base 路径拼接
├─ pages/               路由，文件路径即 URL
├─ styles/main.css      全站样式（CSS 变量集中在 :root）
└─ assets/              参与构建的图片（会被压缩并生成多尺寸）
```

## 写一篇新文章

在 `src/content/blog/` 下新建文件，例如 `my-post.md`，文件名就是访问路径 `/articles/my-post/`：

```md
---
title: '文章标题'
description: '一句话摘要，会用于列表和 SEO 描述'
date: 2026-11-02
readingTime: '8 min'
category: 'Engineering'
tags: ['Astro', '部署']
cover: ../../assets/cover-my-post.jpg
coverAlt: '封面图描述'
draft: false
featured: false
---

正文从这里开始。`##` 是小节标题，代码块用三个反引号。
```

frontmatter 由 `src/content.config.ts` 里的 Zod schema 校验：字段缺失或日期格式不对，**构建会直接失败**，不会带着错误上线。

- `draft: true` 的文章不会出现在列表和构建产物中
- `featured: true` 的文章会占据首页右侧的 Featured 面板
- `cover` 使用相对路径导入，构建时自动压缩并生成多尺寸

## 链接卡片

正文里想要飞书那种链接卡片，直接写一小段 HTML（Markdown 支持原生 HTML），外面套一层 `<div>` 让它成为独立的块级元素：

```html
<div>
  <a class="link-card" href="https://example.com" target="_blank" rel="noreferrer">
    <span class="link-card-main">
      <span class="link-card-body">
        <strong class="link-card-title">卡片标题</strong>
        <span class="link-card-desc">卡片描述，最多显示两行</span>
      </span>
      <span class="link-card-site">example.com</span>
    </span>
  </a>
</div>
```

带预览图时给 `<a>` 加上 `has-preview`，并在最前面插入一张图，图片放在 `public/covers/` 下：

```html
<div>
  <a class="link-card has-preview" href="https://example.com" target="_blank" rel="noreferrer">
    <img class="link-card-preview" src="/covers/example.jpg" alt="预览图" loading="lazy" />
    <span class="link-card-main">…</span>
  </a>
</div>
```

> Markdown 会把 `<` 当作 HTML 起始符。正文里要在纯文本中写 `<function>` 这类尖括号，请写成 `&lt;function&gt;`，或者用反引号包成行内代码。

## 订阅与索引

构建时会额外生成三个文件：

- `/rss.xml`：RSS 2.0 订阅源，内容取自文章列表
- `/sitemap.xml`：包含首页、文章列表、关于页和全部文章
- `/robots.txt`：允许全站抓取并指向 sitemap

新增页面后如果想让它出现在 sitemap 里，改 `src/pages/sitemap.xml.ts` 的 `entries` 数组即可。

## 质量检查

```bash
npm run check   # astro check，类型与模板检查
```

CI 会在构建前先跑一次 `npm run check`，有类型错误就直接失败。

## 部署

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动：

1. 安装依赖
2. 执行 `npm run build`
3. 上传 `dist/`
4. 发布到 GitHub Pages

仓库的 `Settings → Pages` 里，发布来源需要选 **GitHub Actions**。

## 路径与 base

`astro.config.mjs` 会根据仓库名自动决定 `base`：

- 仓库名是 `Peppermeow29.github.io`（用户主页）→ `base = '/'`
- 其他仓库名 → `base = '/仓库名'`

站内链接统一用 `src/lib/url.ts` 的 `withBase()` 拼接，切仓库时不用手动改链接。`site` 默认取 `https://peppermeow29.github.io`，可以用环境变量 `SITE_URL` 覆盖。
