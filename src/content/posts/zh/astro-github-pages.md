---
title: 用 Astro 把个人站放到 GitHub Pages：i18n、SEO 和三个会咬人的坑
description: 一个站点、三类内容（首页 / 博客 / 产品文档）、中英路径式分流，全部静态产物。记下选型理由和真正会让人卡住的三个地方。
date: 2026-11-12
---

这个站点是这么长出来的：一个 Astro 工程，产出全静态 HTML，交给 GitHub Pages，绑一个自定义域名。没有服务端、没有数据库、没有构建产物之外的东西。

## 为什么是 Astro

要同时装下三类东西：个人首页、博客、还有多个产品的帮助文档。

试过两条路：

- **Starlight**（Astro 官方文档主题）：文档体验最好，自带侧栏和搜索。但它在「子路径 + 中英双语」组合下生成的链接是错的——侧栏漏掉前缀、组件链接多出一层语言目录。要么拆子域，要么写一堆补丁。
- **同一个工程里用内容集合**：路由、侧栏、目录、上一篇下一篇全部自己写，代码不多，但链接前缀这类错误从结构上不可能发生。

选了后者。代价是没有文档版本化，也没有全文搜索——这两件事等文档真的多了再说。

## 内容怎么组织

产品清单是一份数据，文档是文件：

```
src/
├── data/products.ts          # 产品清单：slug、名字、一句话、站点地址
├── content/
│   ├── posts/{zh,en}/        # 博客：目录即语言
│   └── docs/<product>/{zh,en}/   # 每个产品一套文档
└── pages/                    # 路由从上面两者长出来
```

加一个产品 = 清单里加一条 + 建一个文档目录。加一篇文档 = 加一个 `md` 文件，侧栏顺序由 frontmatter 的 `order` 决定。不需要动任何路由代码，这是这个结构存在的唯一理由。

## 坑一：项目仓默认带路径前缀

仓库不叫 `username.github.io` 时，站点落在 `username.github.io/<repo>/`，而页面里写死的 `/blog/`、`/docs/` 全部指向根，于是整站 404。

两种解法：

1. 绑自定义域名——站点挂在域名根上，链接不用改（这个站选的就是这条）；
2. 配 `base`，但那样所有绝对路径和 canonical 都要跟着改一遍。

## 坑二：`.nojekyll`

GitHub Pages 默认会把产物过一遍 Jekyll。Jekyll 忽略下划线开头的目录，而 Astro 的资源目录恰好叫 `_astro/`——结果是样式和脚本全 404，页面裸奔。

放一个空的 `.nojekyll` 到 `public/` 里（构建后会到产物根目录）就好。

## 坑三：Cloudflare 代理会挡住证书签发

GitHub 给自定义域名签 Let's Encrypt 证书要走 HTTP-01 验证，域名必须真的解析到 GitHub 的服务器。开着 Cloudflare 的橙色云代理，验证请求落在 Cloudflare 上，证书永远签不下来。

顺序只能是：

1. DNS 记录保持 **DNS only（灰色云）**；
2. 在仓库 Pages 设置里填域名并保存；
3. 等证书签发（几分钟到 24 小时），勾上 Enforce HTTPS；
4. 再把记录改成橙色云，SSL 模式选 **Full (strict)**。

反着做会卡在第一步，而且报错信息不会告诉你原因。

## hreflang 不能撒谎

中文是默认语言（`/`），英文在 `/en/`。但不是每篇都有英文版——**缺英文版时，页面照常显示中文，但不要在 `<link rel="alternate" hreflang="en">` 里声明一个不存在的英文地址**。

声明了却没有对应内容，搜索引擎会判定 hreflang 不可信，结果比不声明更糟。这个判断在布局层做：

```astro
<link rel="alternate" hreflang="zh-CN" href={abs(paths.zh)} />
{paths.en && <link rel="alternate" hreflang="en" href={abs(paths.en)} />}
<link rel="alternate" hreflang="x-default" href={abs(paths.zh)} />
```

## 接下来

- 站内搜索：Pagefind 在构建后跑一遍，给产物生成静态索引，不需要后端
- 访问统计：Cloudflare Web Analytics，无 cookie
- 产品站和文档中心之间互相链接，别再各挂一份同样的文章

这些都不影响现在的结构，属于往上加东西，不是改地基。
