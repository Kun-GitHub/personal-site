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
      productsLead: '这里介绍我持续开发和维护的产品。每个产品设有独立站点，相关文档集中于此。',
      projects: '开源项目',
      allProjects: '全部开源项目',
      projectsLead: '这里收录个人开发并开源的项目。它们用于探索具体的技术问题，与面向长期运营的产品分开维护。',
      docs: '文档',
      site: '站点',
      docsLead: '文档按产品归类，选择产品后可通过侧栏浏览各章节。',
      readMore: '阅读',
      empty: '暂无内容。',
    },
    footer: {
      tagline: '记录软件实践、产品与开发过程。',
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
      listLead: '文档按产品归类，选择产品后可通过侧栏浏览各章节。',
      chooseProduct: '选产品',
    },
    notFound: {
      title: '页面不存在',
      lead: '页面可能已移动，或当前地址有误。',
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
      productsLead: 'Products I develop and maintain. Each has its own site, with documentation collected here.',
      projects: 'Open source',
      allProjects: 'All open-source projects',
      projectsLead: 'This section lists open-source projects I develop independently. Each explores a specific technical problem and is maintained separately from the products intended for long-term use.',
      docs: 'Docs',
      site: 'Site',
      docsLead: 'Documentation is organised by product. Select a product to browse its chapters in the sidebar.',
      readMore: 'Read',
      empty: 'No content available yet.',
    },
    footer: {
      tagline: 'Notes on software, products, and the work behind them.',
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
      listLead: 'Documentation is organised by product. Select a product to browse its chapters in the sidebar.',
      chooseProduct: 'Choose a product',
    },
    notFound: {
      title: 'Page not found',
      lead: 'The page may have moved, or the address may be incorrect.',
      back: 'Back home',
    },
  },
} as const;
