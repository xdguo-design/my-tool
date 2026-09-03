import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { buildSite } from '../tools/build-site.mjs';

test('首页包含参考站式企业门户视觉层和动态轮播主视觉', async () => {
  await buildSite();
  const html = await fs.readFile('site/zh-cn/index.html', 'utf8');
  assert.match(html, /mettler.css/);
  assert.match(html, /utility-bar/);
  assert.match(html, /hero-carousel/);
  assert.match(html, /solution-showcase/);
  assert.match(html, /support-showcase/);
  assert.match(html, /class="showcase-media"/);
});

test('方案与产品卡片使用不重复的图片', async () => {
  const html = await fs.readFile('site/zh-cn/index.html', 'utf8');
  const images = [...html.matchAll(/<div class="showcase-media"><img src="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(images.length, 8);
  assert.equal(new Set(images).size, images.length);
});

test('首页动画具备滚动揭示和减弱动效兼容', async () => {
  const css = await fs.readFile('site/src/mettler.css', 'utf8');
  const js = await fs.readFile('site/src/app.mjs', 'utf8');
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@keyframes/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /data-reveal/);
});
