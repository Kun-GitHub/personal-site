import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { postSlug, docParts, docPath, type Doc } from '@/lib/content';

const staticPages = [
  { zh: '/', en: '/en/' },
  { zh: '/blog/', en: '/en/blog/' },
  { zh: '/products/', en: '/en/products/' },
  { zh: '/projects/', en: '/en/projects/' },
  { zh: '/docs/', en: '/en/docs/' },
];

type Page = { zh?: string; en?: string; lastmod?: string };

export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(p, site!).href;
  const pages: Page[] = [...staticPages];

  // 博客：同 slug 有英文版才给 en
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const bySlug = new Map<string, { zh?: typeof posts[number]; en?: typeof posts[number] }>();
  for (const post of posts) {
    const slug = postSlug(post);
    const entry = bySlug.get(slug) ?? {};
    if (post.id.startsWith('zh/')) entry.zh = post;
    else entry.en = post;
    bySlug.set(slug, entry);
  }
  for (const [slug, pair] of bySlug) {
    const date = (pair.zh ?? pair.en)!.data;
    pages.push({
      zh: pair.zh ? `/blog/${slug}/` : undefined,
      en: pair.en ? `/en/blog/${slug}/` : undefined,
      lastmod: (date.updated ?? date.date).toISOString().slice(0, 10),
    });
  }

  // 文档：同产品同路径有英文版才给 en
  const docs = await getCollection('docs');
  const byPath = new Map<string, { zh?: Doc; en?: Doc }>();
  for (const doc of docs) {
    const { product, lang, rest } = docParts(doc);
    const key = `${product}|${rest}`;
    const entry = byPath.get(key) ?? {};
    if (lang === 'zh') entry.zh = doc;
    else entry.en = doc;
    byPath.set(key, entry);
  }
  for (const [key, pair] of byPath) {
    const [product, rest] = key.split('|');
    const updated = (pair.zh ?? pair.en)!.data.updated;
    pages.push({
      zh: pair.zh ? docPath('zh', product, rest) : undefined,
      en: pair.en ? docPath('en', product, rest) : undefined,
      lastmod: updated ? updated.toISOString().slice(0, 10) : undefined,
    });
  }

  const urls = pages
    .flatMap((page) => [
      ...(page.zh ? [{ loc: abs(page.zh), href: page.zh, lang: 'zh-CN', page }] : []),
      ...(page.en ? [{ loc: abs(page.en), href: page.en, lang: 'en', page }] : []),
    ])
    .map(({ loc, href, lang, page }) =>
      [
        '  <url>',
        `    <loc>${loc}</loc>`,
        ...(page.zh ? [`    <xhtml:link rel="alternate" hreflang="zh-CN" href="${abs(page.zh)}"/>`] : []),
        ...(page.en ? [`    <xhtml:link rel="alternate" hreflang="en" href="${abs(page.en)}"/>`] : []),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(page.zh ?? page.en!)}"/>`,
        ...(page.lastmod ? [`    <lastmod>${page.lastmod}</lastmod>`] : []),
        `    <priority>${href === '/' ? '1.0' : lang === 'zh-CN' ? '0.8' : '0.6'}</priority>`,
        '  </url>',
      ].join('\n'),
    )
    .join('\n');

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
