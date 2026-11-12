// @ts-check
import { defineConfig } from 'astro/config';

// site 决定 canonical / hreflang / sitemap 里的绝对地址。
// 换域名只改这一行。
export default defineConfig({
  site: 'https://wkong.kdns.fr',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'auto' },
});
