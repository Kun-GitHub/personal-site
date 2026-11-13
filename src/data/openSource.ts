import type { Lang } from '@/i18n/ui';
import data from './openSource.json';

/**
 * 开源项目清单。数据在 openSource.json 里（后台 /admin 直接编辑）。
 * 与产品清单分开维护，记录开源项目的介绍、技术栈与代码仓库。
 */
export interface OpenSourceProject {
  slug: string;
  name: string;
  tagline: Record<Lang, string>;
  stack: string[];
  /** 代码仓库。第一个是主仓库，其余是配套的（比如前端） */
  repos: { label: Record<Lang, string>; url: string }[];
}

export const openSource: OpenSourceProject[] = data.items;
