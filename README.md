# Peppermeow29 Blog

这是一个使用 Vue 3 + Vite 搭建的个人静态博客，计划部署到 GitHub Pages 作为 GitHub 主页博客。

线上访问地址：

```text
https://peppermeow29.github.io/
```

对应 GitHub 仓库名：

```text
Peppermeow29.github.io
```

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- GitHub Pages
- GitHub Actions

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物会生成在 `dist/` 目录中，该目录不需要手动提交。

## GitHub Pages 部署

第一次推送前，先在 GitHub 创建仓库：

```text
Peppermeow29.github.io
```

然后在本地项目目录执行：

```bash
git init
git branch -M main
git add .
git commit -m "init myblog"
git remote add origin https://github.com/Peppermeow29/Peppermeow29.github.io.git
git push -u origin main
```

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动执行：

1. 安装依赖
2. 执行生产构建
3. 上传 `dist/`
4. 发布到 GitHub Pages

## GitHub Pages 设置

进入仓库页面：

```text
Settings -> Pages
```

将发布来源设置为：

```text
GitHub Actions
```

部署完成后，访问：

```text
https://peppermeow29.github.io/
```

## 内容维护

当前文章数据位于：

```text
src/data/posts.ts
```

新增文章时，在 `posts` 数组中继续添加一条文章数据即可。
