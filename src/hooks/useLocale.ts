'use client';

import { useState, useEffect } from 'react';

type Locale = 'es' | 'en' | 'pt';

export function useLocale() {
  const [locale, setLocale] = useState<Locale>('es');

  useEffect(() => {
    const stored = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as Locale | undefined;
    if (stored === 'en' || stored === 'es' || stored === 'pt') setLocale(stored);
  }, []);

  const toggle = () => {
    const next: Locale = locale === 'es' ? 'en' : (locale === 'en' ? 'pt' : 'es');
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    setLocale(next);
    window.location.reload();
  };

  return { locale, toggle, isEnglish: locale === 'en', isPortuguese: locale === 'pt' };
}
