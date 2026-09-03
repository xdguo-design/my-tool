import { localePath, supportedLocales } from './i18n.mjs';
import { getContent, siteUrl } from './content.mjs';

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const lines = (value) => escapeHtml(value).replaceAll('\n', '<br>');
const temporaryImages = [
  '/assets/images/solution-steel-v1.png',
  '/assets/images/solution-cement-v1.png',
  '/assets/images/solution-port-v1.png',
  '/assets/images/solution-power-v1.png',
  '/assets/images/product-batching-v1.png',
  '/assets/images/product-weighing-control-v1.png',
  '/assets/images/case-loading-terminal-v1.png',
  '/assets/images/hero-industrial-weighing-v1.png',
];

function jsonLd(locale, data) {
  const url = `${siteUrl}/${locale}/`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: data.name, url: siteUrl, email: data.email, telephone: data.phone, address: { '@type': 'PostalAddress', streetAddress: data.address, addressCountry: 'CN' } },
      { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: data.shortName, url: siteUrl, inLanguage: data.lang, publisher: { '@id': `${siteUrl}/#organization` } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: data.nav.products, item: `${siteUrl}/${locale}/#products` }] },
      ...data.products.map(([name, english, description]) => ({ '@type': 'Product', name, alternateName: english, description, brand: { '@type': 'Brand', name: data.shortName }, url: `${url}#products` })),
    ],
  }, null, 2);
}

function renderLanguageLinks(locale, currentPath = '/') {
  return supportedLocales.map((item) => `<a class="language-link${item === locale ? ' is-active' : ''}" href="${localePath(item, currentPath)}" hreflang="${getContent(item).lang}" lang="${getContent(item).lang}">${escapeHtml(getContent(item).localeLabel)}</a>`).join('');
}

function renderHeader(locale, data, pageHref) {
  const navItems = [
    ['products', data.nav.products],
    ['solutions', data.nav.solutions],
    ['services', data.nav.services],
    ['resources', data.nav.resources],
    ['about', data.nav.about],
  ];
  return `<header class="site-header"><div class="utility-bar"><div class="container utility-inner"><span>${escapeHtml(data.ui.start)} · ${escapeHtml(data.ui.referenceNote)}</span><div><a href="${pageHref('resources')}">${escapeHtml(data.nav.resources)}</a><a href="${pageHref('cases')}">${escapeHtml(data.nav.cases)}</a><a href="/${locale}/#support">${escapeHtml(data.nav.services)}</a></div></div></div><div class="container main-nav"><a class="brand" href="/${locale}/" aria-label="${escapeHtml(data.name)}"><span class="brand-mark">B</span><span>${escapeHtml(data.shortName)}</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">☰ <span>${escapeHtml(data.ui.menu)}</span></button><nav id="primary-nav" class="primary-nav" aria-label="Primary navigation">${navItems.map(([section, label]) => `<a href="${section === 'about' ? `/${locale}/#about` : section === 'services' ? `/${locale}/#support` : pageHref(section)}">${escapeHtml(label)}</a>`).join('')}<a class="nav-cta" href="/${locale}/#contact">${escapeHtml(data.nav.contact)} <span>↗</span></a></nav><div class="header-tools"><a class="search-link" href="/${locale}/#resources" aria-label="Search">⌕</a><div class="language-switcher" aria-label="Language switcher">${renderLanguageLinks(locale)}</div></div></div></header>`;
}

function renderFooter(locale, data, pageHref) {
  const groups = [
    [data.nav.products, data.products.slice(0, 3).map(([title]) => [title, pageHref('products')])],
    [data.nav.solutions, [[data.nav.solutions, pageHref('solutions')], [data.nav.cases, pageHref('cases')], [data.nav.services, '#support']]],
    [data.nav.resources, [[data.nav.resources, pageHref('resources')], [data.ui.read, '#resources'], [data.ui.start, '#contact']]],
    [data.nav.about, [[data.nav.about, '#about'], [data.nav.contact, '#contact'], [data.localeLabel, `/${locale}/`]]],
  ];
  return `<footer class="site-footer"><div class="container footer-groups"><div class="footer-intro"><a class="brand" href="/${locale}/"><span class="brand-mark">B</span><span>${escapeHtml(data.shortName)}</span></a><p>${escapeHtml(data.footer)}</p></div>${groups.map(([title, links]) => `<div class="footer-group"><h3>${escapeHtml(title)}</h3>${links.map(([label, href]) => `<a href="${href}">${escapeHtml(label)}</a>`).join('')}</div>`).join('')}</div><div class="container footer-bottom"><span>© 2026 Balenda Automation</span><div class="footer-languages">${renderLanguageLinks(locale)}</div><span>${escapeHtml(data.ui.footerTag)}</span></div></footer>`;
}

function renderHeroCarousel(locale, data) {
  const carouselLabel = locale === 'zh-cn' ? '首页重点内容' : locale === 'ru' ? 'Основные материалы' : 'Featured solutions';
  return `<section class="reference-hero"><div class="container"><div class="hero-carousel" role="region" aria-roledescription="carousel" aria-label="${carouselLabel}" data-carousel><div class="hero-slides">${data.heroSlides.map((slide, index) => `<article class="hero-slide${index === 0 ? ' is-active' : ''}" data-carousel-slide="${index}" aria-hidden="${index === 0 ? 'false' : 'true'}"><div class="hero-slide-copy"><p class="eyebrow">${escapeHtml(slide.eyebrow)}</p><h1>${lines(slide.title)}</h1><p>${escapeHtml(slide.text)}</p><a class="button button-primary" href="/${locale}/#${index === 0 ? 'solutions' : index === 1 ? 'products' : 'cases'}">${escapeHtml(slide.cta)} <span>↗</span></a></div><div class="hero-slide-media"><img src="${escapeHtml(slide.image)}" alt="${escapeHtml(slide.alt)}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}><span class="hero-slide-index">0${index + 1} / 03</span></div></article>`).join('')}</div></div></div></section>`;
}

function renderQuickActions(data, locale, pageHref) {
  return `<section class="quick-actions container" aria-labelledby="quick-actions-title"><div class="section-mini-heading"><p class="kicker">00 / ${escapeHtml(data.nav.services)}</p><h2 id="quick-actions-title">${locale === 'zh-cn' ? '从一个问题开始。' : locale === 'ru' ? 'Начните с задачи.' : 'Start with one question.'}</h2></div><div class="quick-action-grid">${data.quickActions.map(([title, description, href], index) => `<a class="quick-action" href="${href.startsWith('/') ? href : `/${locale}/${href}`}" data-reveal="card"><span>0${index + 1}</span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)}</small><b>↗</b></a>`).join('')}</div></section>`;
}

function renderSolutionShowcase(locale, data, pageHref) {
  const solutionCards = data.solutions.map(([title, subtitle, description], index) => ({ title, subtitle, description, label: data.nav.solutions, image: temporaryImages[index % temporaryImages.length], href: `${pageHref('solutions')}#${index + 1}` }));
  const productCards = data.products.slice(0, 4).map(([title, english, description], index) => ({ title, subtitle: english, description, label: data.nav.products, image: temporaryImages[(index + data.solutions.length) % temporaryImages.length], href: `${pageHref('products')}#${index + 1}` }));
  return `<section id="solutions" class="reference-section solution-showcase" data-reveal="section"><div class="container"><div class="reference-heading"><div><p class="kicker">01 / ${escapeHtml(data.sectionLabels.solutions)}</p><h2>${locale === 'zh-cn' ? '找到适合现场的<br><em>测量与控制方案。</em>' : locale === 'ru' ? 'Решение для<br><em>вашего процесса.</em>' : 'Find the right<br><em>solution for your process.</em>'}</h2></div><a class="text-link" href="${pageHref('solutions')}">${escapeHtml(data.ui.explore)} <span>↗</span></a></div><div class="showcase-grid">${[...solutionCards, ...productCards].map((card, index) => `<article class="showcase-card" data-reveal="card"><div class="showcase-media"><img src="${card.image}" alt="${escapeHtml(card.title)}" loading="lazy"><span>${escapeHtml(card.label)}</span><strong>0${index + 1}</strong></div><div class="showcase-body"><h3>${escapeHtml(card.title)}</h3><p class="card-subtitle">${escapeHtml(card.subtitle)}</p><p>${escapeHtml(card.description)}</p><a href="${card.href}">${escapeHtml(data.ui.explore)} <span>↗</span></a></div></article>`).join('')}</div></div></section>`;
}

function renderSupportShowcase(data, pageHref) {
  return `<section id="support" class="reference-section support-showcase section-tint" data-reveal="section"><div class="container"><div class="reference-heading"><div><p class="kicker">02 / ${escapeHtml(data.nav.services)}</p><h2>${data.sectionTitles.about}</h2></div><a class="text-link" href="#contact">${escapeHtml(data.ui.start)} <span>↗</span></a></div><div class="support-grid">${data.supportItems.map(([title, description, type, image], index) => `<article class="support-card" data-reveal="card"><div class="support-media"><img src="${image}" alt="${escapeHtml(title)}" loading="lazy"><span>${escapeHtml(type)}</span></div><div class="support-body"><span>0${index + 1}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><a href="#contact">${escapeHtml(data.ui.read)} <span>↗</span></a></div></article>`).join('')}</div></div></section>`;
}

function renderExpertise(data, locale, pageHref) {
  return `<section id="resources" class="reference-section expertise-showcase section-dark" data-reveal="section"><div class="container"><div class="reference-heading light"><div><p class="kicker">03 / ${escapeHtml(data.sectionLabels.resources)}</p><h2>${locale === 'zh-cn' ? '让每一次决策，<br><em>都有工程依据。</em>' : locale === 'ru' ? 'Инженерные знания<br><em>для следующего шага.</em>' : 'Engineering knowledge<br><em>for the next decision.</em>'}</h2></div><p>${escapeHtml(data.contactText)}</p></div><div class="expertise-grid">${data.resources.map(([title, description, type], index) => `<article class="expertise-card" data-reveal="card"><span>${escapeHtml(type)} · 0${index + 1}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><a href="#contact">${escapeHtml(data.ui.read)} <span>↗</span></a></article>`).join('')}</div><div class="event-strip"><span>FIELD NOTES / 2026</span><strong>${escapeHtml(data.cases[0][1])}</strong><a href="${pageHref('cases')}">${escapeHtml(data.nav.cases)} <span>↗</span></a></div></div></section>`;
}

function renderAbout(data) {
  return `<section id="about" class="reference-section about-showcase" data-reveal="section"><div class="container about-layout"><div class="about-copy"><p class="kicker">04 / ${escapeHtml(data.nav.about)}</p><h2>${data.sectionTitles.about}</h2><p>${escapeHtml(data.footer)}</p><p>${escapeHtml(data.aboutBody)}</p><a class="text-link" href="#contact">${escapeHtml(data.nav.contact)} <span>↗</span></a></div><div class="about-faq"><p class="eyebrow">${escapeHtml(data.nav.about)}</p>${data.faq.map(([question, answer]) => `<details><summary>${escapeHtml(question)} <span>+</span></summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></div></section>`;
}

function renderConsultation(data, locale) {
  return `<section id="contact" class="consultation-band"><div class="container consultation-inner"><div><p class="kicker">04 / ${escapeHtml(data.sectionLabels.contact)}</p><h2>${lines(data.contactTitle)}</h2><p>${escapeHtml(data.contactText)}</p></div><div class="consultation-card"><span>${escapeHtml(data.ui.start)}</span><a href="tel:${data.phone.replace(/[^+\d]/g, '')}">${escapeHtml(data.phone)}</a><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a><a class="button button-dark" href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.primaryCta)} <span>↗</span></a></div></div></section>`;
}

export function renderPage(locale) {
  const data = getContent(locale);
  const url = `${siteUrl}/${locale}/`;
  const pageHref = (section) => `/${locale}/${section}/`;
  return `<!doctype html><html lang="${data.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(data.title)}</title><meta name="description" content="${escapeHtml(data.description)}"><link rel="canonical" href="${url}">${supportedLocales.map((item) => `<link rel="alternate" hreflang="${getContent(item).lang}" href="${siteUrl}/${item}/">`).join('')}<link rel="alternate" hreflang="x-default" href="${siteUrl}/zh-cn/"><link rel="stylesheet" href="/assets/styles.css"><link rel="stylesheet" href="/assets/listing.css"><link rel="stylesheet" href="/assets/mettler.css"><link rel="stylesheet" href="/assets/responsive.css"><script type="application/ld+json">${jsonLd(locale, data)}</script></head><body><a class="skip-link" href="#main">${escapeHtml(data.ui.skip)}</a>${renderHeader(locale, data, pageHref)}<main id="main">${renderHeroCarousel(locale, data)}${renderQuickActions(data, locale, pageHref)}${renderSolutionShowcase(locale, data, pageHref)}${renderSupportShowcase(data, pageHref)}${renderExpertise(data, locale, pageHref)}${renderAbout(data)}${renderConsultation(data, locale)}</main>${renderFooter(locale, data, pageHref)}<script type="module" src="/assets/app.mjs"></script></body></html>`;
}

function renderListingPageBase(locale, section) {
  const data = getContent(locale);
  const url = `${siteUrl}/${locale}/${section}/`;
  const title = `${data.nav[section]} | ${data.shortName}`;
  const description = `${data.sectionLabels[section]}. ${data.description}`;
  const pageHref = (item) => `/${locale}/${item}/`;
  const pageData = section === 'solutions' ? data.solutions : section === 'products' ? data.products : section === 'cases' ? data.cases : data.resources;
  const items = pageData.map((item, index) => {
    const values = section === 'cases' ? item.slice(1) : item;
    const [heading, subheading, detail] = values;
    return `<article class="listing-card"><span class="card-number">0${index + 1}</span><h2>${escapeHtml(heading)}</h2><p class="card-subtitle">${escapeHtml(subheading ?? '')}</p><p>${escapeHtml(detail ?? '')}</p><a class="text-link" href="/${locale}/#contact">${escapeHtml(data.primaryCta)} <span>↗</span></a></article>`;
  }).join('');
  const listingJsonLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url, isPartOf: { '@type': 'WebSite', url: siteUrl }, breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: data.shortName, item: `${siteUrl}/${locale}/` }, { '@type': 'ListItem', position: 2, name: data.nav[section], item: url }] } }, null, 2);
  return `<!doctype html><html lang="${data.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${url}">${supportedLocales.map((item) => `<link rel="alternate" hreflang="${getContent(item).lang}" href="${siteUrl}/${item}/${section}/">`).join('')}<link rel="alternate" hreflang="x-default" href="${siteUrl}/zh-cn/${section}/"><link rel="stylesheet" href="/assets/styles.css"><link rel="stylesheet" href="/assets/listing.css"><link rel="stylesheet" href="/assets/mettler.css"><link rel="stylesheet" href="/assets/responsive.css"><script type="application/ld+json">${listingJsonLd}</script></head><body><a class="skip-link" href="#main">${escapeHtml(data.ui.skip)}</a>${renderHeader(locale, data, pageHref)}<main id="main"><section class="listing-hero container"><p class="eyebrow">${escapeHtml(data.eyebrow)}</p><h1>${escapeHtml(data.nav[section])}</h1><p>${escapeHtml(data.sectionLabels[section])}. ${escapeHtml(data.contactText)}</p></section><section class="reference-section container"><div class="listing-grid">${items}</div></section>${renderConsultation(data, locale)}</main>${renderFooter(locale, data, pageHref)}<script type="module" src="/assets/app.mjs"></script></body></html>`;
}

export function renderListingPage(locale, section) {
  return renderListingPageBase(locale, section);
}
