import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildSite } from '../tools/build-site.mjs';

test('构建可独立收录的解决方案、产品、案例和资料页', async () => {
  await buildSite();
  for (const locale of ['zh-cn', 'en', 'ru']) {
    for (const section of ['solutions', 'products', 'cases', 'resources']) {
      const file = path.join('site', locale, section, 'index.html');
      const html = await fs.readFile(file, 'utf8');
      assert.match(html, /<h1[\s\S]*?<\/h1>/);
      assert.match(html, /<meta name="description"/);
      assert.match(html, /BreadcrumbList/);
      assert.doesNotMatch(html.toLowerCase(), /tokenpocket/);
    }
  }
});
