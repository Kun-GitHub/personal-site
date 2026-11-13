import type { Lang } from '@/i18n/ui';
import data from './products.json';

/**
 * 产品清单。数据在 products.json 里（后台 /admin 直接编辑），这里只留类型和导出。
 * 加一个产品 = json 加一条 + 建 src/content/docs/<slug>/ 目录。
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

export const products: Product[] = data.items;
