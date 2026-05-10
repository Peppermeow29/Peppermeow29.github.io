# MyBlog

Vue 3 + Vite 静态个人博客，适合部署到 GitHub Pages。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## GitHub Pages 部署

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并发布 `dist`。

仓库 Settings 中需要启用 Pages，并选择 GitHub Actions 作为发布来源。

如果仓库名是 `myblog`，访问地址通常是：

```text
https://你的用户名.github.io/myblog/
```

如果仓库名是 `你的用户名.github.io`，访问地址通常是：

```text
https://你的用户名.github.io/
```
