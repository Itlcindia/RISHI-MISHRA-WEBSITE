'use client';

import { useLanguage } from '@/context/language-context';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2 hover:bg-white/20 hover:text-inherit">
      <Globe className="h-4 w-4" />
      <span className="font-medium">
        {language === 'en' ? 'हिन्दी' : 'English'}
      </span>
    </Button>
  );
}
