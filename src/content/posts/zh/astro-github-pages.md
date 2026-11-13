---
title: 使用 Astro 与 GitHub Pages 构建双语个人站
description: 记录一个以 Astro 构建、部署于 GitHub Pages 的双语静态站点：内容组织、路径设计、SEO 与部署配置。
date: 2026-11-12
---

本站由 Astro 构建为静态 HTML，并部署在绑定自定义域名的 GitHub Pages 上。运行站点不需要独立应用服务器或数据库。

## 为什么是 Astro

本站需要容纳三类内容：个人首页、博客，以及多个产品的帮助文档。

评估过两种方案：

- **Starlight**（Astro 官方文档主题）：提供文档侧栏和搜索等功能。但在本站采用的「子路径 + 中英双语」配置下，曾遇到侧栏链接缺少路径前缀、组件链接多出语言目录的问题。需要改用子域名，或额外维护路由适配。
- **在同一工程中使用内容集合**：自行实现路由、侧栏、目录和前后页导航。需要维护少量站点代码，也能集中控制链接前缀。

本站采用后一种方案。目前没有文档版本管理或全文搜索；内容规模扩大后再评估是否需要这些功能。

## 内容组织方式

产品与开源项目分别维护清单数据，产品文档以文件管理：

```
src/
├── data/
│   ├── products.json         # 产品清单：名称、介绍、站点与文档入口
│   └── openSource.json       # 开源项目清单：介绍、技术栈与代码仓库
├── content/
│   ├── posts/{zh,en}/        # 博客：目录即语言
│   └── docs/<product>/{zh,en}/   # 产品文档
└── pages/                    # 页面从数据和内容集合生成
```

新增产品时，在产品清单中添加记录并创建对应文档目录；新增开源项目时，在开源项目清单中添加名称、介绍、技术栈和代码仓库；新增文档页面时添加 Markdown 文件，并通过 frontmatter 的 `order` 设置侧栏顺序。这些内容更新均无需修改路由代码。

## 1. GitHub Pages 项目的路径前缀

在 GitHub Pages 上，非 `username.github.io` 仓库通常部署到 `username.github.io/<repo>/`。若页面链接写成 `/blog/`、`/docs/` 这样的根路径，访问时会指向域名根目录，导致路径错误。

有两种处理方式：

1. 绑定自定义域名，使站点部署在域名根路径下（本站采用此方式）；
2. 配置 `base`，并相应调整绝对路径与 canonical 地址。

## 2. 使用 `.nojekyll` 禁用 Jekyll 处理

GitHub Pages 默认会使用 Jekyll 处理构建产物。Jekyll 默认忽略以下划线开头的目录；Astro 的资源目录名为 `_astro/`。若未关闭 Jekyll 处理，相关样式和脚本可能无法发布。

在 `public/` 中加入空的 `.nojekyll` 文件，构建后它会出现在产物根目录，GitHub Pages 因此不会使用 Jekyll 处理产物。

## 3. Cloudflare 代理与证书签发

GitHub Pages 通过 HTTP-01 验证为自定义域名签发 Let's Encrypt 证书，因此域名需要解析到 GitHub 服务器。本站配置 Cloudflare 代理时，HTTP-01 验证请求未能到达 GitHub Pages，因此证书无法签发。

本站采用以下配置顺序：

1. DNS 记录设为 **DNS only（灰色云）**；
2. 在仓库的 Pages 设置中填写域名并保存；
3. 等待证书签发（通常为几分钟至 24 小时），然后启用 Enforce HTTPS；
4. 将 DNS 记录改为代理模式（橙色云），并将 SSL 模式设为 **Full (strict)**。

如果颠倒顺序，证书验证可能失败，错误信息也未必能明确指出代理设置是原因。

## 按实际译文声明 hreflang

中文是默认语言（`/`），英文在 `/en/`。但不是每篇都有英文版——**缺英文版时，页面照常显示中文，但不要在 `<link rel="alternate" hreflang="en">` 里声明一个不存在的英文地址**。

若 alternate 地址没有对应语言内容，搜索引擎可能忽略这些 hreflang 声明。因此本站仅在译文存在时输出英文 alternate 链接。该判断在布局层处理：

```astro
<link rel="alternate" hreflang="zh-CN" href={abs(paths.zh)} />
{paths.en && <link rel="alternate" hreflang="en" href={abs(paths.en)} />}
<link rel="alternate" hreflang="x-default" href={abs(paths.zh)} />
```

## 后续考虑

- 站内搜索：构建后使用 Pagefind 生成静态索引，无需后端服务
- 访问统计：Cloudflare Web Analytics，无 cookie
- 在产品站与文档中心之间建立链接，避免重复维护相同内容

这些改进可以在现有结构上逐步加入，无需调整当前架构。
