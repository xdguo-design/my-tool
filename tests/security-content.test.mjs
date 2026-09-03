import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('部署配置包含安全响应头和压缩配置', async () => {
  const config = await fs.readFile('site/web.config', 'utf8');
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /urlCompression/);
  assert.match(config, /defaultDocument/);
});

test('部署说明明确 HTTPS 和三语言路径', async () => {
  const readme = await fs.readFile('README.md', 'utf8');
  assert.match(readme, /HTTPS/);
  assert.match(readme, /zh-cn/);
  assert.match(readme, /English/);
  assert.match(readme, /Русский/);
});

test('Vercel 静态部署有根路径入口和安全头配置', async () => {
  const entry = await fs.readFile('site/index.html', 'utf8');
  const config = await fs.readFile('site/vercel.json', 'utf8');
  assert.match(entry, /\/zh-cn\//);
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /X-Content-Type-Options/);
});
