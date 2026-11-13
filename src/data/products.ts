import type { Lang } from '@/i18n/ui';

/**
 * 产品清单。加一个产品 = 这里加一条 + 建 src/content/docs/<slug>/ 目录。
 * 路由、文档目录、sitemap 都从这份清单和内容文件长出来。
 */
export interface Product {
  slug: string;
  name: Record<Lang, string>;
  tagline: Record<Lang, string>;
  /** 产品自己的站点 */
  url: string;
  status: Record<Lang, string>;
  repo?: string;
}

export const products: Product[] = [
  {
    slug: 'training-platform',
    name: {
      zh: '大肥鱼项目实训平台',
      en: 'Dafeiyu Project Training Platform',
    },
    tagline: {
      zh: '给高校软件项目实训用的平台：教师建课分组，学生各拿一台真实的 ERP 环境做测试任务。',
      en: 'A project-training platform for university software courses: teachers set up the module, every student gets a real ERP environment to test.',
    },
    url: 'https://training.wkong.kdns.fr',
    status: { zh: '在售', en: 'Available' },
    repo: 'https://github.com/Kun-GitHub/practical-training',
  },
];
