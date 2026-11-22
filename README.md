# 个人站（personal-site）

一个 Astro 工程，产出全静态 HTML，托管在 GitHub Pages，域名 `wkong.kdns.fr`。

## 结构

```
personal-site/
├── src/
│   ├── pages/                 路由（zh 在根，en 在 /en/）
│   ├── content/
│   │   ├── posts/{zh,en}/     博客：目录即语言
│   │   └── docs/<product>/{zh,en}/   各产品文档
│   ├── data/products.json     产品清单（产品站与文档入口，后台可编辑）
│   ├── data/openSource.json   开源项目清单（项目展示与仓库链接，后台可编辑）
│   ├── data/*.ts              两份清单的类型与导出
│   ├── i18n/ui.ts             导航、页脚、按钮等界面文案（中英并列）
│   ├── lib/content.ts         集合读取与路径拼装
│   ├── components/            Nav、Footer、DocsShell、DocsNav、ProjectCard
│   ├── layouts/Base.astro     canonical / hreflang / OG / JSON-LD
│   └── styles/global.css      设计令牌 + 全部样式
├── public/admin/              后台（Sveltia CMS）：index.html + config.yml
├── public/CNAME               wkong.kdns.fr
├── public/.nojekyll           分支发布预构建文件的兼容约定；Actions artifact 发布不依赖它
├── .github/workflows/pages.yml
└── preview/                   渲染留档（改版对照用，不进构建）
```

## 命令

```bash
npm run dev       # http://localhost:4321
npm run build     # 产出 dist/
npm run preview   # 预览构建产物
```

本机两个小坑：npm 缓存目录可能不可写，加 `--cache /tmp/npm-cache`；Astro 遥测写不进 `~/Library/Preferences`，命令前加 `ASTRO_TELEMETRY_DISABLED=1`。

## 加内容

| 想加 | 怎么做 |
| --- | --- |
| 一篇博客 | `src/content/posts/zh/<slug>.md`（要英文版就同 slug 放到 `en/`）。frontmatter：`title` `description` `date`，可选 `updated` `draft` |
| 一篇文档 | `src/content/docs/<product>/zh/<page>.md`，`order` 决定侧栏顺序；`<page>/index` 会被 Astro 折叠成 `/docs/<product>/` |
| 一个产品 | 在 `src/data/products.json` 加一条（或用后台「产品」），并创建 `src/content/docs/<slug>/` 文档目录。产品会显示在首页和产品页，文档路由与 sitemap 自动生成 |
| 一个开源项目 | 在 `src/data/openSource.json` 加一条（或用后台「开源项目」）。项目会显示在首页和开源项目页，并链接到对应代码仓库；不需要文档目录 |

## 后台（/admin）

站点自带的发布界面，读写的就是这个仓库，没有独立数据库。打开 `/admin/` → **使用访问令牌登录**（不需要 OAuth 服务端）。

令牌：GitHub → Settings → Developer settings → **Fine-grained tokens** → 只勾 `personal-site` 仓库，权限 **Contents: Read and write**。

保存一次 = 提交一次到 `main` → 触发 `pages.yml` → 线上生效。图片传到 `public/images/`，正文里引用 `/images/xxx`。

后台覆盖：博客（中/英）、产品清单、开源项目清单。**文档不在后台里**（多级目录，改了会动 URL），继续按上面的「一篇文档」手写。

路径规则：中文 `/blog/<slug>/`、`/docs/<product>/<page>/`；英文全部加 `/en` 前缀。

**没有英文版时不要伪造**：页面照常显示中文，但布局层不会渲染 `hreflang="en"`。声明了却没有内容，搜索引擎会判 hreflang 不可信。

## 部署（GitHub Pages）

1. 仓库 Settings → Pages → Source 选 **GitHub Actions**（不要用 "Deploy from a branch"）
2. 推一次 main，`pages.yml` 构建 `dist/` 并发布
3. Custom domain 填 `wkong.kdns.fr`，Save；等证书签发后勾 **Enforce HTTPS**

**第 1 步没做就先跑 Actions 会失败**：`configure-pages` 调 `GET /repos/{owner}/{repo}/pages` 拿到 404，报 `Get Pages site failed`。此时构建本身是成功的，只是没地方发布。去 Settings 打开 Pages 再 Re-run 即可；action 的 `enablement: true` 选项解决不了——官方说明它需要 `GITHUB_TOKEN` 以外的令牌（PAT 或 GitHub App）。

**Actions 部署方式下 `public/CNAME` 是被忽略的**（只有 "Deploy from a branch" 才读它），自定义域名必须在 Settings 里配。文件留着，将来若换回分支部署仍然有用。

Cloudflare 里的记录（域 `wkong.kdns.fr`，已委托给 CF）：

| 类型 | 名称 | 值 | 代理 |
| --- | --- | --- | --- |
| CNAME | `@` | `kun-github.github.io` | DNS only |
| CNAME | `www` | `wkong.kdns.fr` | DNS only |
| TXT | `_github-pages-challenge-kun-github` | GitHub 给的 token | — |

排查建议：先用 DNS only 验证 GitHub 自定义域名和 HTTPS，再按需测试 Cloudflare 代理（Full strict）。代理并非必然导致签发失败；出现域名检查或后续续证问题时先恢复 DNS only 分层排查。不要把一次签发成功当作永久免维护。

GitHub Pages 与 Cloudflare Pages 是两套托管产品，后者不需要先开启 GitHub Pages。本站这轮只更新内容，不修改上述实际发布工作流与 DNS。完整公开仓库方案见 `/blog/github-pages-cloudflare/`，私有仓库接 Pages 见 `/blog/private-repo-cloudflare-pages/`；两者均不承诺中国大陆全网可达。

## 内容维护

- 首页简介维护在 `src/pages/index.astro` 与 `src/pages/en/index.astro`；详细个人介绍以中英文博客 `about-kong.md` 维护
- 「个人站」系列保持已有 slug：`astro-github-pages`（01，Astro 双语站点）、`github-pages-cloudflare`（02，公开仓库 + GitHub Pages + Cloudflare）、`private-repo-cloudflare-pages`（03，私有仓库 + Cloudflare Pages）；中英文同 slug，01 保留原发布日期，02/03 发布于 2026-11-22
- 社交分享图是 `public/og.png`（1200×630），全站共用；换图保持同名即可

## 与产品站的关系

帮助文档只在这里维护：产品站（`practical-training/www/site`，域名 `https://training.wkong.kdns.fr`）的帮助入口外链到 `https://wkong.kdns.fr/docs/training-platform/`（英文 `/en/docs/training-platform/`）。产品站负责营销文案，本仓库维护使用手册，两边引用同一条能力边界：多节点资源池、自动编排与故障隔离，不承诺平台 / 数据库自动主备或实例迁移。

大肥鱼平台按校授权私有化部署，本体不开源；`products.json` 不展示私有平台源码链接。大肥鱼 ERP 是独立 MIT 镜像项目，在 `openSource.json` 列出 GitHub（国外）与 Gitee（国内）仓库；代码许可不授予「大肥鱼」系列商标使用权。
