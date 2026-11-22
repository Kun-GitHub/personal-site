---
title: "【个人站 03】私有仓库接 Cloudflare Pages：源码不公开，静态网站照样发布与国内访问"
description: 用 Cloudflare Pages 的 Git 集成从 GitHub 私有仓库构建 Astro 静态站，配置 monorepo、自定义域名与预览访问保护，并梳理国内访问和源码保密的边界。
date: 2026-11-22
---

[个人站 02](/blog/github-pages-cloudflare/)介绍了公开仓库的 GitHub Pages + Cloudflare 方案。这一篇换一个场景：**网站源码不能公开，但官网、博客或产品文档需要公开访问**。

我给大肥鱼项目实训平台准备官网时，遇到的就是这个问题：平台源码在私有仓库中，官网是同仓库内单独的 Astro 静态工程；不能为了发一个官网，就把整个平台仓库改成公开。

> 推荐路径：GitHub 私有仓库 → Cloudflare Pages Git 集成 → 构建静态产物 → 自定义域名。**不用先开 GitHub Pages**，也不用先买 GitHub Pro 来解锁私有仓库的 GitHub Pages。仓库保持 Private；部署后的网站默认仍公开。

## 1. 私有源码与私有网站，是两件事

| 希望实现的事情 | 对应机制 |
| --- | --- |
| 别人看不到完整仓库、提交记录和未发布源文件 | GitHub 私有仓库及正确的仓库权限 |
| Cloudflare 有权拉取源码并构建 | Cloudflare Workers & Pages GitHub App 授权 |
| 读者能访问官网 | Cloudflare Pages 发布产物与域名配置 |
| 预览稿只让团队看 | 配置 Cloudflare Access，不能只靠链接难猜 |
| 国内稳定访问 | 实际网络测试、资源优化；必要时合规境内托管 / CDN |

[GitHub 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)：GitHub Free 账户通过 GitHub Pages 发站点时，仓库需要公开；其他套餐能力需查看当时政策。Cloudflare Pages 的 [Git 集成](https://developers.cloudflare.com/pages/get-started/git-integration/)明确支持公开与私有 GitHub 仓库，两者不要混为一谈。

私有仓库也不意味着客户端代码保密：浏览器下载到的 HTML、CSS、JS、图片、生成的 JSON 都能被查看。**保密内容不能进入静态输出**。

## 2. 先检查将发布什么

在网站工程目录执行：

```bash
npm ci
npm run build
npm run preview
```

逐项检查：

- 页面、博客、文档是否全部应该公开；不要误把内部运维笔记放进内容集合。
- `public/` 会被复制到输出目录，不应放 `.env`、配置备份、数据库导出、合同和密钥。
- 构建时环境变量不等于永不泄漏：若拼进 HTML 或客户端脚本，它就会公开；Astro 的 `PUBLIC_*` 变量更应按公开值对待。
- 不主动发布 source map 不是保密措施；最终运行的客户端 JS 本来就对读者可见。
- 输出目录要填 `dist`，**不是仓库根目录**，也不是整个平台代码目录。

本文只讨论静态输出；需要服务端鉴权、SSR、API 或数据库连接时，应另行设计运行环境。纯静态 Astro 不需要为部署本身添加 Cloudflare SSR 适配器。

## 3. 安装 App 时只授权目标仓库

在 Cloudflare 控制台进入 **Workers & Pages → 创建应用 → Pages → 连接 Git / 导入现有仓库**。界面名称可能变化，关键是确认创建的是 **Pages 项目**。

1. 连接 GitHub 账户；
2. 安装并授权 **Cloudflare Workers & Pages** App；
3. 优先选择 **Only select repositories**，只勾选准备部署的私有仓库；
4. 若仓库属于组织，请由组织所有者或具备相应 App 管理权限的人完成授权；
5. 回到 Cloudflare，选择仓库与生产分支 `main`。

用户授权与 App 安装是两件事。仓库列表空白时，先核对“仓库属于哪个账户 / 组织”“App 安装在哪”“是否只授权了别的仓库”，不要直接把仓库改公开。

权限细节见 [Cloudflare GitHub 集成](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)。Git 集成不要求把个人 GitHub PAT 写进仓库、构建命令或前端。

## 4. monorepo 最容易填错的是根目录

以大肥鱼官网的目录结构为例：

```text
practical-training/
├── training-platform/   # 私有平台代码，不是官网部署目录
└── www/
    └── site/            # Astro 官网，里面有 package.json 和锁文件
```

Cloudflare Pages 应设置：

| 项目 | 值 |
| --- | --- |
| 项目类型 | Pages |
| 生产分支 | main |
| Root directory | www/site |
| Framework preset | Astro（或手动填写构建设置） |
| Build command | npm run build |
| Build output directory | dist |
| 环境变量 | NODE_VERSION=22、ASTRO_TELEMETRY_DISABLED=1 |

这里的 `dist` **相对 `www/site`**，不是再填 `www/site/dist`。依赖安装也从选定根目录开始；单独网站仓库则根目录留空或使用仓库根，不要照抄 monorepo 路径。

Node 版本以项目实际验证和框架要求为准。首次构建通过后，先打开 `<project>.pages.dev` 检查路由与静态资源，再绑定正式域名。

发布到 Cloudflare Pages 时，如果控制台出现“部署命令”且要求 `wrangler deploy`，先检查是否误建为 Worker。**不要把 npm run build 当作部署命令**。

### 如果选择的是 Workers Static Assets

Workers 也能发布静态站，但它是另一条可用路径，不是 Pages 配置的附加步骤。下面的配置仅给明确选择 Workers 的项目参考，放在网站工程根目录的 `wrangler.jsonc`：

```jsonc
{
  "name": "my-static-site",
  "compatibility_date": "2026-11-22",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

在 Workers Builds 中使用“构建命令 `npm run build`、部署命令 `npx wrangler deploy`”，域名也在 Worker 的域名配置中处理。**本文其余步骤走 Pages，不需要额外加这份 Worker 配置**。参考 [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)。

## 5. 自定义域名：先登记，再解析

Pages 发布成功后，在**该 Pages 项目 → Custom domains → Set up a domain** 添加 `training.example.com`。

- 子域名可通过 CNAME 指向 `<project>.pages.dev`；DNS 不一定要整体托管到 Cloudflare。
- 根域名接 Pages 时，按 Cloudflare 的要求把该域作为同账户的 zone 并正确委托 nameserver。
- 即使 DNS 已在 Cloudflare，也要先把主机名登记到 Pages 项目；只手工加 CNAME 而未关联项目，可能出现 522。
- 等域名和证书状态正常，再检查跳转、缓存、安全规则及访问路径。不要把 GitHub Pages 的“灰云签 GitHub 证书”步骤照搬到这里；Pages 托管的 TLS 由其平台管理。

Astro 的 `site` 改成正式入口，确保 canonical、hreflang 与 sitemap 不再指向预览域名：

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://training.example.com',
  trailingSlash: 'always',
});
```

如果是从 GitHub Pages 搬到 Cloudflare Pages，已有 `CNAME` / `.nojekyll` **不会替你配置 Cloudflare 域名**；先验证新项目，再切正式 DNS。不要让两个生产构建同时争同一个域名入口。详见 [Pages 自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)。

## 6. 预览链接也可能泄漏内容

Pages 的预览部署默认公开。私有仓库的 PR 生成了预览链接，不等于“只有仓库成员能看”；`noindex` 只是搜索索引指令，不是身份认证。

在项目设置中配置 Access policy，把预览限定给团队；还要按 [官方说明](https://developers.cloudflare.com/pages/configuration/preview-deployments/)核对保护范围：**预览保护通常不自动保护生产 `pages.dev` 域名和自定义域名**。如果整个站点都不能公开，需要为所有正式入口单独配置身份校验，并实际用退出登录的浏览器验证。

注意：只撤销 GitHub App 授权会影响后续构建，不会自动让已经部署的公开页面下线。误发敏感内容时，需要撤下相应部署、清缓存并轮换泄漏凭据；改仓库可见性不能收回已经被读者下载的文件。

## 7. 不想给 Git 集成读取源码？可以只上传产物

另一种方式是：本机或 CI 构建，只把静态产物传到 Cloudflare。它不是“私有 Pages”，而是**让托管方不必通过 Git App 拉取整个仓库**。

```bash
npm ci
npm run build
npx wrangler login
npx wrangler pages project create my-static-site
npx wrangler pages deploy dist --project-name=my-static-site --branch=main
```

上面创建时把生产分支设为 `main`；若使用自己的构建平台，要在可信 CI 的 Secret 中配置最小权限的 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`，令牌授予 Pages 所需权限、限定账户，不使用 Global API Key，也不把令牌放在文档示例里。

创建项目时选 Git integration 还是 Direct Upload 要先考虑清楚，不能假设之后能在控制台无缝互转。Direct Upload 项目不能直接切换为 Git 集成，必须新建 Git 集成项目；Git 集成项目也有用 Wrangler 手动发布的方式，具体以 [Direct Upload 文档](https://developers.cloudflare.com/pages/get-started/direct-upload/)为准。

## 8. 国内访问，与仓库是否私有无关

上线后的请求是“读者 → 自定义域名 → Cloudflare Pages”，不需要读者登录 GitHub。但是**绕过访问仓库，不等于解决了中国大陆的网络连通与跨境链路问题**。

我的检查清单是：

1. 国内移动 / 联通 / 电信、校园网和手机网络分别测试，记录时间与地区；
2. 不只测首页，还测中英文章、文档深链接、CSS、图片和文件下载；
3. 字体与关键静态资源尽量随站点部署，避免页面打开后卡在外部 CDN；
4. 用正式域名统一链接与 SEO，但不宣称自定义域名天然快于默认域名；
5. 检查 DNS、HTTPS、WAF / Access 误拦截、缓存旧版本，分层排查，别不断换 IP“碰运气”。

```bash
nslookup training.example.com
curl -I https://training.example.com/
curl -I https://training.example.com/docs/training-platform/
```

这些只是本次执行网络的检查。对国内可达性有明确 SLA 的产品，应另评估合规的境内托管 / CDN；普通 Cloudflare Pages、橙云都**不自动等于 Cloudflare China Network**。后者是 Enterprise 独立订阅，要求有效 ICP 备案或许可及内容审核，且产品可用范围有差异，见 [China Network](https://developers.cloudflare.com/china-network/)。

## 9. 最后如何选择

- **公开源码、想保留 GitHub Pages**：看[个人站 02](/blog/github-pages-cloudflare/)，Cloudflare 可负责 DNS 和可选代理。
- **私有源码、公开官网**：优先 Cloudflare Pages Git 集成，授权目标仓库、输出只选 `dist`。
- **不希望托管服务通过 Git 读取全部仓库**：自己构建，再用 Direct Upload 发布。
- **网站内容本身也私有**：除了仓库权限，必须另外做网站身份认证。

本文是在介绍可复制的发布配置，不是在宣称本次已修改线上 DNS 或部署。完整方案应把“源码权限、公开产物、域名与证书、读者访问链路”四件事分别验证。

## 参考与系列导航

- [个人站 01：Astro 双语站点](/blog/astro-github-pages/)
- [个人站 02：GitHub Pages + Cloudflare](/blog/github-pages-cloudflare/)
- [Cloudflare Pages：Git 集成支持公开与私有仓库](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare：GitHub App 授权](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Pages：自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Pages：预览部署与 Access](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Pages：Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare：China Network](https://developers.cloudflare.com/china-network/)

配置与文档核对于 2026-11-22；控制台入口和套餐限制可能变化，以官方说明为准。
