/**
 * 站点级文案与导航。中英并列放在一处，改一行两边都能看到。
 * 换域名只改 site.url（以及 astro.config.mjs 的 site）。
 */
export const site = {
  url: 'https://wkong.kdns.fr',
  name: 'Kong',
  github: 'https://github.com/Kun-GitHub',
} as const;

export type Lang = 'zh' | 'en';

export const ui = {
  zh: {
    brand: 'Kong',
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
    otherLang: 'EN',
    nav: [
      { href: '/', label: '首页' },
      { href: '/blog/', label: '博客' },
      { href: '/products/', label: '产品' },
      { href: '/projects/', label: '开源项目' },
      { href: '/docs/', label: '文档' },
    ],
    tags: {
      latest: '最新文章',
      morePosts: '全部文章',
      allProducts: '全部产品',
      products: '产品',
      productsLead: '我在做的东西。各自有独立的站点，文档统一放在这里。',
      projects: '开源项目',
      allProjects: '全部开源项目',
      projectsLead: '业余时间写的代码，全部开源。这些不是产品：产品要长期运营、有用户和文档；这些是自己想弄明白某件事时顺手写的，代码公开，随时可以拿去改。',
      docs: '文档',
      site: '站点',
      docsLead: '按产品分。选一个产品，左侧是目录。',
      readMore: '阅读',
      empty: '还没有内容。',
    },
    footer: {
      tagline: '写代码，做产品，把过程记下来。',
      links: [
        { href: '/blog/', label: '博客' },
        { href: '/products/', label: '产品' },
        { href: '/projects/', label: '开源项目' },
        { href: '/docs/', label: '文档' },
      ],
      rights: '内容按 CC BY 4.0 共享',
    },
    docs: {
      siteTitle: '文档',
      crumbHome: '首页',
      crumbDocs: '文档',
      navTitle: '文档目录',
      toc: '本页目录',
      prev: '上一篇',
      next: '下一篇',
      backHome: '返回文档首页',
      listTitle: '文档',
      listLead: '按产品分。选一个产品，左侧是目录。',
      chooseProduct: '选产品',
    },
    notFound: {
      title: '页面不存在',
      lead: '链接可能已经改过，或者地址少了一截。',
      back: '回首页',
    },
  },
  en: {
    brand: 'Kong',
    htmlLang: 'en',
    ogLocale: 'en_US',
    otherLang: '中文',
    nav: [
      { href: '/en/', label: 'Home' },
      { href: '/en/blog/', label: 'Blog' },
      { href: '/en/products/', label: 'Products' },
      { href: '/en/projects/', label: 'Open source' },
      { href: '/en/docs/', label: 'Docs' },
    ],
    tags: {
      latest: 'Latest posts',
      morePosts: 'All posts',
      allProducts: 'All products',
      products: 'Products',
      productsLead: 'Things I build. Each one has its own site; the docs live here.',
      projects: 'Open source',
      allProjects: 'All open-source projects',
      projectsLead: 'Code I write on my own time, all of it open source. These are not the products above: products are meant to run for years, with users and documentation. These exist because I wanted to figure something out.',
      docs: 'Docs',
      site: 'Site',
      docsLead: 'Grouped by product. Pick one, the table of contents is on the left.',
      readMore: 'Read',
      empty: 'Nothing here yet.',
    },
    footer: {
      tagline: 'Software, products, and notes on how they were made.',
      links: [
        { href: '/en/blog/', label: 'Blog' },
        { href: '/en/products/', label: 'Products' },
        { href: '/en/projects/', label: 'Open source' },
        { href: '/en/docs/', label: 'Docs' },
      ],
      rights: 'Content licensed CC BY 4.0',
    },
    docs: {
      siteTitle: 'Docs',
      crumbHome: 'Home',
      crumbDocs: 'Docs',
      navTitle: 'Contents',
      toc: 'On this page',
      prev: 'Previous',
      next: 'Next',
      backHome: 'Back to docs',
      listTitle: 'Documentation',
      listLead: 'Grouped by product. Pick one, the table of contents is on the left.',
      chooseProduct: 'Choose a product',
    },
    notFound: {
      title: 'Page not found',
      lead: 'The link may have changed, or a path segment is missing.',
      back: 'Back home',
    },
  },
} as const;
