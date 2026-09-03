export const supportedLocales = ['zh-cn', 'en', 'ru'];

const localeAliases = new Map([
  ['zh', 'zh-cn'],
  ['zh-cn', 'zh-cn'],
  ['zh-hans', 'zh-cn'],
  ['en', 'en'],
  ['en-us', 'en'],
  ['en-gb', 'en'],
  ['ru', 'ru'],
  ['ru-ru', 'ru'],
]);

function normalizeLocale(value) {
  if (!value) return null;
  return localeAliases.get(String(value).toLowerCase()) ?? null;
}

export function resolveLocale({ browserLanguages = [], storedLocale = null } = {}) {
  const stored = normalizeLocale(storedLocale);
  if (stored) return stored;

  for (const browserLanguage of browserLanguages) {
    const normalized = normalizeLocale(browserLanguage);
    if (normalized) return normalized;
    const languageOnly = normalizeLocale(String(browserLanguage).split('-')[0]);
    if (languageOnly) return languageOnly;
  }

  return 'zh-cn';
}

export function localePath(locale, pathname = '/') {
  const normalizedLocale = normalizeLocale(locale) ?? 'zh-cn';
  const cleanPath = String(pathname).replace(/^\/(zh-cn|en|ru)(?=\/|$)/, '') || '/';
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `/${normalizedLocale}${normalizedPath === '/' ? '/' : normalizedPath}`;
}

export function localeFromPath(pathname = '/') {
  const match = String(pathname).match(/^\/(zh-cn|en|ru)(?=\/|$)/);
  return match?.[1] ?? 'zh-cn';
}
