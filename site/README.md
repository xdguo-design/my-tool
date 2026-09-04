# 倍朗达自动化静态站点

这是一个由 ES modules 内容源生成的多语言静态站点，支持中文、英文和俄文。页面源文件位于 `src/`，发布目录为仓库根目录。

## 构建与检查

```text
npm run build
npm test
npm run check:seo
```

构建会生成 3 个首页、12 个栏目页、42 个详情页，并刷新 `sitemap.xml`。图片源 PNG 保留在 `assets/images/`，页面使用同名的 640px/1280px WebP 响应式资源。

## 发布前收录配置

1. 将 `sitemap.xml` 提交到 Google Search Console 和百度搜索资源平台。
2. 在 `src/content.mjs` 的 `siteConfig.verification` 中填入平台提供的验证码；留空时不会输出验证标签。
3. 在 `src/content.mjs` 的 `siteConfig.analytics` 中填入 Google Analytics Measurement ID 或百度统计 ID；留空时不会输出统计脚本。
4. 重新运行 `npm run build`，检查生成 HTML 后再发布。不要把 API 密钥、token 或后台凭据写入此静态仓库。

Vercel 使用 `vercel.json` 的 308 规则，IIS 使用 `web.config` 的永久重定向规则，将根路径 `/` 指向 `/zh-cn/`。
