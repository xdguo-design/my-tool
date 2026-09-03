import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('站点包含响应式样式和交互脚本', async () => {
  const css = await fs.readFile('site/assets/styles.css', 'utf8');
  const js = await fs.readFile('site/assets/app.mjs', 'utf8');
  assert.match(css, /@media/);
  assert.match(css, /grid-template-columns/);
  assert.match(js, /menu-toggle/);
  assert.match(js, /language-link/);
});

test('生成页面不包含旧站恶意关键词或未知脚本', async () => {
  const html = await fs.readFile('site/zh-cn/index.html', 'utf8');
  assert.doesNotMatch(html.toLowerCase(), /tokenpocket/);
  assert.doesNotMatch(html, /https?:\/\/[^"']+\.js/);
});
