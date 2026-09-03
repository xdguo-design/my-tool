import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderPage } from '../site/src/template.mjs';

test('三种语言首页包含参考站式企业门户区块', () => {
  for (const locale of ['zh-cn', 'en', 'ru']) {
    const html = renderPage(locale);
    for (const marker of ['utility-bar', 'main-nav', 'hero-carousel', 'quick-actions', 'solution-showcase', 'support-showcase', 'expertise-showcase', 'about-showcase', 'site-footer']) {
      assert.match(html, new RegExp(`class="[^"]*${marker}`));
    }
  }
});

test('首页轮播包含三张幻灯片且不显示手动切换控件', () => {
  const html = renderPage('en');
  assert.equal((html.match(/class="hero-slide(?: is-active)?"/g) ?? []).length, 3);
  assert.match(html, /aria-roledescription="carousel"/);
  assert.doesNotMatch(html, /hero-carousel-controls/);
  assert.doesNotMatch(html, /data-carousel-(?:prev|next|target)/);
});

test('轮播只使用本地资源', () => {
  const template = fs.readFileSync(new URL('../site/src/template.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(template, /<script[^>]+src="https?:\/\/|<video|<iframe|url\(https?:\/\//);
});

test('轮播脚本包含自动播放和减少动态分支', () => {
  const app = fs.readFileSync(new URL('../site/src/app.mjs', import.meta.url), 'utf8');
  assert.match(app, /hero-carousel/);
  assert.match(app, /setInterval/);
  assert.match(app, /prefers-reduced-motion/);
  assert.match(app, /mouseenter|pointerenter/);
});
