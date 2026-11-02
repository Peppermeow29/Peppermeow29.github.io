import { getCollection, type CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'blog'>

/** 已发布文章，按日期倒序。草稿在构建期就被过滤掉。 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft)
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

/** 文章的站内路径（未加 base，交给 withBase 处理）。 */
export function postPath(post: Post) {
  return `/articles/${post.id}/`
}
