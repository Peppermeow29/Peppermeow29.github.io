/**
 * 构建期 RSS/Atom 抓取：多元前沿技术内容聚合，按日期归档。
 *
 * 内容分五类（category），来源覆盖官方博客、代码发布与技术社区：
 * - AI 前沿：OpenAI / Google DeepMind / Hugging Face 官方博客，
 *   DeepSeek 与 Moonshot AI (Kimi) 的 GitHub Releases（技术报告与模型发布）
 * - 论文速览：arXiv cs.AI（论文与 PDF 通道）
 * - 工程实践：GitHub Blog、美团技术团队、Go Blog
 * - 社区热点：Hacker News
 * - 技术视野：阮一峰科技爱好者周刊、少数派、爱范儿、Solidot
 *
 * 输出（每日归档，按日期沉淀，供首页侧栏与 /digest/ 归档页消费）：
 * - src/data/digests/YYYY-MM-DD.json ：当天抓到的全部新条目（同日多次运行按 id 合并去重）
 * - src/data/feeds-state.json        ：GUID 状态库（跨日去重，30 天 TTL）
 *
 * 设计约定：
 * - 单源失败只告警，不影响其余源；
 * - 全部源失败时不写任何归档文件，保证 astro build 不被打断；
 * - 日期按 UTC 取整：CI 在 UTC 1:00（北京 9:00）运行，与北京日期一致。
 *
 * 本地运行：node scripts/fetch-feeds.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { XMLParser } from 'fast-xml-parser'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = resolve(root, 'src/data')
const DIGEST_DIR = resolve(DATA_DIR, 'digests')
const STATE_FILE = resolve(DATA_DIR, 'feeds-state.json')

/** 单日归档条目软上限，防御异常 feed 撑爆文件。 */
const MAX_ITEMS_PER_DAY = 60
const SEEN_TTL_MS = 30 * 24 * 60 * 60 * 1000
const FETCH_TIMEOUT_MS = 20_000
const SUMMARY_MAX_CHARS = 160
const USER_AGENT = 'zcoding-blog-feed-fetcher/1.0 (personal blog digest; contact via github)'

/**
 * format 说明：
 * - rss  ：通用 RSS 2.0（OpenAI / DeepMind / GitHub Blog / 少数派 / 阮一峰等）
 * - atom ：通用 Atom（GitHub Releases 等）
 * - hnrss：hnrss.org，附带 HN 讨论链接与积分
 * - arxiv：arXiv RSS，摘要需清理 "Announce Type ... Abstract:" 前缀
 */
const SOURCES = [
  {
    id: 'openai',
    label: 'OpenAI',
    url: 'https://openai.com/news/rss.xml',
    category: 'AI 前沿',
    format: 'rss',
    perSource: 4,
  },
  {
    id: 'deepmind',
    label: 'Google DeepMind',
    url: 'https://deepmind.google/blog/rss.xml',
    category: 'AI 前沿',
    format: 'rss',
    perSource: 4,
  },
  {
    id: 'huggingface',
    label: 'Hugging Face',
    url: 'https://huggingface.co/blog/feed.xml',
    category: 'AI 前沿',
    format: 'rss',
    perSource: 4,
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    url: 'https://github.com/deepseek-ai/DeepSeek-V3/releases.atom',
    category: 'AI 前沿',
    format: 'atom',
    perSource: 4,
  },
  {
    id: 'moonshot',
    label: 'Moonshot AI',
    url: 'https://github.com/MoonshotAI/Kimi-K2/releases.atom',
    category: 'AI 前沿',
    format: 'atom',
    perSource: 4,
  },
  {
    id: 'arxiv-cs-ai',
    label: 'arXiv · cs.AI',
    url: 'https://export.arxiv.org/rss/cs.AI',
    category: '论文速览',
    format: 'arxiv',
    perSource: 4,
  },
  {
    id: 'github-blog',
    label: 'GitHub Blog',
    url: 'https://github.blog/feed/',
    category: '工程实践',
    format: 'rss',
    perSource: 4,
  },
  {
    id: 'meituan-tech',
    label: '美团技术团队',
    url: 'https://tech.meituan.com/feed/',
    category: '工程实践',
    format: 'rss',
    perSource: 3,
  },
  {
    id: 'go-blog',
    label: 'Go Blog',
    url: 'https://go.dev/blog/feed.atom',
    category: '工程实践',
    format: 'atom',
    perSource: 3,
  },
  {
    id: 'hackernews',
    label: 'Hacker News',
    url: 'https://hnrss.org/front_page',
    category: '社区热点',
    format: 'hnrss',
    perSource: 8,
  },
  {
    id: 'ruanyifeng',
    label: '阮一峰周刊',
    url: 'http://www.ruanyifeng.com/blog/atom.xml',
    category: '技术视野',
    format: 'rss',
    perSource: 3,
  },
  {
    id: 'sspai',
    label: '少数派',
    url: 'https://sspai.com/feed',
    category: '技术视野',
    format: 'rss',
    perSource: 3,
  },
  {
    id: 'ifanr',
    label: '爱范儿',
    url: 'https://www.ifanr.com/feed',
    category: '技术视野',
    format: 'rss',
    perSource: 3,
  },
  {
    id: 'solidot',
    label: 'Solidot',
    url: 'https://www.solidot.org/index.rss',
    category: '技术视野',
    format: 'rss',
    perSource: 4,
  },
]

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

/** fast-xml-parser 对单条目返回对象、多条目返回数组，统一成数组。 */
function asArray(value) {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

/** 元素带属性时（如 <guid isPermaLink>）fast-xml-parser 返回对象，取其 #text。 */
function textOf(value) {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') return String(value['#text'] ?? '')
  return String(value)
}

/** 去掉 HTML 标签并解码常见实体，可选清理 arXiv 的元信息前缀。 */
function stripHtml(value, { cleanArxivPrefix = false } = {}) {
  if (!value) return ''
  let text = value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (cleanArxivPrefix) {
    text = text.replace(/^arXiv:\S+\s*(?:Announce Type:\s*\S+)?\s*Abstract:\s*/i, '')
  }
  return text
}

function truncate(value, max = SUMMARY_MAX_CHARS) {
  if (value.length <= max) return value
  return `${value.slice(0, max).replace(/\s+\S*$/, '')}…`
}

function parseDate(value) {
  const date = new Date(value ?? '')
  return Number.isNaN(date.valueOf()) ? new Date() : date
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** 瞬时故障（502/超时）重试一次；CDN 对突发请求敏感，串行抓取更稳。 */
async function fetchFeedWithRetry(source, attempts = 2) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchFeed(source)
    } catch (error) {
      lastError = error
      if (attempt < attempts) await sleep(1500)
    }
  }
  throw lastError
}

async function fetchFeed(source) {
  const response = await fetch(source.url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  const xml = await response.text()
  const parsed = parser.parse(xml)

  if (parsed?.rss?.channel) {
    return asArray(parsed.rss.channel.item)
      .map((item) => normalizeRssItem(item, source))
  }
  if (parsed?.feed) {
    return asArray(parsed.feed.entry)
      .map((entry) => normalizeAtomItem(entry, source))
  }
  throw new Error('响应不是有效的 RSS/Atom 文档')
}

/** RSS 2.0 条目；hnrss 分支附带讨论链接与积分。 */
function normalizeRssItem(item, source) {
  const link = textOf(item.link)
  const guid = textOf(item.guid)
  const isHn = source.format === 'hnrss'

  let summary = ''
  if (source.format === 'arxiv') {
    summary = truncate(stripHtml(textOf(item.description), { cleanArxivPrefix: true }))
  } else if (!isHn) {
    summary = truncate(stripHtml(textOf(item.description)))
  }

  const discussion = isHn
    ? textOf(item.comments) || (guid.includes('news.ycombinator.com') ? guid : '')
    : ''
  const points = isHn ? Number(textOf(item['hnp:points'])) : NaN

  return {
    id: guid || link,
    source: source.id,
    sourceLabel: source.label,
    category: source.category,
    title: stripHtml(textOf(item.title)),
    url: link,
    summary,
    pdfUrl: null,
    discussionUrl: discussion || null,
    points: Number.isFinite(points) ? points : null,
    date: parseDate(textOf(item.pubDate)),
  }
}

/** Atom 条目（GitHub Releases 等）：link 为 href 属性，日期用 published/updated。 */
function normalizeAtomItem(entry, source) {
  const links = asArray(entry.link)
  const primary =
    links.find((l) => l?.['@_rel'] === 'alternate') ?? links.find((l) => !l?.['@_rel']) ?? links[0]
  const link = primary ? textOf(primary['@_href']) || textOf(primary) : ''
  const summary = truncate(stripHtml(textOf(entry.summary) || textOf(entry.content)))

  return {
    id: textOf(entry.id) || link,
    source: source.id,
    sourceLabel: source.label,
    category: source.category,
    title: stripHtml(textOf(entry.title)),
    url: link,
    summary,
    pdfUrl: null,
    discussionUrl: null,
    points: null,
    date: parseDate(textOf(entry.published) || textOf(entry.updated)),
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return fallback
  }
}

async function main() {
  await mkdir(DIGEST_DIR, { recursive: true })
  const state = await readJson(STATE_FILE, { seen: {} })
  const seen = { ...state.seen }
  const nowDate = new Date()
  const now = nowDate.valueOf()

  // 清理 30 天前的旧 GUID，防止状态文件无限膨胀。
  for (const [guid, firstSeen] of Object.entries(seen)) {
    if (now - new Date(firstSeen).valueOf() > SEEN_TTL_MS) delete seen[guid]
  }

  const collected = []
  let okSources = 0

  for (const source of SOURCES) {
    try {
      const items = await fetchFeedWithRetry(source)
      okSources += 1
      collected.push(...items)
    } catch (error) {
      console.warn(`[feeds] 源抓取失败 ${source.label} (${source.url}):`, error?.message ?? error)
    }
    await sleep(1000)
  }

  if (okSources === 0) {
    // 归档是持久沉淀：全源失败时不动当天文件，构建继续。
    console.warn('[feeds] 全部源抓取失败，保持归档不变，构建继续。')
    return
  }

  // 每源内部按日期倒序并限量，防止单一大流量源霸榜。
  const perSource = new Map()
  for (const item of collected) {
    if (!item.title || !item.url) continue
    const queue = perSource.get(item.source) ?? []
    queue.push(item)
    perSource.set(item.source, queue)
  }
  for (const [sourceId, queue] of perSource) {
    queue.sort((a, b) => b.date.valueOf() - a.date.valueOf())
    perSource.set(
      sourceId,
      queue.slice(0, SOURCES.find((s) => s.id === sourceId)?.perSource ?? 6),
    )
  }

  // 去重：跨日由 seen 拦截（一条消息只在首次抓到那天入档），同批次内重复只留一条。
  const deduped = []
  for (const queue of perSource.values()) {
    for (const item of queue) {
      if (seen[item.id]) continue
      seen[item.id] = nowDate.toISOString()
      deduped.push(item)
    }
  }

  if (deduped.length === 0) {
    console.log(`[feeds] 抓取完成：${okSources}/${SOURCES.length} 个源成功，无新增条目，归档不变。`)
    await writeFile(STATE_FILE, JSON.stringify({ seen }, null, 2) + '\n')
    return
  }

  deduped.sort((a, b) => b.date.valueOf() - a.date.valueOf())
  const newItems = deduped
    .slice(0, MAX_ITEMS_PER_DAY)
    .map(({ date, ...rest }) => ({ ...rest, date: date.toISOString() }))

  // 写入（合并进）当日归档：同一天多次运行按 id 合并去重。
  const digestDate = nowDate.toISOString().slice(0, 10)
  const digestFile = resolve(DIGEST_DIR, `${digestDate}.json`)
  const existing = await readJson(digestFile, { date: digestDate, updatedAt: null, items: [] })
  const mergedIds = new Set(existing.items.map((item) => item.id))
  const items = [...newItems.filter((item) => !mergedIds.has(item.id)), ...existing.items].slice(
    0,
    MAX_ITEMS_PER_DAY,
  )
  items.sort((a, b) => parseDate(b.date).valueOf() - parseDate(a.date).valueOf())

  await writeFile(
    digestFile,
    JSON.stringify({ date: digestDate, updatedAt: nowDate.toISOString(), items }, null, 2) + '\n',
  )
  await writeFile(STATE_FILE, JSON.stringify({ seen }, null, 2) + '\n')

  console.log(
    `[feeds] 抓取完成：${okSources}/${SOURCES.length} 个源成功，本次新增 ${newItems.length} 条，归档 ${digestDate}.json 共 ${items.length} 条，状态库 ${Object.keys(seen).length} 条。`,
  )
}

main().catch((error) => {
  // 抓取是内容增强而非构建关键路径：任何异常都不应打断 astro build。
  console.warn('[feeds] 抓取脚本异常终止（构建继续）:', error?.message ?? error)
})
