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
