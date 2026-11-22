import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Exercise both rendered callers: complete archive and its three-item home excerpt.
const required = ['private-repo-cloudflare-pages', 'github-pages-cloudflare', 'about-kong', 'astro-github-pages'];
const failures = [];
for (const prefix of ['', 'en/']) {
  const entries = [];
  for (const archive of [true, false]) {
    const route = '/' + prefix + (archive ? 'blog/' : '');
    const html = await readFile(new URL('../dist' + route + 'index.html', import.meta.url), 'utf8');
    const links = [...html.matchAll(/<a[ ][^>]*>/g)]
      .map(([tag]) => tag)
      .filter((tag) => /class=(?:"row"|'row'|row)(?:[ >])/.test(tag))
      .map((tag) => tag.match(/href=(?:"([^"]+)"|'([^']+)'|([^ >]+))/)?.slice(1).find(Boolean));
    entries.push(links);
    try {
      if (archive) {
        for (const slug of required) assert(links.includes('/' + prefix + 'blog/' + slug + '/'), 'missing article: ' + slug);
      } else {
        assert.deepEqual(links, entries[0].slice(0, 3), 'home must show the first three archive entries');
      }
      const index03 = links.indexOf('/' + prefix + 'blog/private-repo-cloudflare-pages/');
      const index02 = links.indexOf('/' + prefix + 'blog/github-pages-cloudflare/');
      assert(index03 >= 0 && index03 < index02, '03 must precede 02');
      console.log('PASS ' + route + ': ' + links.length + ' posts, 03 before 02');
    } catch (error) {
      failures.push({ route, actual: links, message: error.message });
    }
  }
}
assert.deepEqual(failures, [], 'Blog list is incomplete or incorrectly ordered: ' + JSON.stringify(failures));
