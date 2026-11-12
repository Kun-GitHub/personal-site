import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 博客：id 形如 zh/<slug> / en/<slug>，目录即语言
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

// 产品文档：id 形如 <product>/<lang>/guide/teacher
// 加一个产品的文档 = 建目录，不需要改任何路由代码
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().default(999),
  }),
});

export const collections = { posts, docs };
