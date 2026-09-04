import { access, readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '..');

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name === 'index.html') files.push(path);
  }
  return files;
}

function pageFileFromUrl(url) {
  const path = new URL(url, 'https://www.balenda.cn').pathname;
  if (path === '/') return join(root, 'index.html');
  const clean = path.replace(/^\//, '').replace(/\/$/, '');
  return join(root, clean, 'index.html');
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

const files = await htmlFiles(root);
const canonicalValues = [];
const titleValues = [];
const descriptionValues = [];
const errors = [];
let detailCount = 0;
let imageReferences = 0;
let missingImages = 0;

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const relativeFile = relative(root, file);
  const h1Count = (html.match(/<h1\b/g) ?? []).length;
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  if (relativeFile !== 'index.html') {
    if (h1Count !== 1) errors.push(`${relativeFile}: expected 1 h1, got ${h1Count}`);
    if (!title || !description || !canonical) errors.push(`${relativeFile}: missing title, description or canonical`);
    if (html.includes('.png')) errors.push(`${relativeFile}: generated HTML still references PNG`);
    if (!html.includes('property="og:title"') || !html.includes('name="twitter:card"')) errors.push(`${relativeFile}: missing social metadata`);
    canonicalValues.push(canonical);
    titleValues.push(title);
    descriptionValues.push(description);
    if (/\/products\/[^/]+\/index\.html$|\/solutions\/[^/]+\/index\.html$|\/cases\/[^/]+\/index\.html$|\/resources\/[^/]+\/index\.html$/.test(relativeFile.replaceAll('\\', '/'))) detailCount += 1;
  }
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (!href.startsWith('/') || href.startsWith('//') || href.includes('#')) continue;
    const target = href.endsWith('/') ? pageFileFromUrl(href) : join(root, href.replace(/^\//, ''));
    if (!await exists(target)) errors.push(`${relativeFile}: broken internal href ${href}`);
  }
  const imageMatches = [...html.matchAll(/\/assets\/images\/[^"'\s>]+\.webp/g)].map((match) => match[0]);
  imageReferences += imageMatches.length;
  for (const image of imageMatches) {
    if (!await exists(join(root, image.replace(/^\//, '')))) { missingImages += 1; errors.push(`${relativeFile}: missing image ${image}`); }
  }
}

const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push('sitemap.xml: duplicate loc values');
if (sitemapUrls.length !== 57) errors.push(`sitemap.xml: expected 57 URLs, got ${sitemapUrls.length}`);

function duplicateCount(values) {
  return values.length - new Set(values).size;
}

const duplicateCanonical = duplicateCount(canonicalValues);
const duplicateTitles = duplicateCount(titleValues);
const duplicateDescriptions = duplicateCount(descriptionValues);
if (duplicateCanonical || duplicateTitles || duplicateDescriptions) errors.push(`duplicate metadata: canonical=${duplicateCanonical}, title=${duplicateTitles}, description=${duplicateDescriptions}`);

process.stdout.write(`SEO pages=${files.length - 1}; details=${detailCount}; canonical=${new Set(canonicalValues).size}; duplicate titles=${duplicateTitles}; duplicate descriptions=${duplicateDescriptions}; missing images=${missingImages}; image references=${imageReferences}\n`);
if (errors.length) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exitCode = 1;
}
