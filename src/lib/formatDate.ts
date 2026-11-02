/**
 * 日期字段是纯日期，按 UTC 格式化，避免在负时区被"减去一天"。
 */
export function formatDate(value: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(value)
}
