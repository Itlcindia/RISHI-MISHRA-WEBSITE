'use client';

import { useLanguage } from '@/context/language-context';
import { translations, TranslationKeys } from '@/content/translations';

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKeys): string => {
    const translationSet = translations[key];
    if (translationSet && typeof translationSet === 'object' && language in translationSet) {
      return (translationSet as any)[language];
    }
    return key;
  };

  return { t, language };
}
