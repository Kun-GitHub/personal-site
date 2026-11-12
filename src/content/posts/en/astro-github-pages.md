---
title: Putting a personal site on GitHub Pages with Astro
description: One site, three kinds of content, path-based Chinese/English routing, all static. Why this stack, and the three things that actually bite.
date: 2026-11-12
---

This site is one Astro project that builds plain HTML, deployed to GitHub Pages behind a custom domain. No server, no database, nothing beyond build output.

## Why Astro

It has to hold three things at once: a personal homepage, a blog, and help documentation for several products.

I tried two shapes:

- **Starlight** (Astro's docs theme) gives the best doc experience, sidebar and search included. But under "subpath + bilingual" it generates broken links — sidebar entries missing the prefix, component links gaining an extra language segment. The fixes are: split into a subdomain, or write a pile of patches.
- **Content collections inside the same project**: routing, sidebar, table of contents, prev/next all written by hand. More code, but prefix bugs become structurally impossible.

I picked the second. The cost is no doc versioning and no full-text search; both can wait until there is enough content to need them.

## How content is organised

The product list is data, the docs are files:

```
src/
├── data/products.ts              # slug, name, tagline, site URL
├── content/
│   ├── posts/{zh,en}/            # blog: the directory is the language
│   └── docs/<product>/{zh,en}/   # one doc tree per product
└── pages/                        # routes grow out of the two above
```

Adding a product means one entry in the list plus a docs directory. Adding a page means one `md` file, ordered by `order` in the frontmatter. No routing code changes — that is the whole reason this structure exists.

## Pitfall 1: project pages carry a path prefix

Unless the repository is `username.github.io`, the site lives at `username.github.io/<repo>/`, while links hard-coded as `/blog/` and `/docs/` point at the root. The whole site 404s.

Two ways out: bind a custom domain so the site sits at the domain root (what this site does), or set `base` and rewrite every absolute path and canonical.

## Pitfall 2: `.nojekyll`

GitHub Pages runs output through Jekyll by default. Jekyll ignores directories starting with an underscore, and Astro's asset directory is `_astro/` — so styles and scripts 404 and the page renders bare.

Drop an empty `.nojekyll` into `public/` and it ends up at the output root.

## Pitfall 3: the Cloudflare proxy blocks certificate issuance

GitHub validates a custom domain over HTTP-01, which requires the name to resolve to GitHub's servers. With the orange cloud on, validation lands on Cloudflare and the certificate never gets issued.

The only workable order: keep the record **DNS only** (grey cloud), enter the domain in the repository's Pages settings, wait for the certificate and enable Enforce HTTPS, then switch to proxied with SSL mode **Full (strict)**. Doing it the other way round fails at step one, and the error message will not tell you why.

## Do not lie in hreflang

Chinese is the default (`/`), English lives under `/en/`. Not every page has an English version — when it is missing, the page still shows Chinese, but do **not** declare an `hreflang="en"` pointing at content that does not exist. A false hreflang is worse than none; search engines stop trusting the whole set.

That decision lives in the layout:

```astro
<link rel="alternate" hreflang="zh-CN" href={abs(paths.zh)} />
{paths.en && <link rel="alternate" hreflang="en" href={abs(paths.en)} />}
<link rel="alternate" hreflang="x-default" href={abs(paths.zh)} />
```

## Next

- Search: run Pagefind after the build to generate a static index
- Analytics: Cloudflare Web Analytics, no cookies
- Cross-link the product sites and the docs centre instead of publishing the same articles twice

All of that adds to the current structure rather than changing it.
