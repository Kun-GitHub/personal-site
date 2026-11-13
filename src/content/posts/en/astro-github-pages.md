---
title: Putting a personal site on GitHub Pages with Astro
description: Notes on building a bilingual static site with Astro and GitHub Pages, including content organisation, URL structure, SEO and deployment configuration.
date: 2026-11-12
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

GitHub Pages may process output with Jekyll, which ignores directories beginning with an underscore. Astro places assets in `_astro/`, so the stylesheets and scripts may not be published unless Jekyll processing is disabled.

Add an empty `.nojekyll` file to `public/`; Astro copies it to the output root, where GitHub Pages detects it.

## 3. Cloudflare proxy and certificate issuance

GitHub validates a custom domain over HTTP-01, which requires the domain to resolve to GitHub's servers. In this site's configuration, enabling the Cloudflare proxy prevented the HTTP-01 validation request from reaching GitHub Pages, so the certificate could not be issued.

For this setup, keep the record **DNS only** (grey cloud), enter the domain in the repository's Pages settings, wait for the certificate, and enable Enforce HTTPS. The record can then be proxied with SSL mode **Full (strict)**. Reversing this order may prevent validation; the resulting error may not identify the proxy as the cause.

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
