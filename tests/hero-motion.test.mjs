import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderPage } from '../site/src/template.mjs';

test('三种语言首页包含三张动态 hero 幻灯片', () => {
  for (const locale of ['zh-cn', 'en', 'ru']) {
    const html = renderPage(locale);
    assert.match(html, /class="hero-carousel"/);
    assert.equal((html.match(/class="hero-slide(?: is-active)?"/g) ?? []).length, 3);
    assert.match(html, /aria-roledescription="carousel"/);
  }
});

test('hero 幻灯片的图片包含替代文本', () => {
  const html = renderPage('zh-cn');
  assert.equal((html.match(/class="hero-slide[^>]*aria-hidden/g) ?? []).length, 3);
  assert.equal((html.match(/<img[^>]+alt="[^"]+"/g) ?? []).length >= 3, true);
});

test('轮播具备视口启动和减少动态降级', () => {
  const css = fs.readFileSync(new URL('../site/src/mettler.css', import.meta.url), 'utf8');
  const app = fs.readFileSync(new URL('../site/src/app.mjs', import.meta.url), 'utf8');
  assert.match(css, /\.hero-slide\.is-active/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(app, /IntersectionObserver/);
  assert.match(app, /setInterval/);
});
