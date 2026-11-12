import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '@/i18n/ui';

export type Post = CollectionEntry<'posts'>;
export type Doc = CollectionEntry<'docs'>;

/** id 形如 zh/<slug>；语言即目录 */
export const postSlug = (post: Post) => post.id.split('/').slice(1).join('/');

export function postPath(lang: Lang, slug: string) {
  return lang === 'zh' ? `/blog/${slug}/` : `/en/blog/${slug}/`;
}

export async function listPosts(lang: Lang) {
  const all = await getCollection('posts', ({ id, data }) => id.startsWith(`${lang}/`) && !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** id 形如 <product>/<lang>/guide/teacher */
export function docParts(doc: Doc) {
  const [product, lang, ...rest] = doc.id.split('/');
  const tail = rest.join('/');
  return { product, lang: lang as Lang, rest: tail === 'index' ? '' : tail };
}

export function docPath(lang: Lang, product: string, rest = '') {
  const prefix = lang === 'zh' ? '/docs' : '/en/docs';
  return rest ? `${prefix}/${product}/${rest}/` : `${prefix}/${product}/`;
}

/** 某个产品某个语言的文档，按 frontmatter 的 order 排 */
export async function listDocs(lang: Lang, product: string) {
  const all = await getCollection('docs', (doc) => {
    const parts = docParts(doc);
    return parts.product === product && parts.lang === lang;
  });
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

/** 哪些产品有文档（文档中心首页用） */
export async function productsWithDocs(lang: Lang) {
  const all = await getCollection('docs');
  return [...new Set(all.map((d) => docParts(d)).filter((p) => p.lang === lang).map((p) => p.product))];
}

export function formatDate(date: Date, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
