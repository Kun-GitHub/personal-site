---
title: "【个人站 02】开源仓库用 GitHub Pages + Cloudflare 发布静态网站，兼顾国内访问"
description: 从公开仓库到自定义域名：用 GitHub Actions 发布 Astro 到 GitHub Pages，配置 Cloudflare DNS、HTTPS 与可选代理，说明国内访问的真实边界。
date: 2026-11-22
---

[上一篇：个人站 01 · Astro 双语静态站的内容组织](/blog/astro-github-pages/)解决了“站点怎么写”。这一篇解决“源码公开时怎么发布，以及国内读者怎么访问”。私有仓库的做法见[个人站 03](/blog/private-repo-cloudflare-pages/)。

这里说的“开源仓库”指**源码放在 GitHub 公开仓库中，并按项目自己的许可证开放**。仓库公开不自动等于有开源许可证；GitHub Pages 只是发布服务，不会替你决定授权范围。

> 先说结论：GitHub 管源码，GitHub Actions 构建，GitHub Pages 托管产物，Cloudflare 管域名解析与可选的代理。这个组合能改善部分访问路径，但**不保证中国大陆所有地区、运营商都能稳定访问**。如果你只是想让 Cloudflare 托管站点，也可以直接用 Cloudflare Pages，无须经过 GitHub Pages。

## 1. 先分清两个 Pages

| 服务 | 本文中的职责 | 需要什么 |
| --- | --- | --- |
| GitHub 仓库 | 保存 Astro 源码、文章、构建配置 | 一个公开仓库 |
| GitHub Actions | 安装依赖、生成静态文件并发布 | 构建工作流 |
| GitHub Pages | 对外提供 HTML、CSS、JS 与图片 | 开启仓库 Pages 功能 |
| Cloudflare DNS | 把自定义域名指向 GitHub Pages | 域名 DNS 托管或相应解析权限 |
| Cloudflare 代理（可选） | 让访问先到 Cloudflare，再回源 GitHub Pages | 可代理记录、正常的源站 HTTPS |

常见请求链路是：

```text
读者 → 自定义域名 → Cloudflare（开代理时）→ GitHub Pages
源码更新 → GitHub Actions → dist/ → GitHub Pages
```

Cloudflare Pages 是另一项托管产品，不是“给 GitHub Pages 打开橙云”后的名称。一个正式域名也不能同时随意指向两个源站；先决定哪一套负责对外服务。

## 2. 本地先产出真正的静态站

以 Astro 为例，项目已有锁文件时执行：

```bash
npm ci
npm run build
npm run preview
```

确认构建目录是 `dist/`，里面有 `index.html`，深链接也生成了对应 HTML。纯静态站不需要为这一步增加 SSR 适配器，也不能靠 GitHub Pages 运行 Go、Java、数据库或其他长期服务。

绑定自定义域名时，Astro 配置可以是：

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://blog.example.com',
  trailingSlash: 'always',
});
```

`example.com` 是占位域名，请换成自己的。若使用 `https://<owner>.github.io/<repo>/` 而不是自定义域名，则要配置 `base: '/<repo>'`，并让导航、静态资源和 canonical 都与此前缀一致。不要机械地把两套配置混在一起。

## 3. 用 GitHub Actions 发布

仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。下面是一份可参考的工作流，保存到 `.github/workflows/pages.yml`：

```yaml
name: Deploy static site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          ASTRO_TELEMETRY_DISABLED: '1'
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Node 版本应与本机验证及框架要求一致；生产项目还可把第三方 Action 固定到审核过的完整 commit SHA。示例是仓库根目录项目；monorepo 要同步调整安装、构建的工作目录、锁文件路径和 artifact 路径，不能只改其中一个。

两点容易混淆：

- 上面是“自定义 Actions 构建并上传产物”，**不需要靠 `.nojekyll` 再关闭 Jekyll**。如果改用分支发布预构建文件，才要注意 `_astro/` 等下划线目录，以及发布根目录的 `.nojekyll`。
- 自定义 Actions 发布时，`CNAME` 文件不是配置域名的入口；在仓库 **Settings → Pages → Custom domain** 里设置。分支发布则有 `CNAME` 文件的约定。

## 4. 自定义域名先跑通 DNS only

假设 GitHub 账户是 `yourname`，正式域名是 `blog.example.com`：

1. 按 GitHub 提示验证域名所有权，保留它要求的验证 TXT 记录，降低域名被接管的风险。
2. 在 Cloudflare DNS 中添加记录，先设为 **DNS only（灰云）**。
3. 在 GitHub Pages 的 **Custom domain** 中填写 `blog.example.com`。
4. 等待 GitHub 域名检查和 HTTPS 证书完成，再启用 **Enforce HTTPS**。

| 类型 | 名称 | 内容 | 初始代理状态 |
| --- | --- | --- | --- |
| CNAME | blog | yourname.github.io | DNS only |

CNAME 目标只写主机名：不带 `https://`，也不带仓库路径。根域名需要按 [GitHub 官方自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) 配置 A、ALIAS 或 ANAME 等记录；不要复制别人多年前文章中的 IP 当永久配置。

先用 DNS only 是为了把“GitHub 域名与证书是否正常”和“Cloudflare 代理是否正常”分开排查，不是宣称所有橙云配置都一定让证书签发失败。若检查不通过，核对 CNAME、冲突 A/AAAA、CAA 限制和 DNS 缓存，而不是一遍遍重跑构建。

## 5. 需要代理时再开橙云

如果你的目标包含使用 Cloudflare 的代理与缓存，再把记录设为 **Proxied（橙云）**，SSL/TLS 使用 **Full (strict)**：浏览器到 Cloudflare、Cloudflare 到 GitHub Pages 两段都走 HTTPS，且校验证书。

不要用 Flexible 来“修”源站证书问题；它可能引入 HTTP 回源和重定向循环。Full (strict) 要求源站证书未过期且覆盖对应主机名，详见 [Cloudflare 说明](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)。

开代理后重新检查页面、CSS、图片和文章深链接。若 GitHub 的 DNS 检查或后续续证出现问题，先恢复 DNS only 排障；**一次签发成功不代表以后无需维护源站证书**。如果不想维护 GitHub Pages 回源这层关系，直接用 Cloudflare Pages 托管通常更简单。

## 6. 国内访问：能优化，不是包通

公开还是私有仓库，影响的是代码读取与构建授权；读者访问的是**部署后的域名和网络链路**，不是仓库权限。橙云、自定义域名和 `pages.dev` 都不是“国内必通”开关。

我会做以下处理：

- CSS、字体、图片随站点构建，尽量不用 Google Fonts、GitHub raw 等外部运行时依赖；主页面打开不代表第三方资源也能打开。
- 将自定义域名作为正式入口，统一 canonical、站点地图和内链；换域名不会凭空改变跨境链路质量。
- HTML 使用保守缓存策略；带内容 hash 的资源才适合长缓存。更新后先判断是缓存旧页面还是发布失败。
- 分别用中国移动、联通、电信，以及校园网或家庭宽带实测首屏、深链接、资源和下载。记录地区、时间、错误码，不只看自己电脑。

可以先做基础检查：

```bash
nslookup blog.example.com
curl -I https://blog.example.com/
curl -I https://blog.example.com/blog/astro-github-pages/
curl -sS -o /dev/null \
  -w 'code=%{http_code} dns=%{time_namelookup} tls=%{time_appconnect} total=%{time_total}\n' \
  https://blog.example.com/
```

这些命令只反映执行它们所在网络的结果，不替代国内多地测试。若主要读者是中国大陆、并且有稳定访问的硬要求，应评估合规的境内托管 / CDN。Cloudflare 的 [China Network](https://developers.cloudflare.com/china-network/) 是 **Enterprise 的独立订阅**，涉及有效 ICP 备案或许可与内容审核，不是免费 Pages 或普通橙云默认带来的能力，也不意味着所有 Cloudflare 产品都在其上可用。

## 7. 常见问题与取舍

| 现象 | 优先检查 |
| --- | --- |
| 构建成功但部署 404 | 仓库 Pages 是否开启、发布源是否选 Actions、artifact 根是否有 index.html |
| 首页正常，文章或样式 404 | base、资源根路径、自定义域名、分支发布时的 Jekyll 行为 |
| HTTPS 重定向循环 | Flexible、重复 HTTP→HTTPS 重定向、源站域名设置 |
| 526 或证书错误 | 源站证书与 Full (strict) 要求，不是重跑 npm build |
| 国内个别网络慢或超时 | DNS、线路、第三方资源、缓存与跨境网络，不能用仓库改公开来修 |

这一套适合希望保留 GitHub Pages 托管的开源个人站。如果只是“代码放 GitHub、站点由 Cloudflare 发布”，公开仓库同样可以直接接 Cloudflare Pages：流程参考下一篇，把仓库可见性保持 Public 即可，不需要同时开两个 Pages。

## 参考与系列导航

- [个人站 01：Astro 双语站点](/blog/astro-github-pages/)
- [个人站 03：私有仓库接 Cloudflare Pages](/blog/private-repo-cloudflare-pages/)
- [GitHub：创建 Pages 站点](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub：自定义域名与排错](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)
- [Cloudflare：Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
- [Cloudflare：China Network 与适用条件](https://developers.cloudflare.com/china-network/)

本文配置与文档核对于 2026-11-22；控制台命名与套餐限制可能调整，请以官方说明为准。
