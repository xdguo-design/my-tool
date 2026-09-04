# SEO 静态站点完整优化实施计划

> **给代理执行者：** 推荐配合 `subagent-driven-development（子代理驱动开发）`（每任务独立子代理 + 两阶段审查）或在本会话内按勾选逐步执行并在批次节点与用户确认。任务使用 `- [ ]` 勾选跟踪。

**目标：** 为 14 个内容条目生成三语言详情页，并完成元数据、结构化数据、图片、跳转、站点地图和发布配置优化。

**架构要点：** `src/content.mjs` 是唯一内容源，`src/template.mjs` 负责页面渲染，`src/build.mjs` 负责生成 HTML 与 sitemap。详情页使用统一模板和 page model，避免为 42 个 URL 复制 HTML。

**技术栈：** 原生 JavaScript ES modules、静态 HTML/CSS、Node.js 内置 `node:test`；图片转换使用 ImageMagick `magick` 命令；验证命令为 `node --test tests/*.test.mjs` 和 `node src/build.mjs`。

**关联设计文档：** `docs/specs/2026-09-03-seo-optimization-design.md`

---

## 文件结构

- 修改：`src/content.mjs`，增加 14 个条目的 slug、SEO 文案、详情字段、图片配置和可选发布配置。
- 修改：`src/template.mjs`，增加 head/详情页/图片渲染器，修复首页 H1、列表卡片链接和 JSON-LD。
- 新建：`src/build.mjs`，统一生成首页、栏目页、详情页、根兜底页和 sitemap。
- 新建：`tests/seo-build.test.mjs`，测试内容模型、页面模板和静态输出。
- 新建：`package.json`，提供 `build`、`test` 和 `check:seo` 命令。
- 修改：`index.html`，移除 meta refresh 和 JavaScript 跳转。
- 修改：`vercel.json`、`web.config`，增加根路径 308 跳转。
- 修改：`robots.txt`、`README.md`、`sitemap.xml`，同步发布与收录说明和详情路径。
- 新建：`assets/images/*-640.webp`、`assets/images/*-1280.webp`，由现有 PNG 生成并用于页面。
- 修改：各生成 HTML 目录，执行构建脚本后刷新内容。

### 任务 1：建立可失败的 SEO 行为测试

**涉及文件：**

- 新建：`tests/seo-build.test.mjs`
- 新建：`package.json`

- [ ] **步骤 1：编写失败测试**

测试导入 `renderPage`、`renderListingPage`、`renderDetailPage`、`buildSite` 与 `detailEntries`，覆盖以下行为：

```js
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
  assert.match(html, /\/zh-cn\/products\/automatic-batching\//);
  assert.doesNotMatch(html, /href="\/zh-cn\/#contact"/);
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
```

- [ ] **步骤 2：运行测试确认失败**

运行：`node --test tests/seo-build.test.mjs`  
预期：失败，当前模板没有 `renderDetailPage`/`detailEntries`，首页包含 3 个 `h1`，栏目卡片也没有详情 slug。

### 任务 2：扩充内容模型与构建入口

**涉及文件：**

- 修改：`src/content.mjs`
- 新建：`src/build.mjs`
- 修改：`package.json`

- [ ] **步骤 1：最小实现内容模型**

为 14 个条目增加 `slug`，并导出不可变的 `detailEntries`。每个 locale 的详情数据必须包含 `title`、`description`、`intro`、`highlights`、`applications`、`faq` 和 `image`；slug 集合在三语言间一致。增加 `siteConfig`，其验证码和统计字段默认为空字符串，构建时只渲染非空值。

- [ ] **步骤 2：实现构建入口**

`src/build.mjs` 使用 `mkdir({ recursive: true })` 创建 `/{locale}/{section}/{slug}/`，调用模板生成 3 个首页、12 个栏目页、42 个详情页，写入根兜底页和完整 sitemap。写入前检查所有 canonical URL 唯一；错误包含 locale/section/slug。

- [ ] **步骤 3：运行测试确认内容模型仍失败于模板行为**

运行：`node --test tests/seo-build.test.mjs`  
预期：失败原因收敛到 `renderDetailPage` 未实现、元数据未补齐或链接未切换，不再出现 `detailEntries` 未导出错误。

### 任务 3：抽取 SEO head 并修复页面模板

**涉及文件：**

- 修改：`src/template.mjs`
- 修改：`src/content.mjs`

- [ ] **步骤 1：实现统一 head 渲染器**

新增 `renderSeoHead({ locale, title, description, url, image, type, alternatePath })`，转义所有用户内容；输出 title、description、canonical、三语言 hreflang、x-default、OG、Twitter、可选验证标签和 JSON-LD 容器引用所需的 head 内容。

- [ ] **步骤 2：修复首页和栏目页**

`renderHeroCarousel` 根据 index 渲染首张 `h1`、其余 `h2`。`renderSolutionShowcase` 使用 `entry.href` 指向详情 URL。栏目页卡片使用条目 slug，Description 改用栏目专属 SEO 文案，JSON-LD 的 CollectionPage 与 BreadcrumbList 使用栏目 URL。

- [ ] **步骤 3：实现详情页模板**

新增 `renderDetailPage(locale, section, slug)`：校验条目存在；输出一个 h1、eyebrow、主图、intro、highlights、applications、FAQ、CTA、相关内容链接；产品页面 JSON-LD 为 Product，方案为 Service，案例/资料为 Article。产品 JSON-LD 包含 brand、image、category 和每个可用的 `additionalProperty`，不填未提供的价格、库存或规格。

- [ ] **步骤 4：运行测试确认通过**

运行：`node --test tests/seo-build.test.mjs`  
预期：全部测试通过；测试输出 `pass` 数量等于测试用例数，`fail 0`。

### 任务 4：RED-GREEN 后的模板重构与内容链接完整性

**涉及文件：**

- 修改：`src/template.mjs`
- 修改：`src/content.mjs`
- 新建：`tests/static-site.test.mjs`

- [ ] **步骤 1：编写静态站点回归测试**

测试构建后检查：42 个详情 `index.html` 存在；每个 HTML 只有一个 h1；HTML 不包含 `referenceNote` 的临时图片文案；页面引用的图片路径均以 `.webp` 结尾；sitemap 包含所有详情 canonical URL；所有同语言详情的语言切换链接保持相同 section/slug。

- [ ] **步骤 2：运行回归测试确认失败**

运行：`node --test tests/static-site.test.mjs`  
预期：失败，因为生成目录、WebP 图片和 sitemap 详情 URL 尚未刷新。

- [ ] **步骤 3：最小实现链接和图片引用**

删除页面可见的“真实设备图片与现场案例可替换”“临时原型图片 · 待替换”提示；将 footer 产品链接、首页产品/方案/资源卡片及列表卡片全部切换到详情 URL；把图片 helper 应用到 hero、showcase、support 和详情页，输出 `picture`、640/1280 WebP `srcset` 和 `sizes`。

- [ ] **步骤 4：运行回归测试确认通过**

运行：`node src/build.mjs; node --test tests/seo-build.test.mjs tests/static-site.test.mjs`  
预期：构建成功，所有 SEO 和静态输出测试通过。

### 任务 5：生成响应式 WebP 图片

**涉及文件：**

- 新建：`assets/images/hero-industrial-weighing-v1-640.webp`、`assets/images/hero-industrial-weighing-v1-1280.webp`
- 新建：其余 7 张图片对应的 `-640.webp` 与 `-1280.webp`

- [ ] **步骤 1：检查转换工具**

运行：`magick -version`  
预期：输出 ImageMagick 版本；若不可用，停止本任务并报告需要安装图片转换工具，不修改 PNG 源文件。

- [ ] **步骤 2：转换图片**

对 `assets/images/*.png` 分别运行：`magick input.png -resize 640x -strip -quality 78 output-640.webp` 和 `magick input.png -resize 1280x -strip -quality 82 output-1280.webp`。保留 PNG 作为源文件。

- [ ] **步骤 3：验证体积和文件完整性**

运行：`Get-ChildItem assets/images/*.webp | Measure-Object -Property Length -Sum` 和 `magick identify assets/images/*.webp`。预期：16 个 WebP 文件均可识别，合计体积小于原 8 个 PNG 的 50%。

- [ ] **步骤 4：重新构建并运行图片引用测试**

运行：`node src/build.mjs; node --test tests/static-site.test.mjs`  
预期：全部页面只引用 WebP，且每个引用图片的 640/1280 资源均存在。

### 任务 6：根路径跳转、发布配置、验证入口和 sitemap

**涉及文件：**

- 修改：`index.html`
- 修改：`vercel.json`
- 修改：`web.config`
- 修改：`robots.txt`
- 修改：`README.md`
- 修改：`src/build.mjs`

- [ ] **步骤 1：编写配置回归测试**

断言根 `index.html` 不含 `http-equiv="refresh"` 和 `window.location.replace`；Vercel 配置包含 `/` 到 `/zh-cn/` 的 308 redirect；IIS 配置包含同等 308 URL Rewrite；robots 指向 sitemap；sitemap 不包含重复 loc。

- [ ] **步骤 2：运行测试确认失败**

运行：`node --test tests/static-site.test.mjs`  
预期：失败，现有根 HTML 仍含 Meta Refresh/JavaScript，Vercel 与 IIS 尚无根路径重定向规则，sitemap 尚未含详情 URL。

- [ ] **步骤 3：实现发布配置**

根 HTML 只保留语言声明、标题、canonical 兜底链接和正文链接。Vercel 使用 status 308 redirect；IIS 使用 `rewrite` 规则把精确根路径重定向到 `/zh-cn/`，避免循环。README 增加构建命令、sitemap 提交步骤、Search Console/百度搜索资源平台登记位置和环境配置字段说明。

- [ ] **步骤 4：运行配置测试确认通过**

运行：`node src/build.mjs; node --test tests/seo-build.test.mjs tests/static-site.test.mjs`  
预期：配置、页面、sitemap 和结构化数据测试全部通过。

### 任务 7：完整验证与质量门禁

**涉及文件：**

- 修改：测试中发现的源文件或生成文件

- [ ] **步骤 1：运行 Node 测试**

运行：`npm test`  
预期：所有单元/集成静态生成测试通过，失败数为 0。

- [ ] **步骤 2：运行构建**

运行：`npm run build`  
预期：生成 57 个非根页面（3 首页 + 12 栏目 + 42 详情）及更新后的 sitemap，不报告异常。

- [ ] **步骤 3：运行 SEO 检查**

运行：`npm run check:seo`  
预期：输出页面总数、唯一 canonical 数、详情页数、重复 title/description 数、缺失图片数；重复和缺失均为 0。

- [ ] **步骤 4：运行安全检查**

运行：`rg -n "(api[_-]?key|secret|token|G-[A-Z0-9]+|hm\.baidu\.com)" src assets README.md`  
预期：只出现配置字段名或说明，不出现真实密钥、追踪 ID 或第三方脚本片段。

- [ ] **步骤 5：检查工作区差异**

运行：`git status --short; git diff --stat; git diff --check`  
预期：只有本次 SEO 优化相关文件发生变化，`git diff --check` 无空白错误；不执行提交或推送，除非用户另行要求。
