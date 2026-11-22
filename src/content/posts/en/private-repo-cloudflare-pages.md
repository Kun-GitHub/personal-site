---
title: "【个人站 03】Private Repositories and Cloudflare Pages: Publish a Static Site Without Publishing the Source"
description: Build Astro from a private GitHub repository with Cloudflare Pages, configure monorepo paths, domains and preview access, and understand source privacy and mainland China connectivity.
date: 2026-11-22
---

[Part 02](/en/blog/github-pages-cloudflare/) covered public source and GitHub Pages plus Cloudflare. This part addresses a different need: **the source must remain private, while a marketing site, blog or documentation must be publicly accessible**.

The Dafeiyu training platform's site is an example: an Astro project lives inside the private platform repository. Publishing that site should not require making the entire platform public.

> Recommended path: private GitHub repository → Cloudflare Pages Git integration → static build output → custom domain. You do **not** need to enable GitHub Pages first or buy GitHub Pro just to unlock private-repository Pages hosting. The repository stays Private; the deployed site is still public by default.

## 1. Private source is not a private website

| Requirement | Mechanism |
| --- | --- |
| Hide the full repository, history and unpublished source | GitHub repository visibility and permissions |
| Let Cloudflare fetch and build the source | Authorise the Cloudflare Workers & Pages GitHub App |
| Let readers open the website | Pages deployment and hostname configuration |
| Restrict draft previews to the team | Cloudflare Access, not an unguessable URL |
| Reliable mainland China access | Network testing and optimisation; compliant mainland hosting/CDN if needed |

[GitHub's documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) says a repository must be public to use GitHub Pages on GitHub Free. Other plans have their own entitlements. In contrast, [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) explicitly supports both private and public GitHub repositories.

Private source does not make client-side code secret. Anyone can inspect downloaded HTML, CSS, JavaScript, images and generated JSON. **Confidential content must never enter the static output.**

## 2. Inspect what will be published

Inside the website project:

```bash
npm ci
npm run build
npm run preview
```

Check the output before connecting hosting:

- Are every page, post and document intended to be public? Do not include internal operations notes in a public content collection.
- The contents of `public/` are copied into the output. Keep environment files, database dumps, contracts, backups and keys elsewhere.
- Build-time variables are not inherently secret after a build. A value embedded in generated HTML or JavaScript is public; treat Astro's `PUBLIC_*` variables accordingly.
- Omitting source maps is not a security boundary: the browser already receives the code it runs.
- Publish `dist`, **not the repository root** or the platform's source tree.

This guide covers static output, not server-side authentication, SSR, APIs or database services. A static Astro site does not need a Cloudflare SSR adapter merely for deployment.

## 3. Grant access only to the repository you need

In Cloudflare, select **Workers & Pages → Create application → Pages → Connect to Git / Import an existing repository**. Labels can change; the important detail is creating a **Pages project**.

1. Connect your GitHub identity.
2. Install and authorise the **Cloudflare Workers & Pages** App.
3. Prefer **Only select repositories** and choose the intended private repository.
4. For organisation-owned source, ask the owner or an appropriately authorised App manager to install it.
5. Select the repository and production branch `main` in Cloudflare.

User authorisation and App installation are distinct. If the repository picker is empty, check its owning account/organisation and the App's installation and selected repositories. Do not change source visibility to work around missing authorisation.

See [Cloudflare's GitHub integration guide](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/). This setup does not require a personal GitHub token inside your repository, build command or client code.

## 4. Monorepo root directories matter

For the training platform's marketing site:

```text
practical-training/
├── training-platform/   # private platform code, not the website output
└── www/
    └── site/            # Astro project with package.json and lockfile
```

Set Pages build options as follows:

| Option | Value |
| --- | --- |
| Project type | Pages |
| Production branch | main |
| Root directory | www/site |
| Framework preset | Astro, or enter build settings manually |
| Build command | npm run build |
| Build output directory | dist |
| Environment | NODE_VERSION=22; ASTRO_TELEMETRY_DISABLED=1 |

The output directory `dist` is **relative to `www/site`**. Do not enter `www/site/dist` again. Dependency installation also begins at the configured root. For a standalone website repository, leave the root at the repository root instead of copying the monorepo path.

Choose a Node version compatible with your project and framework. Check the generated `<project>.pages.dev` deployment before binding a production hostname.

If the setup asks for a deployment command such as `wrangler deploy`, check whether you created a Worker instead of a Pages project. **A build command is not a deployment command.**

### If you intentionally choose Workers Static Assets

Workers can also host static output, but this is an alternative path, not an extra step for Pages. A minimal `wrangler.jsonc` in the website root can be:

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

Workers Builds then uses `npm run build` to build and `npx wrangler deploy` to deploy; configure its domain on the Worker. **The rest of this article uses Pages, so it does not need that Worker configuration.** See [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).

## 5. Associate the hostname before editing DNS

After the Pages deployment succeeds, open the project and select **Custom domains → Set up a domain**, then add `training.example.com`.

- A subdomain can use a CNAME targeting `<project>.pages.dev` without moving the whole DNS zone to Cloudflare.
- An apex domain requires the Cloudflare zone and nameserver arrangement specified by Pages, on the relevant account.
- Register the hostname on the Pages project first. Merely adding a CNAME without associating it with the project can produce a 522.
- Wait for the domain and certificate to activate, then check redirects, caching and security rules. Do not copy GitHub Pages' origin-certificate/DNS-only sequence here: Pages manages its own TLS hosting.

Set Astro's canonical production URL:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://training.example.com',
  trailingSlash: 'always',
});
```

Existing GitHub Pages `CNAME` and `.nojekyll` files do **not** configure a Cloudflare hostname. If migrating hosts, verify the new project before switching production DNS. Do not point competing production deployments at the same hostname. See [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## 6. Preview URLs can expose private drafts

Pages preview deployments are public by default, even for private source repositories. A hard-to-guess link is not authentication, and `noindex` only affects search indexing.

Configure an Access policy for previews and test its scope. [Preview Access does not automatically protect the production pages.dev or custom domain](https://developers.cloudflare.com/pages/configuration/preview-deployments/). If the entire site must be private, separately protect every production entry point and verify from a logged-out browser.

Revoking GitHub App access prevents future builds; it does not automatically remove already published content. For an accidental disclosure, remove the relevant deployments, purge affected caches and rotate exposed credentials. Making the repository private cannot retract files already downloaded by visitors.

## 7. Prefer uploading only artifacts? Use Direct Upload

You can build locally or in CI and upload only the static output. This is not private website hosting; it simply means the host need not fetch the repository through a Git App.

```bash
npm ci
npm run build
npx wrangler login
npx wrangler pages project create my-static-site
npx wrangler pages deploy dist --project-name=my-static-site --branch=main
```

Choose `main` as the production branch when creating the project. For CI, use trusted Secret storage for `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, with only the required Pages permissions and account scope. Do not use a Global API Key or put a real token in an example.

Choose Git integration versus Direct Upload deliberately. A Direct Upload project cannot switch to Git integration; create a new Git-integrated project instead; Git-integrated projects also have documented Wrangler manual deployment paths. Do not assume the dashboard can seamlessly switch modes. See [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## 8. Mainland access does not depend on source visibility

The published request path is reader → custom hostname → Cloudflare Pages, without requiring the reader to log in to GitHub. That removes a repository-access dependency, **not cross-border latency or connectivity limits**.

My checklist:

1. Test China Mobile, Unicom, Telecom, campus networks and mobile data; record time and region.
2. Test posts and documentation deep links, CSS, images and downloads, not only the homepage.
3. Bundle critical fonts and assets locally to avoid unnecessary external runtime dependencies.
4. Align SEO and links on one production domain; do not claim a custom hostname is inherently faster.
5. Diagnose DNS, TLS, WAF/Access mistakes and stale caches separately instead of blindly changing IPs.

```bash
nslookup training.example.com
curl -I https://training.example.com/
curl -I https://training.example.com/docs/training-platform/
```

These checks reflect only the caller's network. Products with a mainland availability SLA should evaluate compliant mainland hosting/CDNs. Ordinary Pages and an orange cloud are **not Cloudflare China Network**: that is a separate Enterprise subscription with valid ICP filing/licence and content vetting requirements, and not every product is available there. See [China Network](https://developers.cloudflare.com/china-network/).

## 9. Choosing the right route

- **Public source, retain GitHub Pages:** use [Part 02](/en/blog/github-pages-cloudflare/) with Cloudflare DNS and optional proxying.
- **Private source, public website:** use Pages Git integration, grant only the intended repository and publish only `dist`.
- **Do not let the host fetch the full repository:** build yourself and use Direct Upload.
- **Private website content:** add website authentication in addition to repository permissions.

This article describes repeatable configuration; it does not claim that writing it changed production DNS or deployed anything. Verify source permissions, public artifacts, domain/TLS and reader connectivity independently.

## Sources and series

- [Part 01: Astro bilingual site](/en/blog/astro-github-pages/)
- [Part 02: GitHub Pages + Cloudflare](/en/blog/github-pages-cloudflare/)
- [Pages: Public and private Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare: GitHub App authorisation](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Pages: Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Pages: Preview deployments and Access](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Pages: Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare: China Network](https://developers.cloudflare.com/china-network/)

Documentation and configuration checked on 2026-11-22. Dashboard labels and plan limits can change; consult the official guidance.
