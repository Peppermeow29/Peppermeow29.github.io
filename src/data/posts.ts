export type BlogPost = {
  slug: string
  title: string
  description: string
  date: string
  readingTime: string
  category: string
  tags: string[]
  content: string[]
}

export const posts: BlogPost[] = [
  {
    slug: 'build-a-personal-blog',
    title: '从零搭建一个可长期维护的个人博客',
    description:
      '个人博客不需要一开始就复杂，清晰的信息结构、稳定的部署链路和可持续写作流程更重要。',
    date: '2026-05-10',
    readingTime: '6 min',
    category: 'Engineering',
    tags: ['Vue', 'GitHub Pages', 'Writing'],
    content: [
      '个人博客最容易走偏的地方，是一开始就把它设计成一个完整内容平台。真正影响长期维护的，往往是文章能不能快速新增、构建是否稳定、页面是否适合阅读。',
      '这个项目选择 Vue 3 和 Vite，是因为它们足够轻，构建速度快，也方便以后逐步加入标签、搜索、代码高亮和深色模式。',
      'GitHub Pages 的优势是简单。文章和源码在同一个仓库中，推送之后由 GitHub Actions 自动构建并发布，部署链路不依赖个人服务器。',
      '第一版博客应该克制：保留首页、文章列表、文章详情和关于页。等写作频率稳定之后，再根据真实需要增加更复杂的功能。',
    ],
  },
  {
    slug: 'notes-on-quiet-interfaces',
    title: '安静界面的价值',
    description:
      '好的个人站点不一定需要强烈的视觉噪声。版式、层级和留白本身就能建立识别度。',
    date: '2026-05-08',
    readingTime: '4 min',
    category: 'Design',
    tags: ['UI', 'Typography', 'Frontend'],
    content: [
      '安静的界面并不等于缺少设计。它把更多注意力交给内容，让标题、摘要和正文之间的层级承担视觉表达。',
      '这类界面通常使用温暖的底色、清晰的深色文字、细边框和克制的强调色。它不会频繁打断阅读，但仍然有明确的品牌气质。',
      '在博客中，真正需要强调的是当前文章、分类入口和关键操作。其余部分应该尽量退后，避免和正文争夺注意力。',
    ],
  },
  {
    slug: 'github-pages-deploy-flow',
    title: 'GitHub Pages 的自动部署流程',
    description:
      '通过 GitHub Actions 构建静态资源，再把 dist 目录发布到 Pages，适合个人博客和文档站。',
    date: '2026-05-05',
    readingTime: '5 min',
    category: 'Deployment',
    tags: ['CI', 'Vite', 'GitHub Actions'],
    content: [
      'Vite 项目部署到 GitHub Pages 时，最重要的是正确设置 base 路径。如果仓库不是用户名.github.io，构建后的资源路径需要带上仓库名。',
      '自动部署可以减少很多手工操作。每次推送到 main 分支后，Actions 安装依赖、执行构建，然后把产物发布到 GitHub Pages。',
      '对个人项目来说，这条链路已经足够可靠。后续只需要维护文章内容和少量组件，不需要关心服务器状态。',
    ],
  },
]

export const featuredPost = posts[0]
