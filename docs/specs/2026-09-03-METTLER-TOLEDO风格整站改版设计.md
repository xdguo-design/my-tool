# METTLER TOLEDO 风格整站改版设计

## 目标

以用户提供的 METTLER TOLEDO 官方首页为信息架构参考，将倍朗达现有静态官网升级为成熟的工业企业门户：顶部导航更完整，首屏采用动态轮播，后续内容按“解决方案—服务支持—专业资料—咨询联系”组织，整体呈现清晰、可信、可持续扩展的工业品牌形象。

参考页面：[METTLER TOLEDO 官方首页](https://www.mt.com/us/en/home.html)。参考站当前的核心层级包括 Products & Solutions、Industries、Services & Support、Events & Expertise、About Us、Contact，以及 Find Your Solution、Service and Support、Expertise 等内容区块。

## 范围与边界

- 本次改造首页和所有页面共用的 Header/Footer 视觉壳层。
- 首页增加参考站式的服务快捷入口、解决方案卡片、服务支持卡片、专业资料/活动区和咨询区。
- 现有 `/zh-cn/`、`/en/`、`/ru/` 路由、产品/案例/资料内容、SEO 元数据和 IIS 静态部署方式继续保留。
- 保留倍朗达自己的 Logo、联系方式、产品名称和三语言内容；只借鉴信息架构、间距、网格、导航层级和交互节奏，不复制 METTLER TOLEDO 的商标、原文、源代码或图片。
- 不新增后端、实时业务接口、第三方脚本或远程图片；动态素材使用现有本地原型图片。

## 页面结构

1. **Utility bar**：显示“需要帮助/技术支持/资料中心”等轻量入口和当前语言。
2. **Main header**：倍朗达品牌、五组主导航、联系我们 CTA、语言切换和搜索入口；桌面端保留清晰横向导航，移动端折叠菜单。
3. **Hero carousel**：全宽双栏或大图首屏，自动轮播三张本地工业视觉；每张包含编号、眉题、大标题、说明、红色 CTA、左右切换按钮和进度指示。首屏首次进入有淡入和图片轻微位移。
4. **Quick actions**：六个服务入口，覆盖方案咨询、技术支持、产品资料、项目案例、行业知识和联系我们。
5. **Find your solution**：将现有行业解决方案与核心产品重新组织为 6–8 个卡片，使用统一图像比例和清晰的 `Learn more` 入口。
6. **Service and support**：用 4 个大卡片展示选型、系统集成、调试维护和售后支持。
7. **Expertise and events**：保留现有资源内容，增加资料类型标签、活动/案例横条和查看更多入口。
8. **Consultation band**：橙红色咨询区域，突出电话、邮箱和获取技术方案 CTA。
9. **Mega footer**：按产品与解决方案、服务支持、工程资料、关于倍朗达、联系入口分列，并保留语言切换。

## 动态交互

- 轮播间隔 7 秒，仅当首屏在视口内且用户没有开启减少动态时运行。
- 用户悬停、聚焦或点击切换时暂停自动轮播；点击圆点或箭头可切换到指定幻灯片。
- 切换使用 CSS opacity/transform，不依赖视频；当前幻灯片按钮状态和 `aria-selected` 同步。
- 页面不可用 IntersectionObserver 时显示第一张静态幻灯片，主要文案和 CTA 仍可用。
- `prefers-reduced-motion: reduce` 时关闭自动轮播、位移和过渡，只显示当前静态幻灯片。

## 组件边界

- `site/src/content.mjs`：增加每种语言的 `heroSlides` 和快捷服务/支持区文案。
- `site/src/template.mjs`：输出共用 Header、首页轮播、快捷入口、解决方案/支持/资料区和 Footer。
- `site/src/app.mjs`：管理移动导航和 hero 轮播状态，不请求网络，不伪造实时数据。
- `site/src/mettler.css`：承载参考站式视觉层、响应式网格和轮播样式；`styles.css` 继续提供基础兜底。

## 可访问性

- 轮播使用 `role="region"`、`aria-roledescription="carousel"`、带本地化标签的标题；切换按钮有明确 `aria-label`。
- 非当前幻灯片设置 `aria-hidden="true"`，当前幻灯片保持可读；自动切换不使用强制焦点。
- 装饰图片和图形使用 `aria-hidden` 或准确 alt，所有 CTA 保持键盘可达。
- 移动端不依赖 hover；减少动态模式下信息完整且首屏不闪烁。

## 验收标准

- 三种语言首页都具备完整 Header、Hero 轮播、Quick actions、Solutions、Services、Expertise/Events、咨询区和多列 Footer。
- 桌面端首屏视觉接近参考站的企业门户层级，移动端无水平溢出，导航可展开/收起。
- 轮播能自动切换、手动切换、悬停/聚焦暂停；减少动态模式下无自动切换且可读。
- 所有图片来自 `/assets/images/`，不新增外部域名请求或第三方脚本。
- `node tools/build-site.mjs` 与 `node --test tests/*.test.mjs` 全部通过。
