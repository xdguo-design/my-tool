import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { supportedLocales } from './i18n.mjs';
import { detailEntries, siteUrl } from './content.mjs';
import { renderDetailPage, renderListingPage, renderPage } from './template.mjs';

const rootDir = dirname(fileURLToPath(import.meta.url));
const siteDir = join(rootDir, '..');
const sections = ['solutions', 'products', 'cases', 'resources'];
const assetFiles = ['app.mjs', 'styles.css', 'listing.css', 'detail.css', 'mettler.css', 'responsive.css'];

async function writePage(relativePath, html) {
  const target = join(siteDir, relativePath, 'index.html');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, 'utf8');
}

function sitemapXml(urls) {
  const entries = urls.map((url, index) => `  <url><loc>${url}</loc><changefreq>${index < 3 ? 'weekly' : 'monthly'}</changefreq><priority>${index < 3 ? '1.0' : '0.8'}</priority></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

export async function buildSite() {
  await Promise.all(assetFiles.map((file) => copyFile(join(rootDir, file), join(siteDir, 'assets', file))));
  const urls = [];
  for (const locale of supportedLocales) {
    await writePage(locale, renderPage(locale));
    urls.push(`${siteUrl}/${locale}/`);
    for (const section of sections) {
      await writePage(`${locale}/${section}`, renderListingPage(locale, section));
      urls.push(`${siteUrl}/${locale}/${section}/`);
    }
    for (const { section, slug } of detailEntries) {
      await writePage(`${locale}/${section}/${slug}`, renderDetailPage(locale, section, slug));
      urls.push(`${siteUrl}/${locale}/${section}/${slug}/`);
    }
  }
  const uniqueUrls = [...new Set(urls)];
  if (uniqueUrls.length !== urls.length) throw new Error('Duplicate canonical URL generated');
  await writeFile(join(siteDir, 'sitemap.xml'), sitemapXml(uniqueUrls), 'utf8');
  await writeFile(join(siteDir, 'index.html'), '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>倍朗达自动化</title><link rel="canonical" href="https://www.balenda.cn/zh-cn/"></head><body><p><a href="/zh-cn/">进入倍朗达自动化官网</a></p></body></html>\n', 'utf8');
  return { pageCount: urls.length, sitemapCount: uniqueUrls.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = await buildSite();
  process.stdout.write(`Built ${result.pageCount} pages and ${result.sitemapCount} sitemap URLs.\n`);
}
