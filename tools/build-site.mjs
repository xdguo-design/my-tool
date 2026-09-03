import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { supportedLocales } from '../site/src/i18n.mjs';
import { content, siteUrl } from '../site/src/content.mjs';
import { renderListingPage, renderPage } from '../site/src/template.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteRoot = path.join(root, 'site');

export async function buildSite() {
  await fs.mkdir(path.join(siteRoot, 'assets'), { recursive: true });
  await fs.copyFile(path.join(siteRoot, 'src', 'styles.css'), path.join(siteRoot, 'assets', 'styles.css'));
  await fs.copyFile(path.join(siteRoot, 'src', 'listing.css'), path.join(siteRoot, 'assets', 'listing.css'));
  await fs.copyFile(path.join(siteRoot, 'src', 'mettler.css'), path.join(siteRoot, 'assets', 'mettler.css'));
  await fs.copyFile(path.join(siteRoot, 'src', 'responsive.css'), path.join(siteRoot, 'assets', 'responsive.css'));
  await fs.copyFile(path.join(siteRoot, 'src', 'app.mjs'), path.join(siteRoot, 'assets', 'app.mjs'));
  for (const locale of supportedLocales) {
    const localeRoot = path.join(siteRoot, locale);
    await fs.mkdir(localeRoot, { recursive: true });
    await fs.writeFile(path.join(localeRoot, 'index.html'), renderPage(locale), 'utf8');
    for (const section of ['solutions', 'products', 'cases', 'resources']) {
      const sectionRoot = path.join(localeRoot, section);
      await fs.mkdir(sectionRoot, { recursive: true });
      await fs.writeFile(path.join(sectionRoot, 'index.html'), renderListingPage(locale, section), 'utf8');
    }
  }
  const urls = supportedLocales.flatMap((locale) => [`  <url><loc>${siteUrl}/${locale}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`, ...['solutions', 'products', 'cases', 'resources'].map((section) => `  <url><loc>${siteUrl}/${locale}/${section}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`)]).join('\n');
  await fs.writeFile(path.join(siteRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
  await fs.writeFile(path.join(siteRoot, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`, 'utf8');
  return { siteRoot, locales: Object.keys(content) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await buildSite();
  console.log(`Built ${result.locales.length} locales in ${result.siteRoot}`);
}
