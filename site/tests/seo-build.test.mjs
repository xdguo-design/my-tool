import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, renderListingPage, renderDetailPage } from '../src/template.mjs';
import { detailEntries } from '../src/content.mjs';

test('首页只包含一个 h1，轮播其余标题使用 h2', () => {
  const html = renderPage('zh-cn');
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((html.match(/<h2\b/g) ?? []).length >= 3, true);
});

test('每个详情条目在三种语言都有稳定 URL 和唯一描述', () => {
  const urls = new Set();
  for (const locale of ['zh-cn', 'en', 'ru']) {
    for (const entry of detailEntries) {
      const html = renderDetailPage(locale, entry.section, entry.slug);
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
      const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
      urls.add(canonical);
      assert.equal(canonical, `https://www.balenda.cn/${locale}/${entry.section}/${entry.slug}/`);
      assert.ok(description.length > 40);
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
      assert.match(html, new RegExp(`"url": "${canonical.replaceAll('/', '\\/')}"`));
    }
  }
  assert.equal(urls.size, 42);
});

test('栏目卡片指向详情页而不是首页 contact 锚点', () => {
  const html = renderListingPage('zh-cn', 'products');
  const listingGrid = html.match(/<div class="listing-grid">([\s\S]*?)<\/div><\/section>/)[1];
  assert.match(listingGrid, /\/zh-cn\/products\/automatic-batching\//);
  assert.doesNotMatch(listingGrid, /href="\/zh-cn\/#contact"/);
});

test('所有页面输出 Open Graph 和 Twitter Card 标签', () => {
  for (const html of [renderPage('en'), renderListingPage('en', 'cases'), renderDetailPage('en', 'products', 'belt-scale')]) {
    assert.match(html, /property="og:title"/);
    assert.match(html, /property="og:description"/);
    assert.match(html, /property="og:image"/);
    assert.match(html, /property="og:url"/);
    assert.match(html, /name="twitter:card"/);
  }
});

test('未配置第三方 ID 时不输出统计脚本', () => {
  const html = renderPage('zh-cn');
  assert.doesNotMatch(html, /googletagmanager\.com|hm\.baidu\.com/);
});
