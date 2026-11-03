/**
 * 前沿速递数据层：scripts/fetch-feeds.mjs 在构建期生成每日归档
 * src/data/digests/YYYY-MM-DD.json，这里做类型定义与读取。
 *
 * import.meta.glob 是构建期静态枚举：新增归档文件后需要重新构建（dev 模式需重启）。
 */
export interface FeedItem {
  id: string
  source: string
  sourceLabel: string
  /** 内容分类：AI 前沿 / 论文速览 / 工程实践 / 社区热点 / 技术视野 */
  category: string
  title: string
  url: string
  summary: string
  pdfUrl: string | null
  discussionUrl: string | null
  points: number | null
  date: string
}

export interface DigestData {
  /** 归档日期，YYYY-MM-DD */
  date: string
  updatedAt: string | null
  items: FeedItem[]
}

const digestModules = import.meta.glob('/src/data/digests/*.json', { eager: true }) as Record<
  string,
  { default: DigestData }
>

/** 全部归档，按日期倒序。 */
export function getDigests(): DigestData[] {
  return Object.values(digestModules)
    .map((mod) => mod?.default)
    .filter((d): d is DigestData => Boolean(d?.date && d.items?.length))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getLatestDigest(): DigestData | null {
  return getDigests()[0] ?? null
}

export function getDigestByDate(date: string): DigestData | null {
  return getDigests().find((d) => d.date === date) ?? null
}

/** 首页侧栏与归档页每屏展示条数。 */
export const FEED_PAGE_SIZE = 8

/** 首页侧栏归档日期个数。 */
export const ARCHIVE_SIZE = 6

/** 侧栏日期标签："11.3"；跨年带年份，如 "2025.12.31"。 */
export function formatArchiveDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return y === new Date().getFullYear() ? `${m}.${d}` : `${y}.${m}.${d}`
}

/** 归档页完整日期："2026年11月3日"。 */
export function formatFullDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${y}年${m}月${d}日`
}

/** 归档页内相对日期（构建期生成，以最近一次构建为基准）。 */
export function formatFeedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return ''
  const days = Math.floor((Date.now() - date.valueOf()) / 86_400_000)
  if (days <= 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** 归档页分组顺序；未匹配分类的条目归入"其他"。 */
export const DIGEST_CATEGORIES = ['AI 前沿', '论文速览', '工程实践', '社区热点', '技术视野'] as const

export interface DigestGroup {
  category: string
  items: FeedItem[]
}

export function groupDigestItems(items: FeedItem[]): DigestGroup[] {
  const groups: DigestGroup[] = DIGEST_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0)

  const known = new Set<string>(DIGEST_CATEGORIES)
  const others = items.filter((item) => !known.has(item.category))
  if (others.length > 0) groups.push({ category: '其他', items: others })

  return groups
}
