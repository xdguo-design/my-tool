import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildSite } from '../tools/build-site.mjs';

const siteRoot = path.resolve('site');

test('构建中文、英文和俄语首页', async () => {
  await buildSite();
  for (const locale of ['zh-cn', 'en', 'ru']) {
    const html = await fs.readFile(path.join(siteRoot, locale, 'index.html'), 'utf8');
    assert.match(html, /<html lang="/);
    assert.match(html, /<meta name="description"/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /hreflang="zh-CN"/);
    assert.match(html, /application\/ld\+json/);
    assert.match(html, /Organization/);
    assert.match(html, /BreadcrumbList/);
  }
});

test('不同语言页面包含不同标题', async () => {
  const zh = await fs.readFile(path.join(siteRoot, 'zh-cn', 'index.html'), 'utf8');
  const en = await fs.readFile(path.join(siteRoot, 'en', 'index.html'), 'utf8');
  const ru = await fs.readFile(path.join(siteRoot, 'ru', 'index.html'), 'utf8');
  assert.match(zh, /工业称重/);
  assert.match(en, /Industrial Weighing/);
  assert.match(ru, /Промышленное взвешивание/);
});
