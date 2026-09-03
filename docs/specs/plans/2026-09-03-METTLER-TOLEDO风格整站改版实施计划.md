# METTLER TOLEDO 风格整站改版实施计划

> **给代理执行者：** 本计划在已获用户确认的设计规格基础上执行，按 TDD 的 RED-GREEN-REFACTOR 节奏推进。本项目当前目录不是 Git 仓库，因此不执行提交步骤。

**目标：** 将倍朗达首页及共用页面壳层改造成参考 METTLER TOLEDO 官网信息架构的工业企业门户，并加入可访问的动态首屏轮播。

**架构要点：** 继续使用 Node.js ESM 静态生成。`content.mjs` 提供三语言文案和本地图片，`template.mjs` 输出页面结构，`mettler.css` 负责视觉与响应式，`app.mjs` 只负责移动菜单和轮播状态；不引入远程资源、第三方脚本或后端接口。

**技术栈：** Node.js 18+、原生 HTML/CSS/JavaScript；验证命令为 `node tools/build-site.mjs` 和 `node --test tests/*.test.mjs`。

**关联设计文档：** `docs/specs/2026-09-03-METTLER-TOLEDO风格整站改版设计.md`

---

## 文件结构

- 修改：`site/src/content.mjs`——增加三语言 hero 幻灯片、快捷入口和支持区文案。
- 修改：`site/src/template.mjs`——重排共用 Header/Footer 与首页内容区，输出轮播和参考站式网格。
- 修改：`site/src/app.mjs`——保留现有菜单逻辑，增加轮播切换、自动播放、暂停和降级。
- 修改：`site/src/mettler.css`——替换当前简化版首页视觉规则，增加企业门户布局、轮播、卡片和响应式样式。
- 新建：`tests/reference-layout.test.mjs`——验证三语言结构、轮播契约、导航和外部资源约束。
- 生成：`site/assets/*`、`site/{zh-cn,en,ru}/index.html`——由构建命令同步生成，不手工编辑。

### 任务 1：建立参考站式首页结构的失败测试

**涉及文件：**

- 新建：`tests/reference-layout.test.mjs`

- [ ] **步骤 1：编写失败测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderPage } from '../site/src/template.mjs';

test('三种语言首页包含参考站式企业门户区块', () => {
  for (const locale of ['zh-cn', 'en', 'ru']) {
    const html = renderPage(locale);
    for (const marker of ['utility-bar', 'main-nav', 'hero-carousel', 'quick-actions', 'solution-showcase', 'support-showcase', 'expertise-showcase', 'site-footer']) {
      assert.match(html, new RegExp(`class="[^"]*${marker}`));
    }
  }
});

test('首页轮播包含三张幻灯片和可访问的切换控件', () => {
  const html = renderPage('en');
  assert.equal((html.match(/class="hero-slide/g) ?? []).length, 3);
  assert.equal((html.match(/data-carousel-target/g) ?? []).length, 3);
  assert.match(html, /aria-roledescription="carousel"/);
  assert.match(html, /aria-label="[^"]*previous/i);
  assert.match(html, /aria-label="[^"]*next/i);
});

test('轮播只使用本地资源', () => {
  const template = fs.readFileSync(new URL('../site/src/template.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(template, /<video|<iframe|https?:\/\//);
});
```

- [ ] **步骤 2：运行测试确认 RED**

运行：`node --test tests/reference-layout.test.mjs`

预期：前两个测试失败，因为当前模板没有 utility bar、hero carousel 和新的内容区；第三个测试通过或只报告模板中既有 Schema URL，不得把测试语法错误当成 RED 原因。

### 任务 2：补充三语言内容模型

**涉及文件：**

- 修改：`site/src/content.mjs`

- [ ] **步骤 1：增加内容字段**

为中文、英文、俄语对象分别增加相同结构的 `heroSlides`、`quickActions`、`supportItems`、`footerGroups`。`heroSlides` 每项包含 `image`、`eyebrow`、`title`、`text`、`cta`、`alt`；图片路径只允许使用 `/assets/images/hero-industrial-weighing-v1.png`、`/assets/images/product-weighing-control-v1.png` 和 `/assets/images/case-loading-terminal-v1.png`。

- [ ] **步骤 2：运行内容结构测试**

运行：`node --test tests/reference-layout.test.mjs`

预期：结构测试仍因模板缺少区块失败，但导入 `content.mjs` 不报错，三种语言数据均可被 `getContent(locale)` 读取。

### 任务 3：重排模板为参考站式首页

**涉及文件：**

- 修改：`site/src/template.mjs`

- [ ] **步骤 1：实现共用 Header 和 Footer**

将现有 Header 拆成 `utility-bar`、`main-nav` 和移动菜单按钮；保留现有链接和语言切换，增加 Search 入口但链接到首页 `#resources`。Footer 改为 `footer-groups` 多列结构，每组链接复用现有解决方案、产品、案例、资料和关于入口。

- [ ] **步骤 2：实现首页区块**

在 `<main>` 内按以下顺序输出：`hero-carousel`、`quick-actions`、`solution-showcase`、`support-showcase`、`expertise-showcase`、`consultation-band`。轮播每张 slide 使用同一个 DOM 结构，只有 `is-active` 的幻灯片可见；快捷入口链接到现有 section 或页面；方案和支持卡片复用现有 `data.solutions`、`data.products`、`data.resources` 和 `data.cases` 数据。

- [ ] **步骤 3：运行测试确认 GREEN**

运行：`node --test tests/reference-layout.test.mjs`

预期：区块结构、3 张幻灯片、切换控件和本地资源测试全部通过。

### 任务 4：实现参考站式视觉与响应式布局

**涉及文件：**

- 修改：`site/src/mettler.css`

- [ ] **步骤 1：实现桌面视觉**

增加 utility bar、main nav、hero carousel、quick actions、solution/support/expertise 卡片和多列 footer 样式。保持白底、深灰文字、红色 CTA、细边框、宽容器和大图卡片；hero 使用 `min-height: 620px`，卡片使用统一图片比例和悬停阴影。

- [ ] **步骤 2：实现轮播动效和降级**

为 `.hero-slide`、`.hero-slide.is-active`、`.hero-progress` 和 `.hero-carousel.is-ready` 增加 opacity/transform 过渡；`prefers-reduced-motion: reduce` 下关闭 transition/animation，保持 `.hero-slide.is-active` 静态可见。

- [ ] **步骤 3：实现移动端**

在 `max-width: 720px` 下将主导航折叠，hero 改为单列，quick actions 和卡片改为单列或两列，按钮达到可触摸尺寸；验证 `overflow-x` 不因装饰元素产生横向滚动。

- [ ] **步骤 4：运行全部结构测试**

运行：`node --test tests/*.test.mjs`

预期：全部现有测试和新增结构测试通过。

### 任务 5：实现轮播运行时行为

**涉及文件：**

- 修改：`site/src/app.mjs`

- [ ] **步骤 1：先增加运行时契约测试**

在 `tests/reference-layout.test.mjs` 追加以下断言：

```js
test('轮播脚本包含自动播放、手动切换和减少动态分支', () => {
  const app = fs.readFileSync(new URL('../site/src/app.mjs', import.meta.url), 'utf8');
  assert.match(app, /hero-carousel/);
  assert.match(app, /setInterval/);
  assert.match(app, /data-carousel-target/);
  assert.match(app, /prefers-reduced-motion/);
  assert.match(app, /mouseenter|pointerenter/);
});
```

运行：`node --test tests/reference-layout.test.mjs`

预期：新增测试失败，原因是 `app.mjs` 尚未包含轮播状态管理。

- [ ] **步骤 2：实现轮播脚本**

查询 `.hero-carousel`，收集 `.hero-slide`、`[data-carousel-target]`、上一张/下一张按钮；使用 `currentIndex` 和 `showSlide(index)` 同步 `is-active`、`aria-hidden`、`aria-selected` 和进度条。仅在支持 `IntersectionObserver`、未开启减少动态、且轮播进入视口后创建 7 秒 `setInterval`；鼠标进入、键盘聚焦和手动点击时暂停，离开后恢复。页面隐藏时清理 interval。

- [ ] **步骤 3：运行测试确认 GREEN**

运行：`node --test tests/*.test.mjs`

预期：全部测试通过。

### 任务 6：构建、浏览器验收和资源回归

**涉及文件：**

- 检查：`site/zh-cn/index.html`
- 检查：`site/en/index.html`
- 检查：`site/ru/index.html`
- 检查：`site/assets/mettler.css`
- 检查：`site/assets/app.mjs`

- [ ] **步骤 1：构建三语言站点**

运行：`node tools/build-site.mjs`

预期：输出 `Built 3 locales in .../site`。

- [ ] **步骤 2：运行完整测试**

运行：`node --test tests/*.test.mjs`

预期：所有测试通过。

- [ ] **步骤 3：检查生成页面区块**

运行：`rg -n "utility-bar|main-nav|hero-carousel|quick-actions|solution-showcase|support-showcase|expertise-showcase|site-footer" site/zh-cn/index.html site/en/index.html site/ru/index.html`

预期：三个首页都能找到全部 8 个结构标记。

- [ ] **步骤 4：检查外部资源约束**

运行：`rg -n "<script[^>]+src=\"https?://|<video|<iframe|url\(https?://" site/src site/assets`

预期：没有新增外部脚本、视频、iframe 或远程 CSS 图片资源。
