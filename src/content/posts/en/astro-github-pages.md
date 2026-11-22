---
title: "【个人站 01】Putting a Personal Site on GitHub Pages with Astro"
description: Notes on building a bilingual static site with Astro and GitHub Pages, including content organisation, URL structure, SEO and deployment configuration.
date: 2026-11-12
updated: 2026-11-22
---

This site is built with Astro as static HTML and deployed to GitHub Pages with a custom domain. It does not require an application server or database at runtime.

## Why Astro

It has to hold three things at once: a personal homepage, a blog, and help documentation for several products.

I considered two approaches:

- **Starlight** (Astro's documentation theme) provides features such as a sidebar and search. With this site's subpath and bilingual configuration, we encountered sidebar links missing the path prefix and component links gaining an extra language segment. Addressing these issues would require moving the docs to a subdomain or maintaining additional routing adjustments.
- **Content collections inside the same project**: routing, sidebar, table of contents, prev/next all written by hand. This requires maintaining some routing code, but keeps URL-prefix handling in one place.

This site uses the second approach. It currently has no documentation versioning or full-text search; those can be evaluated if the content grows enough to require them.

## How content is organised

Products and open-source projects have separate data lists; product documentation is stored in files:

```
src/
├── data/
│   ├── products.json             # product names, summaries, sites and docs
│   └── openSource.json           # project summaries, stacks and repositories
├── content/
│   ├── posts/{zh,en}/            # blog: the directory is the language
│   └── docs/<product>/{zh,en}/   # product documentation
└── pages/                        # pages are generated from data and content collections
```

Adding a product means adding an entry to `products.json` and creating its docs directory. Adding an open-source project means adding its summary, stack and repository links to `openSource.json`. Add documentation pages as Markdown files and use the frontmatter `order` field to set sidebar order. These content changes do not require route code changes.

## 1. GitHub Pages project URL prefixes

On GitHub Pages, repositories other than `username.github.io` are typically published under `username.github.io/<repo>/`. Links written as root paths such as `/blog/` and `/docs/` then point to the domain root and may fail.

Two options are to bind a custom domain so the site sits at the domain root, as this site does, or to set `base` and update absolute paths and canonical URLs accordingly.

## 2. Disabling Jekyll with `.nojekyll`

Distinguish branch publishing from custom Actions publishing. A branch publishing source may be processed by Jekyll, affecting underscore-prefixed directories such as `_astro/`; a `.nojekyll` file in the published root disables that processing for prebuilt files.

This site currently builds and uploads static artifacts with custom GitHub Actions. That workflow does not run an additional Jekyll build and does not require `.nojekyll`; keeping the empty file is a branch-publishing compatibility convention.

## 3. Cloudflare proxy and certificate issuance

During this site’s setup, domain checks or certificate configuration were troublesome with Cloudflare proxying enabled. Starting with DNS only separates GitHub origin/domain problems from proxy problems. It does not mean every proxied configuration inevitably prevents certificate issuance.

For this setup, keep the record **DNS only**, configure the hostname in GitHub Pages, wait for HTTPS readiness and enable Enforce HTTPS. Then test optional proxying with **Full (strict)**. Continue monitoring domain checks and origin-certificate renewals; restore DNS only while troubleshooting if necessary. Custom Actions deployments configure the domain in Settings → Pages, not solely through a CNAME file.

For full publishing and mainland connectivity checks, read [Part 02: GitHub Pages + Cloudflare](/en/blog/github-pages-cloudflare/). For private source, read [Part 03: Private repositories and Cloudflare Pages](/en/blog/private-repo-cloudflare-pages/). Neither route guarantees access from every mainland network.

## Declare hreflang only for available translations

Chinese is the default (`/`), English lives under `/en/`. Not every page has an English version — when it is missing, the page still shows Chinese, but do **not** declare an `hreflang="en"` pointing at content that does not exist. Search engines may ignore hreflang declarations that point to unavailable translations. This site therefore emits an English alternate link only when the translation exists.

That decision lives in the layout:

```astro
<link rel="alternate" hreflang="zh-CN" href={abs(paths.zh)} />
{paths.en && <link rel="alternate" hreflang="en" href={abs(paths.en)} />}
<link rel="alternate" hreflang="x-default" href={abs(paths.zh)} />
```

## Further improvements

- Search: generate a static search index with Pagefind after the build
- Analytics: Cloudflare Web Analytics, no cookies
- Link product sites to the documentation centre to avoid maintaining duplicate content

These improvements can be added without changing the current architecture.
