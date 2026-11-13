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
│   ├── data/products.json     产品清单（唯一数据源，后台可编辑）
│   ├── data/openSource.json   开源项目清单（同上）
│   ├── data/*.ts              上面两份数据的类型与导出
│   ├── i18n/ui.ts             导航、页脚、按钮等界面文案（中英并列）
│   ├── lib/content.ts         集合读取与路径拼装
│   ├── components/            Nav、Footer、DocsShell、DocsNav、ProjectCard
│   ├── layouts/Base.astro     canonical / hreflang / OG / JSON-LD
│   └── styles/global.css      设计令牌 + 全部样式
├── public/admin/              后台（Sveltia CMS）：index.html + config.yml
├── public/CNAME               wkong.kdns.fr
├── public/.nojekyll           不加它 GitHub 会用 Jekyll 吃掉 _astro/
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
| 一个产品 | `src/data/products.json` 加一条（或用后台「产品」）+ 建 `src/content/docs/<slug>/`。路由、文档目录、sitemap 自动跟上 |
| 一个开源项目 | `src/data/openSource.json` 加一条（或用后台「开源项目」）。只有数据，没有内容目录 |

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

Cloudflare 里的记录（域 `wkong.kdns.fr`，已委托给 CF）：

| 类型 | 名称 | 值 | 代理 |
| --- | --- | --- | --- |
| CNAME | `@` | `kun-github.github.io` | DNS only |
| CNAME | `www` | `wkong.kdns.fr` | DNS only |
| TXT | `_github-pages-challenge-kun-github` | GitHub 给的 token | — |

顺序不能反：**先灰云签证书，再开橙云**（SSL 模式 Full strict）。开着代理时 GitHub 拿不到 HTTP-01 验证，证书永远签不下来。

## 待替换的占位

- 首页文案（`src/pages/index.astro`、`src/pages/en/index.astro`）里那句自我介绍是按结构写的，改成自己的话
- 示例文章 `posts/*/astro-github-pages.md` 可留可删

## 与产品站的关系

帮助文档只在这里维护：产品站（`practical-training/www/site`，域名 `https://training.wkong.kdns.fr`）已删掉自己的 `/docs` 内容与路由，导航和页脚的「帮助文档」直接外链到 `https://wkong.kdns.fr/docs/training-platform/`（英文 `/en/docs/training-platform/`）。改文档只改本仓库，产品站不用动。
