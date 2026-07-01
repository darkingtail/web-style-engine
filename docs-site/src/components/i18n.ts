export type DocsLocale = 'en' | 'zh-cn'

export function isZh(locale?: DocsLocale) {
  return locale === 'zh-cn'
}
