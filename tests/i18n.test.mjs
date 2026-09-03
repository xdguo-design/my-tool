import test from 'node:test';
import assert from 'node:assert/strict';
import { supportedLocales, resolveLocale, localePath } from '../site/src/i18n.mjs';

test('支持中文、英文和俄语', () => {
  assert.deepEqual(supportedLocales, ['zh-cn', 'en', 'ru']);
});

test('浏览器语言匹配到俄语', () => {
  assert.equal(resolveLocale({ browserLanguages: ['ru-RU'], storedLocale: null }), 'ru');
});

test('未知语言回退中文', () => {
  assert.equal(resolveLocale({ browserLanguages: ['de-DE'], storedLocale: null }), 'zh-cn');
});

test('语言路径保持当前页面', () => {
  assert.equal(localePath('en', '/products/automatic-batching/'), '/en/products/automatic-batching/');
});
