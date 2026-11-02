/** 拼接部署根路径，兼容 GitHub Pages 的项目子路径（base）。 */
export function withBase(path = '') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const clean = path.replace(/^\//, '')
  return clean ? `${base}/${clean}` : `${base}/`
}

/** 把当前 URL 归一化成站内相对路径，用于导航高亮。 */
export function toRelativePath(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const stripped = pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  return stripped.replace(/\/+$/, '') || '/'
}
