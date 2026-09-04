# SEO 静态站点完整优化设计

**日期：** 2026-09-03  
**范围：** `D:\WorkSpace\网站优化\site`  站点源代码、生成页面、发布配置与图片资源

## 目标

在不引入后端和第三方账号依赖的前提下，提升站点的可收录内容量、页面主题相关性、社交分享展示、静态资源性能和发布跳转正确性。

## 方案

### 内容与 URL

内容源继续集中在 `src/content.mjs`，但每个条目增加稳定 slug、唯一 SEO 标题/描述、图片、正文段落、要点、适用场景和 FAQ。现有 4 个产品、4 个行业方案、3 个案例、3 个技术资料全部生成详情页，并为三种语言各生成一套，共 42 个详情页：

```text
/{locale}/products/{slug}/
/{locale}/solutions/{slug}/
/{locale}/cases/{slug}/
/{locale}/resources/{slug}/
```

列表页和首页卡片都链接到详情页；详情页 CTA 链接到本语言首页的 `#contact`。详情页保留栏目导航和面包屑，形成首页 → 栏目 → 详情的内部链接层级。

### 模板与元数据

在 `src/template.mjs` 中抽取 head 元数据渲染函数，接收页面类型、标题、描述、URL、图片和语言路径。它输出唯一的 title、description、canonical、hreflang、Open Graph 和 Twitter Card 标签。详情页跨语言链接使用相同内容 slug，不能把详情页误链到语言首页。

首页轮播第一张使用 `h1`，其他轮播标题使用 `h2`；栏目页和详情页各有一个页面主 `h1`。详情页 JSON-LD 使用：产品 `Product`，方案 `Service`，案例和资料 `Article`；每个实体都使用详情 URL、品牌、页面图片和 BreadcrumbList。

### 图片、跳转与发布

用 ImageMagick 将 8 张 PNG 转成 640px 和 1280px WebP，页面通过 `picture`/`srcset`/`sizes` 使用 WebP；原 PNG 保留为可回溯源文件。页面文案不再展示“临时图片/待替换”提示。根目录 HTML 只保留可访问的兜底链接，Vercel 和 IIS 分别配置 308 重定向到 `/zh-cn/`。

### 统计与站点验证

新增无密钥的发布配置模块，允许填写百度/Google 验证码以及百度统计/Google Analytics 脚本 ID。配置值为空时不输出任何验证标签或统计脚本，不伪造第三方代码；README 说明发布时应提交 sitemap 并在两个平台配置站点。

## 验收与错误处理

- 构建脚本从内容源生成所有页面；任何未知 locale、section 或 slug 都抛出带上下文的错误。
- Node 内置测试验证全部 42 个详情页、页面唯一 H1、唯一元数据、详情 URL、JSON-LD 类型和 sitemap 路径。
- 静态检查验证 HTML 文件存在、内部 href 指向现有文件或页面锚点、页面不引用 PNG、页面不包含临时图片提示。
- 生成步骤是幂等的，重复构建只更新生成内容，不删除图片源。

## 非目标

- 不在源码中写入真实统计账号、搜索平台 token 或外部密钥。
- 不声称未提供的产品规格、认证、客户名称、项目金额或效果数据。
- 不引入 CMS、服务端渲染或在线表单后端。
