# 倍朗达工业自动化官网原型

这是一个可部署到 IIS 的静态官网基础工程，首期支持：

- 中文：`/zh-cn/`
- English：`/en/`
- Русский：`/ru/`

## 本地构建

需要 Node.js 18 或更高版本。

```powershell
node tools/build-site.mjs
node --test tests/*.test.mjs
```

构建后的站点位于 `site/`，将 `site/` 目录内容部署到 IIS 网站根目录即可。

## IIS 部署

1. 为 `balenda.cn` 和 `www.balenda.cn` 配置有效 HTTPS 证书。
2. 配置 HTTP 到 HTTPS 的 301 跳转，并确保 `/zh-cn/`、`/en/`、`/ru/` 均可直接访问。
3. 保留 `site/web.config`，它包含默认文档、压缩、缓存和基础安全响应头配置。
4. HTTPS 稳定后增加 HSTS：`Strict-Transport-Security: max-age=31536000; includeSubDomains`。
5. 上线前确认 `robots.txt`、`sitemap.xml`、canonical、hreflang 和 JSON-LD 与真实域名一致。

## Vercel 部署

Vercel 项目应将 `site` 设置为 Root Directory，Framework Preset 使用 `Other`，Build Command、Output Directory 和 Install Command 保持空白。根目录入口会自动跳转到 `/zh-cn/`，三个语言入口分别为 `/zh-cn/`、`/en/` 和 `/ru/`。

## 内容维护

多语言内容集中在 `site/src/content.mjs`，页面结构集中在 `site/src/template.mjs`。修改内容后重新运行构建命令即可生成三种语言页面。

## 上线前安全检查

- 不加载任何未知域名脚本。
- 扫描旧站文件中的 `tokenpocket`、异常 iframe 和陌生上传文件。
- 修改 FTP、IIS、后台和数据库凭据。
- 从 Search Console、Bing Webmaster Tools 检查收录和 AI 引用表现。
- 为产品参数、项目案例和 FAQ 补充真实工程数据，避免批量生成低价值页面。

## Image2 素材与动效

- 首页已切换到浅色工业企业风格，并接入 Image2 生成的临时主视觉、产品图和案例图；正式上线前替换为自有或已授权图片。
- 动画使用滚动揭示、图片轻微视差和卡片交互，并兼容 `prefers-reduced-motion`。
- 生成素材说明见 `docs/specs/2026-09-03-image2素材说明.md`。
