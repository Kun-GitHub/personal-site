---
title: "【个人站 02】Public GitHub Repositories, GitHub Pages and Cloudflare: Publishing a Static Site for Readers in Mainland China"
description: Publish an Astro site from a public repository using GitHub Actions and Pages, add Cloudflare DNS and optional proxying, and understand the limits of mainland China connectivity.
date: 2026-11-22
---

[Part 01](/en/blog/astro-github-pages/) covered the content and routing of this bilingual site. This part covers publishing from a public repository and testing access for readers in mainland China. For private source, see [Part 03](/en/blog/private-repo-cloudflare-pages/).

Here, “open source” means that the source is in a public repository **and has an appropriate project licence**. Making a repository public does not automatically grant an open-source licence. GitHub Pages is a hosting service, not a licensing decision.

> The arrangement is straightforward: GitHub stores source, Actions builds it, Pages hosts the output, and Cloudflare handles DNS and optional proxying. It may improve some delivery paths, but **it does not guarantee reliable access from every region and ISP in mainland China**. If you want Cloudflare to host the output itself, you can use Cloudflare Pages directly instead of GitHub Pages.

## 1. Two products called Pages

| Component | Responsibility |
| --- | --- |
| Public GitHub repository | Astro source, posts and build configuration |
| GitHub Actions | Install dependencies, build and publish |
| GitHub Pages | Serve the generated HTML, CSS, JavaScript and images |
| Cloudflare DNS | Resolve a custom hostname to GitHub Pages |
| Optional Cloudflare proxy | Receive requests at the edge and fetch from the GitHub Pages origin |

```text
Reader → Custom domain → Cloudflare (if proxied) → GitHub Pages
Source update → GitHub Actions → dist/ → GitHub Pages
```

Cloudflare Pages is a separate hosting product. Enabling an orange cloud in DNS does not turn GitHub Pages into Cloudflare Pages. Decide which service owns the production hostname before changing DNS.

## 2. Build static output locally first

For a project with a committed lockfile:

```bash
npm ci
npm run build
npm run preview
```

Check that `dist/` contains `index.html` and HTML for deep links. A static Astro site does not need an SSR adapter merely to publish it. GitHub Pages cannot run a Go API, a database or another long-running application service.

For a custom hostname:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://blog.example.com',
  trailingSlash: 'always',
});
```

Replace the example domain with your own. A project published at `https://<owner>.github.io/<repo>/` instead needs an appropriate `base: '/<repo>'` and links, assets and canonical URLs that respect that prefix. Do not combine the two configurations blindly.

## 3. Publish with GitHub Actions

Under **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**. A workflow for a root-level project can be saved as `.github/workflows/pages.yml`:

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

Use a Node version compatible with the framework and your local validation. For production, consider pinning third-party actions to reviewed full commit SHAs. In a monorepo, change the dependency-install directory, build directory, lockfile path and artifact path together.

Two details matter:

- A custom Actions workflow publishes prebuilt artifacts; it does **not** need `.nojekyll` to disable an additional Jekyll build. That file matters when publishing prebuilt files from a branch, especially for directories such as `_astro/`.
- With custom Actions publishing, configure the domain in **Settings → Pages → Custom domain**. A repository `CNAME` file is not the configuration mechanism for that workflow; branch publishing has a different convention.

## 4. Validate the custom domain with DNS only

Suppose the GitHub owner is `yourname` and the hostname is `blog.example.com`:

1. Verify domain ownership as GitHub instructs and keep the verification TXT record.
2. Add the DNS record in Cloudflare, initially **DNS only**.
3. Enter `blog.example.com` in GitHub Pages custom-domain settings.
4. Wait for domain checks and the origin HTTPS certificate, then enable **Enforce HTTPS**.

| Type | Name | Content | Initial state |
| --- | --- | --- | --- |
| CNAME | blog | yourname.github.io | DNS only |

The target is a hostname, with no `https://` and no repository path. For an apex domain, follow [GitHub's current custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) for A, ALIAS or ANAME records instead of treating an old blog's copied IP addresses as permanent configuration.

DNS only separates origin/domain problems from proxy problems. It is a troubleshooting sequence, **not a claim that every proxied configuration inevitably prevents certificate issuance**. Check CNAMEs, conflicting A/AAAA records, CAA restrictions and DNS caching before rerunning builds.

## 5. Enable proxying only if you need it

For Cloudflare proxying and caching, switch the record to **Proxied** and use **Full (strict)**. Both hops use HTTPS and Cloudflare verifies the origin certificate.

Do not use Flexible as a workaround for an invalid origin certificate: it may introduce HTTP origin traffic and redirect loops. Full (strict) requires an unexpired certificate for the requested hostname, as described in [Cloudflare's SSL documentation](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/).

Retest HTML, CSS, images and article deep links after enabling proxying. If GitHub's domain checks or later certificate renewal fail, restore DNS only while diagnosing. One successful issuance does not eliminate future renewal obligations. Hosting directly on Cloudflare Pages removes this particular GitHub-origin relationship if you do not need to keep it.

## 6. Mainland China access: optimisation, not a promise

Repository visibility controls source access and build authorisation. Readers access the **published hostname and its network path**, not the repository's permissions. A custom domain, orange cloud or `pages.dev` hostname is not a universal connectivity switch.

My checklist:

- Bundle critical CSS, fonts and images with the site. Avoid unnecessary runtime dependencies on Google Fonts, GitHub raw content or other external hosts.
- Pick one production domain and align canonical URLs, sitemap and internal links. A new hostname does not magically change cross-border network quality.
- Keep HTML caching conservative; long caching is appropriate for content-hashed assets. Distinguish stale cached HTML from a failed release.
- Test China Mobile, Unicom, Telecom and relevant campus/home networks. Check deep links, assets and downloads, recording location, time and error codes.

Basic checks:

```bash
nslookup blog.example.com
curl -I https://blog.example.com/
curl -I https://blog.example.com/blog/astro-github-pages/
curl -sS -o /dev/null \
  -w 'code=%{http_code} dns=%{time_namelookup} tls=%{time_appconnect} total=%{time_total}\n' \
  https://blog.example.com/
```

These results describe only the network running the commands. For a product with firm mainland connectivity requirements, evaluate compliant mainland hosting/CDNs. [Cloudflare China Network](https://developers.cloudflare.com/china-network/) is a **separate Enterprise subscription**, requiring a valid ICP filing or licence and content vetting. It is not automatically included with ordinary Pages or proxying, and not every Cloudflare product is available there.

## 7. Troubleshooting and trade-offs

| Symptom | Check first |
| --- | --- |
| Build passes, deployment fails or 404s | Pages enabled, Actions selected, artifact root contains index.html |
| Homepage works but posts/assets 404 | Base prefix, root-relative paths, hostname, branch publishing/Jekyll |
| HTTPS redirect loop | Flexible mode, competing redirects, origin hostname configuration |
| 526 / certificate errors | Origin certificate and Full (strict), not another npm build |
| Some mainland networks time out | DNS, routes, third-party resources, caches and cross-border conditions |

This architecture fits an open-source site that wants to retain GitHub Pages hosting. Public repositories can also connect directly to Cloudflare Pages: follow Part 03 with visibility left Public. Running both Pages services is not a requirement.

## Sources and series

- [Part 01: Astro bilingual site](/en/blog/astro-github-pages/)
- [Part 03: Private repositories and Cloudflare Pages](/en/blog/private-repo-cloudflare-pages/)
- [GitHub: Creating a Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [GitHub: Custom-domain troubleshooting](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)
- [Cloudflare: Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
- [Cloudflare: China Network](https://developers.cloudflare.com/china-network/)

Configuration and documentation checked on 2026-11-22. Dashboard labels, requirements and plan limits may change; consult the official documentation.
