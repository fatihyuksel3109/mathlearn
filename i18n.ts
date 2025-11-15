import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export const locales = routing.locales;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // This will always be a value since the middleware ensures a valid locale
  let locale = await requestLocale;

  // Fallback to default if somehow invalid
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

