import type { Lang } from '@/i18n/ui';

/**
 * 开源项目清单。跟 products 是两回事：产品是长期运营的，这里是自己写着玩、
 * 代码全公开的东西。加一个项目 = 这里加一条（不需要建内容目录）。
 */
export interface OpenSourceProject {
  slug: string;
  name: string;
  tagline: Record<Lang, string>;
  stack: string[];
  /** 代码仓库。第一个是主仓库，其余是配套的（比如前端） */
  repos: { label: Record<Lang, string>; url: string }[];
}

export const openSource: OpenSourceProject[] = [
  {
    slug: 'saas-zero',
    name: 'SaaS-Zero',
    tagline: {
      zh: '多租户 SaaS 中后台：go-zero + gRPC 拆服务，Ant Design Pro 做界面。租户开通、RBAC 权限、套餐、审计日志都是现成的。',
      en: 'A multi-tenant SaaS admin platform: go-zero + gRPC services with an Ant Design Pro front end. Tenant provisioning, RBAC, plans and audit logs come built in.',
    },
    stack: ['Go', 'go-zero', 'gRPC', 'ent', 'Casbin', 'PostgreSQL', 'React', 'Ant Design Pro'],
    repos: [
      { label: { zh: '后端', en: 'Backend' }, url: 'https://github.com/saas-zero/saas-zero' },
      { label: { zh: '前端', en: 'Frontend' }, url: 'https://github.com/Kun-GitHub/saas-zero-web' },
    ],
  },
  {
    slug: 'mini-ruoyi',
    name: 'mini-ruoyi',
    tagline: {
      zh: '跑在 1 核 1G 上的极简管理系统：一个 Go 二进制加一个前端目录，scp 上去就能跑，不需要 nginx、Node 和数据库服务。',
      en: 'A minimal admin system for a 1-core, 1 GB box: one Go binary plus a front-end directory. scp it up and it runs — no nginx, no Node, no database service.',
    },
    stack: ['Go', 'Gin', 'SQLite', 'Svelte 5'],
    repos: [{ label: { zh: '仓库', en: 'Repository' }, url: 'https://github.com/Kun-GitHub/mini-ruoyi' }],
  },
];
