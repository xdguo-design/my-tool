import { localePath, supportedLocales } from './i18n.mjs';
import { detailEntries, getContent, getDetailContent, siteConfig, siteUrl } from './content.mjs';

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const lines = (value) => escapeHtml(value).replaceAll('\n', '<br>');
const cssFiles = ['styles.css', 'listing.css', 'detail.css', 'mettler.css', 'responsive.css'];
const absoluteUrl = (path) => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
const imageDimensions = {
  '/assets/images/case-loading-terminal-v1.png': [1280, 851],
  '/assets/images/hero-industrial-weighing-v1.png': [1280, 720],
  '/assets/images/product-batching-v1.png': [1280, 853],
  '/assets/images/product-weighing-control-v1.png': [1280, 960],
  '/assets/images/solution-cement-v1.png': [1280, 853],
  '/assets/images/solution-port-v1.png': [1280, 853],
  '/assets/images/solution-power-v1.png': [1280, 853],
  '/assets/images/solution-steel-v1.png': [1280, 853],
};

function imageStem(image) {
  return image.replace(/\.png$/, '');
}

function responsiveImage(image, alt, { priority = false, sizes = '100vw' } = {}) {
  const stem = imageStem(image);
  const loading = priority ? 'fetchpriority="high"' : 'loading="lazy"';
  const [width, height] = imageDimensions[image] ?? [1280, 720];
  return `<picture><source type="image/webp" srcset="${stem}-640.webp 640w, ${stem}-1280.webp 1280w" sizes="${sizes}"><img src="${stem}-1280.webp" width="${width}" height="${height}" alt="${escapeHtml(alt)}" ${loading}></picture>`;
}

function safeJson(value) {
  return JSON.stringify(value, null, 2).replaceAll('<', '\\u003c');
}

function breadcrumb(locale, data, section, detail) {
  const home = `${siteUrl}/${locale}/`;
  const sectionUrl = `${home}${section}/`;
  const items = [{ '@type': 'ListItem', position: 1, name: data.shortName, item: home }];
  if (section) items.push({ '@type': 'ListItem', position: 2, name: data.nav[section], item: sectionUrl });
  if (detail) items.push({ '@type': 'ListItem', position: 3, name: detail.title, item: `${sectionUrl}${detail.slug}/` });
  return { '@type': 'BreadcrumbList', itemListElement: items };
}

function organizationSchema(data) {
  return { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: data.name, url: siteUrl, email: data.email, telephone: data.mobile, address: { '@type': 'PostalAddress', streetAddress: data.address, addressCountry: 'CN' } };
}

function siteSchema(data) {
  return { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: data.shortName, url: siteUrl, inLanguage: data.lang, publisher: { '@id': `${siteUrl}/#organization` } };
}

function productSchema(locale, detail, data) {
  return { '@type': 'Product', name: detail.title, alternateName: detail.subheading, description: detail.seoDescription, image: absoluteUrl(`${imageStem(detail.image)}-1280.webp`), brand: { '@type': 'Brand', name: data.shortName }, category: data.nav.products, url: `${siteUrl}/${locale}/products/${detail.slug}/`, additionalProperty: detail.highlights.map((value, index) => ({ '@type': 'PropertyValue', name: `Feature ${index + 1}`, value })) };
}

function detailSchema(locale, section, detail, data) {
  const url = `${siteUrl}/${locale}/${section}/${detail.slug}/`;
  if (section === 'products') return productSchema(locale, detail, data);
  if (section === 'solutions') return { '@type': 'Service', name: detail.title, serviceType: data.nav.solutions, description: detail.seoDescription, image: absoluteUrl(`${imageStem(detail.image)}-1280.webp`), provider: { '@id': `${siteUrl}/#organization` }, url };
  return { '@type': 'Article', headline: detail.title, articleSection: data.nav[section], description: detail.seoDescription, image: absoluteUrl(`${imageStem(detail.image)}-1280.webp`), author: { '@id': `${siteUrl}/#organization` }, publisher: { '@id': `${siteUrl}/#organization` }, mainEntityOfPage: url, url };
}

function jsonLd(locale, data, { section = null, detail = null, collection = false } = {}) {
  const pageUrl = detail ? `${siteUrl}/${locale}/${section}/${detail.slug}/` : section ? `${siteUrl}/${locale}/${section}/` : `${siteUrl}/${locale}/`;
  const graph = [organizationSchema(data), siteSchema(data), breadcrumb(locale, data, section, detail)];
  if (detail) graph.push(detailSchema(locale, section, detail, data));
  if (collection) graph.push({ '@type': 'CollectionPage', name: `${data.nav[section]} | ${data.shortName}`, description: data.sectionLabels[section], url: pageUrl, isPartOf: { '@type': 'WebSite', url: siteUrl } });
  if (!detail && !collection) detailEntries.filter((entry) => entry.section === 'products').forEach((entry) => graph.push(productSchema(locale, getDetailContent(locale, entry.section, entry.slug), data)));
  return safeJson({ '@context': 'https://schema.org', '@graph': graph });
}

function renderSeoHead({ locale, data, title, description, url, image, type = 'website', currentPath = '/', jsonLdText }) {
  const verification = [siteConfig.verification.google && `<meta name="google-site-verification" content="${escapeHtml(siteConfig.verification.google)}">`, siteConfig.verification.baidu && `<meta name="baidu-site-verification" content="${escapeHtml(siteConfig.verification.baidu)}">`].filter(Boolean).join('');
  const alternates = supportedLocales.map((item) => `<link rel="alternate" hreflang="${getContent(item).lang}" href="${siteUrl}${localePath(item, currentPath)}">`).join('');
  const analytics = [siteConfig.analytics.google && `<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(siteConfig.analytics.google)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${escapeHtml(siteConfig.analytics.google)}');</script>`, siteConfig.analytics.baidu && `<script>var _hmt=_hmt||[];(function(){var hm=document.createElement('script');hm.src='https://hm.baidu.com/hm.js?${encodeURIComponent(siteConfig.analytics.baidu)}';document.head.appendChild(hm)}());</script>`].filter(Boolean).join('');
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${url}">${alternates}<link rel="alternate" hreflang="x-default" href="${siteUrl}${localePath('zh-cn', currentPath)}"><meta property="og:type" content="${type}"><meta property="og:site_name" content="${escapeHtml(data.shortName)}"><meta property="og:locale" content="${escapeHtml(data.lang)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:image" content="${absoluteUrl(image)}"><meta property="og:url" content="${url}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${absoluteUrl(image)}">${verification}${cssFiles.map((file) => `<link rel="stylesheet" href="/assets/${file}">`).join('')}<script type="application/ld+json">${jsonLdText}</script>${analytics}`;
}

function renderLanguageLinks(locale, currentPath = '/') {
  return supportedLocales.map((item) => `<a class="language-link${item === locale ? ' is-active' : ''}" href="${localePath(item, currentPath)}" hreflang="${getContent(item).lang}" lang="${getContent(item).lang}">${escapeHtml(getContent(item).localeLabel)}</a>`).join('');
}

function renderHeader(locale, data, pageHref, currentPath = '/') {
  const navItems = [['products', data.nav.products], ['solutions', data.nav.solutions], ['services', data.nav.services], ['resources', data.nav.resources], ['about', data.nav.about]];
  const hrefFor = (section) => section === 'about' ? `/${locale}/#about` : section === 'services' ? `/${locale}/#support` : pageHref(section);
  const photographyNote = data.ui.referenceNote.replace(/真实设备图片与现场案例可替换|Replace with owned equipment and project photography|Заменить собственными фотографиями оборудования и проектов/g, data.ui.footerTag);
  return `<header class="site-header"><div class="utility-bar"><div class="container utility-inner"><span>${escapeHtml(data.ui.start)} · ${escapeHtml(photographyNote)}</span><div><a href="${pageHref('resources')}">${escapeHtml(data.nav.resources)}</a><a href="${pageHref('cases')}">${escapeHtml(data.nav.cases)}</a><a href="/${locale}/#support">${escapeHtml(data.nav.services)}</a></div></div></div><div class="container main-nav"><a class="brand" href="/${locale}/" aria-label="${escapeHtml(data.name)}"><span class="brand-mark">B</span><span>${escapeHtml(data.shortName)}</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">☰ <span>${escapeHtml(data.ui.menu)}</span></button><nav id="primary-nav" class="primary-nav" aria-label="Primary navigation">${navItems.map(([section, label]) => `<a href="${hrefFor(section)}">${escapeHtml(label)}</a>`).join('')}<a class="nav-cta" href="/${locale}/#contact">${escapeHtml(data.nav.contact)} <span>↗</span></a></nav><div class="header-tools"><a class="search-link" href="/${locale}/#resources" aria-label="Search">⌕</a><div class="language-switcher" aria-label="Language switcher">${renderLanguageLinks(locale, currentPath)}</div></div></div></header>`;
}

function detailLink(locale, section, slug) {
  return `/${locale}/${section}/${slug}/`;
}

function renderFooter(locale, data, pageHref, currentPath = '/') {
  const productLinks = detailEntries.filter((entry) => entry.section === 'products').slice(0, 3).map((entry) => { const detail = getDetailContent(locale, entry.section, entry.slug); return [detail.title, detailLink(locale, entry.section, entry.slug)]; });
  const home = `/${locale}/`;
  const groups = [[data.nav.products, productLinks], [data.nav.solutions, [[data.nav.solutions, pageHref('solutions')], [data.nav.cases, pageHref('cases')], [data.nav.services, `${home}#support`]]], [data.nav.resources, [[data.nav.resources, pageHref('resources')], [data.ui.read, pageHref('resources')], [data.ui.start, `${home}#contact`]]], [data.nav.about, [[data.nav.about, `${home}#about`], [data.nav.contact, `${home}#contact`], [data.localeLabel, home]]]];
  return `<footer class="site-footer"><div class="container footer-groups"><div class="footer-intro"><a class="brand" href="/${locale}/"><span class="brand-mark">B</span><span>${escapeHtml(data.shortName)}</span></a><p>${escapeHtml(data.footer)}</p></div>${groups.map(([title, links]) => `<div class="footer-group"><h3>${escapeHtml(title)}</h3>${links.map(([label, href]) => `<a href="${href}">${escapeHtml(label)}</a>`).join('')}</div>`).join('')}</div><div class="container footer-bottom"><span>© 2026 Balenda Automation</span><div class="footer-languages">${renderLanguageLinks(locale, currentPath)}</div><span>${escapeHtml(data.ui.footerTag)}</span></div></footer>`;
}

function renderHeroCarousel(locale, data) {
  const carouselLabel = locale === 'zh-cn' ? '首页重点内容' : locale === 'ru' ? 'Основные материалы' : 'Featured solutions';
  return `<section class="reference-hero"><div class="container"><div class="hero-carousel" role="region" aria-roledescription="carousel" aria-label="${carouselLabel}" data-carousel><div class="hero-slides">${data.heroSlides.map((slide, index) => `<article class="hero-slide${index === 0 ? ' is-active' : ''}" data-carousel-slide="${index}" aria-hidden="${index === 0 ? 'false' : 'true'}"><div class="hero-slide-copy"><p class="eyebrow">${escapeHtml(slide.eyebrow)}</p>${index === 0 ? `<h1>${lines(slide.title)}</h1>` : `<h2>${lines(slide.title)}</h2>`}<p>${escapeHtml(slide.text)}</p><a class="button button-primary" href="/${locale}/#${index === 0 ? 'solutions' : index === 1 ? 'products' : 'cases'}">${escapeHtml(slide.cta)} <span>↗</span></a></div><div class="hero-slide-media">${responsiveImage(slide.image, slide.alt, { priority: index === 0, sizes: '(max-width: 720px) 100vw, 58vw' })}<span class="hero-slide-index">0${index + 1} / 03</span></div></article>`).join('')}</div></div></div></section>`;
}

function getListItems(locale, section) {
  return detailEntries.filter((entry) => entry.section === section).map((entry) => getDetailContent(locale, section, entry.slug));
}

function renderQuickActions(data, locale) {
  return `<section class="quick-actions container" aria-labelledby="quick-actions-title"><div class="section-mini-heading"><p class="kicker">00 / ${escapeHtml(data.nav.services)}</p><h2 id="quick-actions-title">${locale === 'zh-cn' ? '从一个问题开始。' : locale === 'ru' ? 'Начните с задачи.' : 'Start with one question.'}</h2></div><div class="quick-action-grid">${data.quickActions.map(([title, description, href], index) => `<a class="quick-action" href="${href.startsWith('/') ? href : `/${locale}/${href}`}" data-reveal="card"><span>0${index + 1}</span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)}</small><b>↗</b></a>`).join('')}</div></section>`;
}

function renderSolutionShowcase(locale, data, pageHref) {
  const solutionCards = getListItems(locale, 'solutions').map((detail) => ({ ...detail, label: data.nav.solutions, href: detailLink(locale, 'solutions', detail.slug) }));
  const productCards = getListItems(locale, 'products').map((detail) => ({ ...detail, label: data.nav.products, href: detailLink(locale, 'products', detail.slug) }));
  return `<section id="solutions" class="reference-section solution-showcase" data-reveal="section"><div class="container"><div class="reference-heading"><div><p class="kicker">01 / ${escapeHtml(data.sectionLabels.solutions)}</p><h2>${locale === 'zh-cn' ? '找到适合现场的<br><em>测量与控制方案。</em>' : locale === 'ru' ? 'Решение для<br><em>вашего процесса.</em>' : 'Find the right<br><em>solution for your process.</em>'}</h2></div><a class="text-link" href="${pageHref('solutions')}">${escapeHtml(data.ui.explore)} <span>↗</span></a></div><div class="showcase-grid">${[...solutionCards, ...productCards].map((card, index) => `<article class="showcase-card" data-reveal="card"><div class="showcase-media">${responsiveImage(card.image, card.title, { sizes: '(max-width: 720px) 100vw, 25vw' })}<span>${escapeHtml(card.label)}</span><strong>0${index + 1}</strong></div><div class="showcase-body"><h3>${escapeHtml(card.title)}</h3><p class="card-subtitle">${escapeHtml(card.subheading)}</p><p>${escapeHtml(card.description)}</p><a href="${card.href}">${escapeHtml(data.ui.explore)} <span>↗</span></a></div></article>`).join('')}</div></div></section>`;
}

function renderSupportShowcase(data) {
  return `<section id="support" class="reference-section support-showcase section-tint" data-reveal="section"><div class="container"><div class="reference-heading"><div><p class="kicker">02 / ${escapeHtml(data.nav.services)}</p><h2>${data.sectionTitles.about}</h2></div><a class="text-link" href="#contact">${escapeHtml(data.ui.start)} <span>↗</span></a></div><div class="support-grid">${data.supportItems.map(([title, description, type, image], index) => `<article class="support-card" data-reveal="card"><div class="support-media">${responsiveImage(image, title, { sizes: '(max-width: 720px) 100vw, 25vw' })}<span>${escapeHtml(type)}</span></div><div class="support-body"><span>0${index + 1}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><a href="#contact">${escapeHtml(data.ui.read)} <span>↗</span></a></div></article>`).join('')}</div></div></section>`;
}

function renderExpertise(data, locale, pageHref) {
  return `<section id="resources" class="reference-section expertise-showcase section-dark" data-reveal="section"><div class="container"><div class="reference-heading light"><div><p class="kicker">03 / ${escapeHtml(data.sectionLabels.resources)}</p><h2>${locale === 'zh-cn' ? '让每一次决策，<br><em>都有工程依据。</em>' : locale === 'ru' ? 'Инженерные знания<br><em>для следующего шага.</em>' : 'Engineering knowledge<br><em>for the next decision.</em>'}</h2></div><p>${escapeHtml(data.contactText)}</p></div><div class="expertise-grid">${getListItems(locale, 'resources').map((detail, index) => `<article class="expertise-card" data-reveal="card"><span>${escapeHtml(detail.subheading)} · 0${index + 1}</span><h3>${escapeHtml(detail.title)}</h3><p>${escapeHtml(detail.description)}</p><a href="${detailLink(locale, 'resources', detail.slug)}">${escapeHtml(data.ui.read)} <span>↗</span></a></article>`).join('')}</div><div class="event-strip"><span>FIELD NOTES / 2026</span><strong>${escapeHtml(getDetailContent(locale, 'cases', 'cement-dispatch').title)}</strong><a href="${pageHref('cases')}">${escapeHtml(data.nav.cases)} <span>↗</span></a></div></div></section>`;
}

function renderAbout(data) {
  return `<section id="about" class="reference-section about-showcase" data-reveal="section"><div class="container about-layout"><div class="about-copy"><p class="kicker">04 / ${escapeHtml(data.nav.about)}</p><h2>${data.sectionTitles.about}</h2><p>${escapeHtml(data.footer)}</p><p>${escapeHtml(data.aboutBody)}</p><a class="text-link" href="#contact">${escapeHtml(data.nav.contact)} <span>↗</span></a></div><div class="about-faq"><p class="eyebrow">${escapeHtml(data.nav.about)}</p>${data.faq.map(([question, answer]) => `<details><summary>${escapeHtml(question)} <span>+</span></summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></div></section>`;
}

function renderConsultation(data) {
  return `<section id="contact" class="consultation-band"><div class="container consultation-inner"><div><p class="kicker">04 / ${escapeHtml(data.sectionLabels.contact)}</p><h2>${lines(data.contactTitle)}</h2><p>${escapeHtml(data.contactText)}</p></div><div class="consultation-card"><span>${escapeHtml(data.ui.start)}</span><a href="tel:${data.mobile.replace(/[^+\d]/g, '')}">${escapeHtml(data.mobile)}</a><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a><figure class="consultation-wechat"><img src="${escapeHtml(data.wechatQr)}" width="950" height="1295" alt="${escapeHtml(data.wechatAlt)}" loading="lazy"></figure><a class="button button-dark" href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.primaryCta)} <span>↗</span></a></div></div></section>`;
}

function renderShell(locale, data, head, body, pageHref, currentPath) {
  return `<!doctype html><html lang="${data.lang}"><head>${head}</head><body><a class="skip-link" href="#main">${escapeHtml(data.ui.skip)}</a>${renderHeader(locale, data, pageHref, currentPath)}<main id="main">${body}</main>${renderFooter(locale, data, pageHref, currentPath)}<script type="module" src="/assets/app.mjs"></script></body></html>`;
}

export function renderPage(locale) {
  const data = getContent(locale);
  const url = `${siteUrl}/${locale}/`;
  const pageHref = (section) => `/${locale}/${section}/`;
  const head = renderSeoHead({ locale, data, title: data.title, description: data.description, url, image: '/assets/images/hero-industrial-weighing-v1-1280.webp', currentPath: '/', jsonLdText: jsonLd(locale, data) });
  const body = `${renderHeroCarousel(locale, data)}${renderQuickActions(data, locale)}${renderSolutionShowcase(locale, data, pageHref)}${renderSupportShowcase(data)}${renderExpertise(data, locale, pageHref)}${renderAbout(data)}${renderConsultation(data)}`;
  return renderShell(locale, data, head, body, pageHref, '/');
}

function renderListingPageBase(locale, section) {
  const data = getContent(locale);
  const url = `${siteUrl}/${locale}/${section}/`;
  const title = `${data.nav[section]} | ${data.shortName}`;
  const description = `${data.sectionLabels[section]}：${data.contactText}`;
  const pageHref = (item) => `/${locale}/${item}/`;
  const items = getListItems(locale, section).map((detail, index) => `<article class="listing-card"><span class="card-number">0${index + 1}</span><h2>${escapeHtml(detail.title)}</h2><p class="card-subtitle">${escapeHtml(detail.subheading)}</p><p>${escapeHtml(detail.description)}</p><a class="text-link" href="${detailLink(locale, section, detail.slug)}">${escapeHtml(data.ui.read)} <span>↗</span></a></article>`).join('');
  const head = renderSeoHead({ locale, data, title, description, url, image: '/assets/images/hero-industrial-weighing-v1-1280.webp', currentPath: `/${section}/`, jsonLdText: jsonLd(locale, data, { section, collection: true }) });
  const body = `<section class="listing-hero container"><p class="eyebrow">${escapeHtml(data.eyebrow)}</p><h1>${escapeHtml(data.nav[section])}</h1><p>${escapeHtml(description)}</p></section><section class="reference-section container"><div class="listing-grid">${items}</div></section>${renderConsultation(data)}`;
  return renderShell(locale, data, head, body, pageHref, `/${section}/`);
}

export function renderListingPage(locale, section) {
  if (!['products', 'solutions', 'cases', 'resources'].includes(section)) throw new Error(`Unknown listing section: ${section}`);
  return renderListingPageBase(locale, section);
}

export function renderDetailPage(locale, section, slug) {
  const data = getContent(locale);
  const detail = getDetailContent(locale, section, slug);
  const url = `${siteUrl}/${locale}/${section}/${slug}/`;
  const pageHref = (item) => `/${locale}/${item}/`;
  const currentPath = `/${section}/${slug}/`;
  const head = renderSeoHead({ locale, data, title: detail.seoTitle, description: detail.seoDescription, url, image: `${imageStem(detail.image)}-1280.webp`, type: section === 'products' ? 'product' : 'article', currentPath, jsonLdText: jsonLd(locale, data, { section, detail }) });
  const related = getListItems(locale, section).filter((item) => item.slug !== slug).slice(0, 3).map((item) => `<a class="detail-related-link" href="${detailLink(locale, section, item.slug)}"><span>${escapeHtml(item.subheading)}</span><strong>${escapeHtml(item.title)}</strong> <b>↗</b></a>`).join('');
  const body = `<article class="detail-page"><section class="detail-hero container"><div class="detail-hero-copy"><p class="eyebrow">${escapeHtml(data.nav[section])} · ${escapeHtml(detail.subheading)}</p><h1>${escapeHtml(detail.title)}</h1><p class="detail-topic">${escapeHtml(detail.topic)}</p><p>${escapeHtml(detail.intro)}</p><a class="button button-primary" href="/${locale}/#contact">${escapeHtml(data.primaryCta)} <span>↗</span></a></div><div class="detail-hero-media">${responsiveImage(detail.image, detail.title, { priority: true, sizes: '(max-width: 720px) 100vw, 50vw' })}</div></section><section class="detail-content container"><div class="detail-main"><section><p class="kicker">01 / ${escapeHtml(data.ui.stability)}</p><h2>${locale === 'zh-cn' ? '把现场要求转成可执行的工程条件。' : locale === 'ru' ? 'Переводим требования объекта в инженерные условия.' : 'Turn site requirements into an executable engineering brief.'}</h2><ul class="detail-list">${detail.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section><section><p class="kicker">02 / ${escapeHtml(data.sectionLabels.solutions)}</p><h2>${locale === 'zh-cn' ? '适用场景' : locale === 'ru' ? 'Области применения' : 'Typical applications'}</h2><div class="application-grid">${detail.applications.map((item, index) => `<div><span>0${index + 1}</span><strong>${escapeHtml(item)}</strong></div>`).join('')}</div></section><section class="detail-faq"><p class="kicker">03 / FAQ</p>${detail.faq.map(([question, answer]) => `<details><summary>${escapeHtml(question)} <span>+</span></summary><p>${escapeHtml(answer)}</p></details>`).join('')}</section></div><aside class="detail-aside"><div><span>${escapeHtml(data.nav[section])}</span><strong>${escapeHtml(detail.subheading)}</strong><p>${escapeHtml(detail.description)}</p></div><a class="button button-dark" href="/${locale}/#contact">${escapeHtml(data.primaryCta)} <span>↗</span></a></aside></section><section class="detail-related container"><div class="reference-heading"><h2>${escapeHtml(data.nav[section])}</h2><a class="text-link" href="/${locale}/${section}/">${escapeHtml(data.ui.explore)} <span>↗</span></a></div><div class="detail-related-grid">${related}</div></section></article>${renderConsultation(data)}`;
  return renderShell(locale, data, head, body, pageHref, currentPath);
}
