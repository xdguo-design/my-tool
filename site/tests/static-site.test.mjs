import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { detailEntries, siteUrl } from '../src/content.mjs';

const root = join(import.meta.dirname, '..');
const locales = ['zh-cn', 'en', 'ru'];

async function read(relativePath) {
  return readFile(join(root, relativePath), 'utf8');
}

test('构建后 42 个详情页和所有 WebP 响应式图片存在', async () => {
  for (const locale of locales) {
    for (const { section, slug } of detailEntries) {
      const relativePath = `${locale}/${section}/${slug}/index.html`;
      await access(join(root, relativePath));
      const html = await read(relativePath);
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1, relativePath);
      assert.doesNotMatch(html, /\.png\b/);
      assert.match(html, /<img[^>]+width="\d+"[^>]+height="\d+"/);
      assert.match(html, new RegExp(`${siteUrl.replaceAll('.', '\\.')}\/${locale}\/${section}\/${slug}\/`));
    }
  }
});

test('站点不再输出临时图片提示，sitemap 覆盖所有详情 canonical', async () => {
  const sitemap = await read('sitemap.xml');
  const rootHtml = await read('index.html');
  assert.doesNotMatch(rootHtml, /http-equiv="refresh"|window\.location\.replace/);
  assert.doesNotMatch(sitemap, /<loc>[^<]*<\/loc>.*<loc>\1<\/loc>/s);
  for (const locale of locales) {
    for (const { section, slug } of detailEntries) assert.match(sitemap, new RegExp(`${siteUrl.replaceAll('.', '\\.')}\/${locale}\/${section}\/${slug}\/`));
  }
});

test('Vercel 与 IIS 均将根路径永久重定向到中文首页', async () => {
  const vercel = await read('vercel.json');
  const iis = await read('web.config');
  assert.match(vercel, /"source"\s*:\s*"\/"[\s\S]*"destination"\s*:\s*"\/zh-cn\/"[\s\S]*"statusCode"\s*:\s*308/);
  assert.match(iis, /redirectType="Permanent"[\s\S]*url="\/zh-cn\/"/);
});
