'use client';

import { useLocale } from './useLocale';
import es from '@/i18n/es.json';
import en from '@/i18n/en.json';
import pt from '@/i18n/pt.json';

const messages = { es, en, pt } as const;

type Messages = typeof es;

type DotPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? DotPaths<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

type MessageKey = DotPaths<Messages>;

export function useT() {
  const { locale } = useLocale();

  const resolve = (key: string): string => {
    const parts = key.split('.');
    let value: unknown = messages[locale];
    for (const part of parts) {
      if (typeof value !== 'object' || value === null) return key;
      value = (value as Record<string, unknown>)[part];
    }
    return typeof value === 'string' ? value : key;
  };

  const t = (key: MessageKey): string => resolve(key as string);
  const tDynamic = (key: string): string => resolve(key);

  return { t, tDynamic, locale };
}
